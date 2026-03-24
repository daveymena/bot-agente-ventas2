import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:6715320D@164.68.122.5:6433/whatsappdb?sslmode=disable"
});

async function migrateRealProducts() {
  try {
    console.log("\n🚀 MIGRACIÓN DE PRODUCTOS REALES\n");
    console.log("=".repeat(80));
    
    // 1. Contar productos actuales
    const currentCount = await pool.query(`SELECT COUNT(*) FROM products`);
    console.log(`\n1️⃣ Productos FICTICIOS actuales: ${currentCount.rows[0].count}`);
    
    // 2. Contar productos en backup
    const backupCount = await pool.query(`SELECT COUNT(*) FROM bkp_products_old`);
    console.log(`2️⃣ Productos REALES en backup: ${backupCount.rows[0].count}`);
    
    // 3. Limpiar tabla products
    console.log(`\n3️⃣ LIMPIANDO tabla products...`);
    await pool.query(`DELETE FROM products`);
    console.log(`   ✅ Tabla products limpiada`);
    
    // 4. Migrar datos reales
    console.log(`\n4️⃣ MIGRANDO ${backupCount.rows[0].count} productos REALES...`);
    
    const migrationQuery = `
      INSERT INTO products (name, description, price, category, brand, stock, image_url, is_active, created_at)
      SELECT 
        name,
        description,
        price,
        COALESCE(customCategory, category::text, 'General'),
        COALESCE(store, 'N/A'),
        COALESCE(stock, 1),
        images,
        true,
        CURRENT_TIMESTAMP
      FROM bkp_products_old
      WHERE name IS NOT NULL AND price IS NOT NULL
    `;
    
    const result = await pool.query(migrationQuery);
    console.log(`   ✅ ${result.rowCount} productos migraron exitosamente`);
    
    // 5. Verificar migración
    const newCount = await pool.query(`SELECT COUNT(*) FROM products`);
    console.log(`\n5️⃣ Verificación:`);
    console.log(`   Productos en tabla products ahora: ${newCount.rows[0].count}`);
    
    // 6. Mostrar algunos megapacks migrados
    const megapacks = await pool.query(`
      SELECT name, price, stock, category FROM products
      WHERE LOWER(name) LIKE '%mega%pack%'
      LIMIT 10
    `);
    
    if (megapacks.rows.length > 0) {
      console.log(`\n6️⃣ MEGAPACKS MIGRADOS:`);
      megapacks.rows.forEach((p: any) => {
        console.log(`   • ${p.name}`);
        console.log(`     Precio: ${p.price} COP`);
        console.log(`     Stock: ${p.stock || 'Variable'}`);
      });
    }
    
    // 7. Mostrar estadísticas
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT category) as categorias,
        MIN(price) as precio_minimo,
        MAX(price) as precio_maximo,
        AVG(price)::INT as precio_promedio
      FROM products
    `);
    
    console.log(`\n7️⃣ ESTADÍSTICAS DE PRODUCTOS:`);
    console.log(`   Total: ${stats.rows[0].total}`);
    console.log(`   Categorías: ${stats.rows[0].categorias}`);
    console.log(`   Precio mínimo: ${stats.rows[0].precio_minimo} COP`);
    console.log(`   Precio máximo: ${stats.rows[0].precio_maximo} COP`);
    console.log(`   Precio promedio: ${stats.rows[0].precio_promedio} COP`);
    
    // 8. Mostrar primeros 10 productos
    const first10 = await pool.query(`
      SELECT id, name, price, stock FROM products 
      LIMIT 10
    `);
    
    console.log(`\n8️⃣ PRIMEROS 10 PRODUCTOS MIGRADOS:`);
    first10.rows.forEach((p: any, i: number) => {
      console.log(`   ${i+1}. ${p.name}`);
      console.log(`      Precio: ${p.price} COP | Stock: ${p.stock || 'N/A'}`);
    });
    
    console.log("\n" + "=".repeat(80));
    console.log("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE");
    console.log("=".repeat(80));
    console.log("\n🎉 El bot ahora usará datos REALES de Colombia en pesos colombianos\n");
    
    await pool.end();
    
  } catch (error: any) {
    console.error("\n❌ Error en migración:", error.message);
    await pool.end();
  }
}

migrateRealProducts();
