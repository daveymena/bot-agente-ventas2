import "dotenv/config";
import { db, productsTable } from "../lib/db/src/index.js";
import { eq } from "drizzle-orm";

async function addMissingMegapacks() {
  console.log("🚀 Agregando 36 megapacks faltantes...\n");

  const missingMegapacks = [
    { name: "Mega Pack 41", price: 20000 },
    { name: "Mega Pack 42", price: 20000 },
    { name: "Mega Pack 43", price: 20000 },
    { name: "Mega Pack 44", price: 20000 },
    { name: "Mega Pack 45", price: 20000 },
    { name: "Mega Pack 46", price: 20000 },
    { name: "Mega Pack 47", price: 20000 },
    { name: "Mega Pack 48", price: 20000 },
    { name: "Mega Pack 49", price: 20000 },
    { name: "Mega Pack 50", price: 20000 },
    { name: "Mega Pack 51", price: 20000 },
    { name: "Mega Pack 52", price: 20000 },
    { name: "Mega Pack 53", price: 20000 },
    { name: "Mega Pack 54", price: 20000 },
    { name: "Mega Pack 55", price: 20000 },
    { name: "Mega Pack 56", price: 20000 },
    { name: "Mega Pack 57", price: 20000 },
    { name: "Mega Pack 58", price: 20000 },
    { name: "Mega Pack 59", price: 20000 },
    { name: "Mega Pack 60", price: 20000 },
    { name: "Mega Pack 61", price: 20000 },
    { name: "Mega Pack 62", price: 20000 },
    { name: "Mega Pack 63", price: 20000 },
    { name: "Mega Pack 64", price: 20000 },
    { name: "Mega Pack 65", price: 20000 },
    { name: "Mega Pack 66", price: 20000 },
    { name: "Mega Pack 67", price: 20000 },
    { name: "Mega Pack 68", price: 20000 },
    { name: "Mega Pack 69", price: 20000 },
    { name: "Mega Pack 70", price: 20000 },
    { name: "Mega Pack 71", price: 20000 },
    { name: "Mega Pack 72", price: 20000 },
    { name: "Mega Pack 73", price: 20000 },
    { name: "Mega Pack 74", price: 20000 },
    { name: "Mega Pack 75", price: 20000 },
    { name: "Mega Pack 76", price: 20000 },
    { name: "Mega Pack 77", price: 20000 },
    { name: "Mega Pack 78", price: 20000 },
    { name: "Mega Pack 79", price: 20000 },
    { name: "Mega Pack 80 Completo", price: 60000 },
    { name: "Plan Mega Pack", price: 60000 },
    { name: "Mega Pack 81", price: 20000 },
  ];

  try {
    console.log(`📦 Insertando ${missingMegapacks.length} megapacks...\n`);

    for (const pack of missingMegapacks) {
      try {
        const exists = await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.name, pack.name));

        if (exists.length === 0) {
          await db.insert(productsTable).values({
            name: pack.name,
            price: pack.price,
            stock: 999,
            category: "Mega Pack",
            brand: "Educación",
            description: `${pack.name} - Colección de cursos completa`,
            isActive: true,
          });
          console.log(
            `✅ ${pack.name}: ${pack.price.toLocaleString("es-CO")} COP`,
          );
        } else {
          console.log(`⏭️  ${pack.name} ya existe en BD`);
        }
      } catch (err) {
        console.error(`❌ Error insertando ${pack.name}:`, err.message);
      }
    }

    const allMegapacks = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.category, "Mega Pack"));

    console.log(`\n✨ Total de Mega Packs en BD: ${allMegapacks.length}`);
    console.log("🎉 ¡Migración completada!");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addMissingMegapacks();
