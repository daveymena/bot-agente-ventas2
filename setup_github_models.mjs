import { db, aiProvidersTable } from './lib/db/dist/index.js';
import { eq } from 'drizzle-orm';

// Token de GitHub Models - Reemplaza con el tuyo si es necesario
const token = "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";
const model = "gpt-4o";
const baseUrl = "https://models.inference.ai.azure.com";

async function setupGitHubModels() {
  try {
    console.log("🔧 Configurando GitHub Models...\n");
    
    // Set all other providers as not default
    await db.update(aiProvidersTable).set({ isDefault: false });
    console.log("✓ Otros proveedores desactivados");

    const existing = await db.query.aiProvidersTable.findFirst({
      where: eq(aiProvidersTable.provider, "github_models"),
    });

    const data = {
      name: "GitHub Models (Free Beta)",
      provider: "github_models",
      apiKey: token,
      baseUrl: baseUrl,
      model: model,
      isActive: true,
      isDefault: true,
    };

    if (existing) {
      console.log("✓ Actualizando proveedor existente...");
      await db.update(aiProvidersTable).set(data).where(eq(aiProvidersTable.id, existing.id));
    } else {
      console.log("✓ Creando nuevo proveedor...");
      await db.insert(aiProvidersTable).values(data);
    }
    
    console.log("\n✅ GitHub Models configurado correctamente!");
    console.log(`   Proveedor: ${data.name}`);
    console.log(`   Modelo: ${model}`);
    console.log(`   Base URL: ${baseUrl}`);
    
  } catch (err) {
    console.error("❌ Error configurando proveedor:", err.message);
  } finally {
    process.exit(0);
  }
}

setupGitHubModels();
