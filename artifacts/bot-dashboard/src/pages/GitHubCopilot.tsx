import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Copy, Check, Loader2, ExternalLink, Wifi, WifiOff, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

const BASE = "/api";

const COPILOT_MODELS = ["gpt-4o", "gpt-4o-mini", "claude-3.5-sonnet", "claude-3.7-sonnet", "claude-3.7-sonnet-thought", "gemini-2.0-flash", "o3-mini", "o1"];

type Step = "idle" | "waiting" | "success" | "error";

export default function GitHubCopilot() {
  const [step, setStep] = useState<Step>("idle");
  const [flowId, setFlowId] = useState<string>("");
  const [userCode, setUserCode] = useState<string>("");
  const [verificationUri, setVerificationUri] = useState("https://github.com/login/device");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  useEffect(() => () => stopPolling(), []);

  const startFlow = async () => {
    setStep("idle");
    setMessage("");
    try {
      const r = await fetch(`${BASE}/github-copilot/device-flow`, { method: "POST" });
      const d = await r.json();
      if (d.error) { setStep("error"); setMessage(d.error); return; }
      setFlowId(d.flowId);
      setUserCode(d.userCode);
      setVerificationUri(d.verificationUri || "https://github.com/login/device");
      setStep("waiting");
      startPolling(d.flowId, d.interval || 5);
    } catch {
      setStep("error"); setMessage("Error al conectar con GitHub");
    }
  };

  const startPolling = (fId: string, interval: number) => {
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${BASE}/github-copilot/poll/${fId}`, { method: "POST" });
        const d = await r.json();
        if (d.status === "success") {
          stopPolling(); setPolling(false); setStep("success"); setMessage(d.message || "Conectado exitosamente");
        } else if (d.status === "expired") {
          stopPolling(); setPolling(false); setStep("error"); setMessage("El código expiró. Inténtalo de nuevo.");
        } else if (d.status === "error") {
          stopPolling(); setPolling(false); setStep("error"); setMessage(d.error || "Error de autorización");
        }
        // pending / slow_down: keep polling
      } catch { /* keep polling */ }
    }, interval * 1000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { stopPolling(); setStep("idle"); setFlowId(""); setUserCode(""); setMessage(""); setPolling(false); };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#24292e] border border-white/10 flex items-center justify-center">
          <Github className="text-white" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conectar GitHub Copilot</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Usa los modelos de Copilot (GPT-4o, Claude, Gemini) en tus agentes.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                <p>Haz clic en <span className="text-foreground font-medium">Iniciar Conexión</span> — se genera un código único</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                <p>Visita <span className="font-mono text-xs bg-background border border-border px-2 py-0.5 rounded">github.com/login/device</span> e ingresa el código</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                <p>Autoriza el acceso a GitHub Copilot — el bot se configura automáticamente</p>
              </div>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Modelos disponibles con Copilot:</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {COPILOT_MODELS.map(m => <span key={m} className="bg-background border border-border px-2 py-0.5 rounded-full text-foreground">{m}</span>)}
              </div>
            </div>

            <button onClick={startFlow} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#24292e] text-white font-semibold hover:bg-[#1a1f24] transition-colors border border-white/10">
              <Github size={18} /> Iniciar Conexión con GitHub Copilot
            </button>
          </motion.div>
        )}

        {step === "waiting" && (
          <motion.div key="waiting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#24292e] px-6 py-5 flex items-center gap-3">
              <Github className="text-white" size={20} />
              <span className="text-white font-semibold">Conectar GitHub Copilot</span>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm text-muted-foreground">
                Visita <a href={verificationUri} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 font-medium">este enlace</a> e introduce el código a continuación para conectar tu cuenta y usar modelos de GitHub Copilot.
              </p>

              {/* Code display */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Código de confirmación</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-background border border-border font-mono text-xl tracking-[0.3em] font-bold text-foreground text-center select-all">
                    {userCode}
                  </div>
                  <button onClick={copyCode} className="p-3 rounded-xl bg-secondary border border-border hover:bg-muted transition-colors shrink-0">
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 py-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span>Esperando autorización...</span>
                </div>
                <a href={verificationUri} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1.5 text-xs text-primary hover:underline">
                  Abrir GitHub <ExternalLink size={11} />
                </a>
              </div>

              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-green-500/30 rounded-2xl p-8 text-center space-y-4">
            <CheckCircle2 size={48} className="text-green-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-foreground">¡GitHub Copilot Conectado!</h3>
              <p className="text-muted-foreground text-sm mt-1">{message}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-sm text-green-400">
              Los agentes ahora usarán los modelos de GitHub Copilot por defecto.
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-muted-foreground text-sm hover:text-foreground transition-colors">
                <RefreshCw size={14} /> Reconectar
              </button>
            </div>
          </motion.div>
        )}

        {step === "error" && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
            <XCircle size={48} className="text-red-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Error de Conexión</h3>
              <p className="text-muted-foreground text-sm mt-1">{message}</p>
            </div>
            <button onClick={startFlow} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#24292e] text-white text-sm font-semibold hover:bg-[#1a1f24] transition-colors border border-white/10 mx-auto">
              <RefreshCw size={14} /> Intentar de Nuevo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {step === "idle" && (
        <div className="text-xs text-muted-foreground text-center">
          Requiere una suscripción activa a GitHub Copilot (Individual, Business o Enterprise)
        </div>
      )}
    </div>
  );
}
