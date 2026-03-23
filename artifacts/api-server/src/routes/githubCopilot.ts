import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { aiProvidersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Public GitHub OAuth app client ID used for Copilot access (same as many CLI tools)
const COPILOT_CLIENT_ID = "Iv1.b507a08c87ecfe98";
const COPILOT_SCOPE = "read:user";
const COPILOT_TOKEN_URL = "https://api.github.com/copilot_internal/v2/token";
const COPILOT_BASE_URL = "https://api.githubcopilot.com";

const COPILOT_MODELS = [
  "gpt-4o", "gpt-4o-mini", "claude-3.5-sonnet", "claude-3.7-sonnet",
  "claude-3.7-sonnet-thought", "gemini-2.0-flash", "o3-mini", "o1",
];

// Store pending device flows in memory (short-lived)
const pendingFlows = new Map<string, { deviceCode: string; accessToken?: string; copilotToken?: string; expiresAt: Date }>();

router.post("/github-copilot/device-flow", async (req, res) => {
  try {
    const response = await fetch("https://github.com/login/device/code", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: COPILOT_CLIENT_ID, scope: COPILOT_SCOPE }),
    });
    const data = await response.json() as Record<string, string>;
    if (data.error) { res.status(400).json({ error: data.error_description || data.error }); return; }
    const flowId = Math.random().toString(36).slice(2);
    pendingFlows.set(flowId, {
      deviceCode: data.device_code,
      expiresAt: new Date(Date.now() + (data.expires_in ? parseInt(data.expires_in) * 1000 : 900000)),
    });
    res.json({
      flowId,
      userCode: data.user_code,
      verificationUri: data.verification_uri || "https://github.com/login/device",
      expiresIn: data.expires_in,
      interval: data.interval || 5,
    });
  } catch (err) {
    req.log.error({ err }, "Copilot device flow failed");
    res.status(500).json({ error: "Error iniciando flujo de autorización con GitHub" });
  }
});

router.post("/github-copilot/poll/:flowId", async (req, res) => {
  const flow = pendingFlows.get(req.params.flowId);
  if (!flow) { res.status(404).json({ error: "Flow not found or expired" }); return; }
  if (new Date() > flow.expiresAt) { pendingFlows.delete(req.params.flowId); res.json({ status: "expired" }); return; }

  try {
    // Poll for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: COPILOT_CLIENT_ID, device_code: flow.deviceCode, grant_type: "urn:ietf:params:oauth:grant-type:device_code" }),
    });
    const tokenData = await tokenResponse.json() as Record<string, string>;

    if (tokenData.error === "authorization_pending") { res.json({ status: "pending" }); return; }
    if (tokenData.error === "slow_down") { res.json({ status: "slow_down" }); return; }
    if (tokenData.error) { res.json({ status: "error", error: tokenData.error_description || tokenData.error }); return; }

    if (!tokenData.access_token) { res.json({ status: "pending" }); return; }

    // Exchange GitHub token for Copilot token
    const copilotResponse = await fetch(COPILOT_TOKEN_URL, {
      headers: { Authorization: `token ${tokenData.access_token}`, "Editor-Version": "vscode/1.85.0", "Editor-Plugin-Version": "copilot/1.138.0", "User-Agent": "GithubCopilot/1.138.0" },
    });

    if (!copilotResponse.ok) {
      res.json({ status: "error", error: "No se pudo obtener token de Copilot. ¿Tienes suscripción a GitHub Copilot?" }); return;
    }

    const copilotData = await copilotResponse.json() as { token: string; expires_at: number };
    if (!copilotData.token) { res.json({ status: "error", error: "Token de Copilot inválido" }); return; }

    // Save as AI provider
    await db.update(aiProvidersTable).set({ isDefault: false });
    const existing = await db.query.aiProvidersTable.findFirst({
      where: eq(aiProvidersTable.provider, "github_copilot"),
    });

    const providerData = {
      name: "GitHub Copilot",
      provider: "github_copilot",
      apiKey: copilotData.token,
      baseUrl: COPILOT_BASE_URL,
      model: "gpt-4o",
      isActive: true,
      isDefault: true,
    };

    if (existing) {
      await db.update(aiProvidersTable).set(providerData).where(eq(aiProvidersTable.id, existing.id));
    } else {
      await db.insert(aiProvidersTable).values(providerData);
    }

    pendingFlows.delete(req.params.flowId);
    res.json({ status: "success", message: "GitHub Copilot conectado y configurado como proveedor predeterminado" });
  } catch (err) {
    req.log.error({ err }, "Copilot poll failed");
    res.status(500).json({ status: "error", error: String(err) });
  }
});

router.get("/github-copilot/models", (_req, res) => {
  res.json({ models: COPILOT_MODELS });
});

router.post("/github-copilot/refresh-token", async (req, res) => {
  const { githubToken } = req.body;
  if (!githubToken) { res.status(400).json({ error: "githubToken required" }); return; }
  try {
    const r = await fetch(COPILOT_TOKEN_URL, {
      headers: { Authorization: `token ${githubToken}`, "Editor-Version": "vscode/1.85.0", "User-Agent": "GithubCopilot/1.138.0" },
    });
    if (!r.ok) { res.status(400).json({ error: "No se pudo refrescar el token" }); return; }
    const data = await r.json() as { token: string };
    res.json({ token: data.token });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
