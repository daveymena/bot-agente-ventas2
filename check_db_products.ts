import { db } from "./lib/db/src/index.js";
import { productsTable } from "./lib/db/src/schema/products.js";
import { eq } from "drizzle-orm";

async function checkProducts() {
  console.log("🔍 VERIFICANDO PRODUCTOS EN LA BASE DE DATOS\n");

  try {
    // Obtener todos los productos
    const allProducts = await db.select().from(productsTable);

    console.log(`📊 Total de productos: ${allProducts.length}\n`);

    if (allProducts.length === 0) {
      console.log("⚠️  NO HAY PRODUCTOS EN LA BASE DE DATOS");
      console.log("\n💡 Solución:");
      console.log("1. Accede al dashboard");
      console.log("2. Crea productos manualmente, O");
      console.log("3. Usa la API para importar: POST /api/products/import\n");
      return;
    }

    // Mostrar productos activos vs inactivos
    const activeProducts = allProducts.filter((p) => p.isActive);
    const inactiveProducts = allProducts.filter((p) => !p.isActive);

    console.log(`✅ Productos ACTIVOS: ${activeProducts.length}`);
    console.log(`❌ Productos INACTIVOS: ${inactiveProducts.length}\n`);

    // Mostrar detalles de productos
    console.log("📋 LISTA DE PRODUCTOS:\n");
    allProducts.forEach((p, i) => {
      const status = p.isActive ? "✅" : "❌";
      console.log(`${i + 1}. ${status} ${p.name}`);
      console.log(`   ID: ${p.id} | Precio: $${p.price} | Stock: ${p.stock}`);
      console.log(`   Categoría: ${p.category} | Marca: ${p.brand || "N/A"}\n`);
    });

    // Buscar específicamente por "piano"
    const pianoProducts = allProducts.filter(
      (p) => p.name.toLowerCase().includes("piano") && p.isActive,
    );

    if (pianoProducts.length > 0) {
      console.log("🎹 PRODUCTOS CON 'PIANO':\n");
      pianoProducts.forEach((p) => {
        console.log(`✅ ${p.name} - $${p.price}`);
      });
    } else {
      console.log("⚠️  NO HAY PRODUCTOS CON 'PIANO' ACTIVOS\n");
    }
  } catch (err) {
    console.error("❌ Error conectando a la BD:", err);
    console.log("\n💡 Verifica que:");
    console.log("- DATABASE_URL está configurado correctamente");
    console.log("- PostgreSQL está corriendo");
    console.log("- La BD 'whatsappdb' existe");
  }

  process.exit(0);
}

checkProducts().catch(console.error);
