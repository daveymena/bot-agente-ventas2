#!/usr/bin/env node

const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

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
    console.log("📡 Conectando a BD...");
    const client = await pool.connect();
    console.log("✅ Conexión exitosa!\n");

    console.log(`📦 Insertando ${missingMegapacks.length} megapacks...\n`);

    for (const pack of missingMegapacks) {
      try {
        const exists = await client.query(
          "SELECT id FROM products WHERE name = $1",
          [pack.name],
        );

        if (exists.rows.length === 0) {
          await client.query(
            `INSERT INTO products (name, price, stock, category, brand, description, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              pack.name,
              pack.price,
              999,
              "Mega Pack",
              "Educación",
              `${pack.name} - Colección de cursos completa`,
              true,
            ],
          );
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

    const result = await client.query(
      `SELECT COUNT(*) as total FROM products WHERE category = 'Mega Pack'`,
    );

    console.log(`\n✨ Total de Mega Packs en BD: ${result.rows[0].total}`);
    console.log("🎉 ¡Migración completada!");

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error de conexión a BD:");
    console.error("Detalles:", error.message);
    await pool.end();
    process.exit(1);
  }
}

addMissingMegapacks();
