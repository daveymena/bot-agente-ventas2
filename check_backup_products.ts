import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:6715320D@164.68.122.5:6433/whatsappdb?sslmode=disable"
});

async function checkBackupProducts() {
  try {
    console.log("\n🔄 VERIFICANDO TABLA BACKUP DE PRODUCTOS\n");
    console.log("=".repeat(80));
    
    // 1. Contar productos en backup
    const backupCount = await pool.query(`SELECT COUNT(*) FROM bkp_products_old`);
    console.log(`\n📊 Productos en tabla 'bkp_products_old': ${backupCount.rows[0].count}`);
    
    if (backupCount.rows[0].count > 0) {
      // 2. Mostrar primeros 15
      const backupProducts = await pool.query(`
        SELECT * FROM bkp_products_old LIMIT 15
      `);
      
      console.log(`\n📦 PRIMEROS 15 PRODUCTOS DEL BACKUP:\n`);
      backupProducts.rows.forEach((p: any, i: number) => {
        console.log(`${i+1}. ${p.name || 'N/A'}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Precio: ${p.price} ${p.currency || ''}`);
        console.log(`   Stock: ${p.stock || 'N/A'}`);
        if (p.description) console.log(`   Descripción: ${p.description.substring(0, 50)}...`);
        console.log();
      });
      
      // 3. Buscar megapacks
      const megapacks = await pool.query(`
        SELECT * FROM bkp_products_old 
        WHERE LOWER(name) LIKE '%megapack%'
        LIMIT 10
      `);
      
      if (megapacks.rows.length > 0) {
        console.log(`\n✅ MEGAPACKS ENCONTRADOS EN BACKUP:`);
        megapacks.rows.forEach((p: any) => {
          console.log(`\n• ${p.name}`);
          console.log(`  Precio: ${p.price} ${p.currency || ''}`);
          console.log(`  Stock: ${p.stock}`);
        });
      }
      
      // 4. Buscar productos de Colombia (COP)
      const colombian = await pool.query(`
        SELECT * FROM bkp_products_old 
        WHERE currency = 'COP' OR currency = 'colombiano'
        LIMIT 5
      `);
      
      if (colombian.rows.length > 0) {
        console.log(`\n🇨🇴 PRODUCTOS EN PESOS COLOMBIANOS (COP):`);
        colombian.rows.forEach((p: any) => {
          console.log(`\n• ${p.name}`);
          console.log(`  Precio: ${p.price} COP`);
          console.log(`  Stock: ${p.stock}`);
        });
      }
    }
    
    // 5. Verificar estructura de backup
    const schemaBackup = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'bkp_products_old'
      ORDER BY ordinal_position
    `);
    
    if (schemaBackup.rows.length > 0) {
      console.log(`\n📐 ESTRUCTURA DE 'bkp_products_old':`);
      schemaBackup.rows.forEach((col: any) => {
        console.log(`   • ${col.column_name} (${col.data_type})`);
      });
    }
    
    await pool.end();
    
  } catch (error: any) {
    console.error("Error:", error.message);
    await pool.end();
  }
}

checkBackupProducts();
