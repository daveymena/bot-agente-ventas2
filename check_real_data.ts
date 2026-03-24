import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:6715320D@164.68.122.5:6433/whatsappdb?sslmode=disable"
});

async function checkRealData() {
  try {
    console.log("\n📊 VERIFICACIÓN DE DATOS REALES EN BD\n");
    console.log("=".repeat(80));
    
    // 1. Contar productos
    const productsCount = await pool.query(`SELECT COUNT(*) FROM products`);
    console.log(`\n1️⃣ CANTIDAD DE PRODUCTOS EN BD:`);
    console.log(`   Total: ${productsCount.rows[0].count}`);
    
    // 2. Mostrar primeros 20 productos
    const products = await pool.query(`
      SELECT id, name, price, stock, category, brand, is_active
      FROM products
      LIMIT 20
    `);
    
    console.log(`\n2️⃣ PRIMEROS PRODUCTOS EN BD:`);
    console.log(`${"─".repeat(80)}`);
    products.rows.forEach((p: any, i: number) => {
      console.log(`\n${i+1}. ${p.name}`);
      console.log(`   Precio: ${p.price} (moneda: ?)`);
      console.log(`   Stock: ${p.stock}`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   Marca: ${p.brand || 'N/A'}`);
      console.log(`   Activo: ${p.is_active}`);
    });
    
    // 3. Buscar megapacks
    console.log(`\n3️⃣ BÚSQUEDA DE MEGAPACKS:`);
    const megapacks = await pool.query(`
      SELECT id, name, price, stock FROM products 
      WHERE LOWER(name) LIKE '%megapack%' OR stock > 40
      LIMIT 10
    `);
    
    if (megapacks.rows.length > 0) {
      console.log(`   Encontrados ${megapacks.rows.length} productos con stock > 40 o nombre "megapack":`);
      megapacks.rows.forEach((p: any) => {
        console.log(`   • ${p.name} - Stock: ${p.stock} - Precio: ${p.price}`);
      });
    } else {
      console.log(`   ❌ No hay megapacks en BD`);
    }
    
    // 4. Verificar moneda
    console.log(`\n4️⃣ VERIFICACIÓN DE MONEDA:`);
    const botConfigQuery = await pool.query(`
      SELECT * FROM bot_config LIMIT 1
    `);
    
    if (botConfigQuery.rows.length > 0) {
      console.log(`   Configuración del bot:`);
      console.log(`   ${JSON.stringify(botConfigQuery.rows[0], null, 2)}`);
    }
    
    await pool.end();
    
  } catch (error: any) {
    console.error("Error:", error.message);
    await pool.end();
  }
}

checkRealData();
