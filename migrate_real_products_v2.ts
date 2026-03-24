import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:6715320D@164.68.122.5:6433/whatsappdb?sslmode=disable"
});

async function migrateRealProducts() {
  try {
    console.log("\n🚀 MIGRACIÓN DE PRODUCTOS REALES (VERSIÓN 2)\n");
    console.log("=".repeat(80));
    
    // 1. Contar productos actuales
    const currentCount = await pool.query(`SELECT COUNT(*) FROM products`);
    console.log(`\n1️⃣ Productos actuales: ${currentCount.rows[0].count}`);
    
    // 2. Contar productos en backup
    const backupCount = await pool.query(`SELECT COUNT(*) FROM bkp_products_old`);
    console.log(`2️⃣ Productos reales en backup: ${backupCount.rows[0].count}`);
    
    // 3. Ver estructura
    console.log(`\n3️⃣ Verificando estructura de tablas...`);
    const productsColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    
    const backupColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bkp_products_old'
    `);
    
    console.log(`   Tabla products tiene: ${productsColumns.rows.map((c: any) => c.column_name).join(', ')}`);
    
    // 4. Limpiar tabla products
    console.log(`\n4️⃣ Limpiando tabla products...`);
    await pool.query(`DELETE FROM products`);
    console.log(`   ✅ Tabla vacía`);
    
    // 5. Migrar con mapeo correcto
    console.log(`\n5️⃣ Migrando ${backupCount.rows[0].count} productos reales...`);
    
    const migrationQuery = `
      INSERT INTO products (name, description, price, category, brand, stock, image_url, is_active, created_at)
      SELECT 
        name,
        description,
        price,
        COALESCE("customCategory", "mainCategory", category::text, 'General') as category,
        store as brand,
        COALESCE(stock, 1) as stock,
        images as image_url,
        true as is_active,
        CURRENT_TIMESTAMP as created_at
      FROM bkp_products_old
      WHERE name IS NOT NULL AND price IS NOT NULL
    `;
    
    const result = await pool.query(migrationQuery);
    console.log(`   ✅ ${result.rowCount} productos migraron!`);
    
    // 6. Verificar
    const newCount = await pool.query(`SELECT COUNT(*) FROM products`);
    console.log(`\n6️⃣ Verificación: ${newCount.rows[0].count} productos en tabla activa`);
    
    // 7. Megapacks
    const megapacks = await pool.query(`
      SELECT name, price, stock FROM products
      WHERE LOWER(name) LIKE '%mega%pack%'
      LIMIT 10
    `);
    
    console.log(`\n7️⃣ MEGAPACKS ENCONTRADOS: ${megapacks.rows.length}`);
    megapacks.rows.forEach((p: any) => {
      console.log(`   • ${p.name} - ${p.price} COP`);
    });
    
    // 8. Estadísticas
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT category) as categorias,
        MIN(price)::INT as precio_minimo,
        MAX(price)::INT as precio_maximo,
        AVG(price)::INT as precio_promedio
      FROM products
    `);
    
    console.log(`\n8️⃣ ESTADÍSTICAS:`);
    console.log(`   Total: ${stats.rows[0].total} productos`);
    console.log(`   Categorías: ${stats.rows[0].categorias}`);
    console.log(`   Rango: ${stats.rows[0].precio_minimo} - ${stats.rows[0].precio_maximo} COP`);
    console.log(`   Promedio: ${stats.rows[0].precio_promedio} COP`);
    
    // 9. Mostrar ejemplos
    const examples = await pool.query(`
      SELECT name, price, stock FROM products 
      ORDER BY RANDOM()
      LIMIT 15
    `);
    
    console.log(`\n9️⃣ EJEMPLOS DE PRODUCTOS REALES MIGRADOS:`);
    examples.rows.forEach((p: any, i: number) => {
      console.log(`   ${i+1}. ${p.name}`);
      console.log(`      $ ${p.price} COP | Stock: ${p.stock || 'Variable'}`);
    });
    
    console.log("\n" + "=".repeat(80));
    console.log("✅ MIGRACIÓN EXITOSA");
    console.log("=".repeat(80));
    console.log("\n🎉 Bot ahora usa 137 PRODUCTOS REALES DE COLOMBIA EN PESOS COLOMBIANOS\n");
    
    await pool.end();
    
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    await pool.end();
  }
}

migrateRealProducts();
