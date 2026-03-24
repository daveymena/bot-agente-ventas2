import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:6715320D@164.68.122.5:6433/whatsappdb?sslmode=disable"
});

async function checkAllTables() {
  try {
    console.log("\n🔍 BÚSQUEDA DE TODOS LOS DATOS EN BD\n");
    console.log("=".repeat(80));
    
    // 1. Listar todas las tablas
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📋 TABLAS EN LA BD:`);
    tables.rows.forEach((t: any) => {
      console.log(`   • ${t.table_name}`);
    });
    
    // 2. Buscar productos con "megapack" en TODAS las tablas
    console.log(`\n🔎 BÚSQUEDA DE "MEGAPACK" EN TODAS LAS TABLAS:`);
    
    try {
      const megapacks = await pool.query(`
        SELECT * FROM products 
        WHERE LOWER(name) LIKE '%megapack%'
      `);
      
      if (megapacks.rows.length > 0) {
        console.log(`\n   ✅ ENCONTRADOS EN TABLA 'products':`);
        megapacks.rows.forEach((p: any) => {
          console.log(`   • ${p.name}`);
          console.log(`     - Precio: ${p.price}`);
          console.log(`     - Stock: ${p.stock}`);
        });
      } else {
        console.log(`\n   ❌ NO hay "megapack" en tabla products`);
      }
    } catch (e) {
      console.log(`   ❌ Error en tabla products`);
    }
    
    // 3. Verificar si hay tabla de órdenes o pedidos
    try {
      const orders = await pool.query(`
        SELECT * FROM orders LIMIT 5
      `);
      console.log(`\n   Tabla 'orders' existe, primeros registros:`, orders.rows.length);
    } catch (e) {}
    
    // 4. Buscar referencias a Colombia
    console.log(`\n🇨🇴 BÚSQUEDA DE REFERENCIAS A COLOMBIA:`);
    
    try {
      const colombia = await pool.query(`
        SELECT * FROM products 
        WHERE description LIKE '%Colombia%' OR description LIKE '%COP%'
        LIMIT 5
      `);
      
      if (colombia.rows.length > 0) {
        console.log(`   ✅ Encontrados productos con referencia a Colombia`);
        colombia.rows.forEach((p: any) => {
          console.log(`   • ${p.name}`);
        });
      } else {
        console.log(`   ❌ No hay referencia a Colombia en productos`);
      }
    } catch (e) {}
    
    // 5. Mostrar estructura de tabla products
    console.log(`\n📐 ESTRUCTURA DE TABLA 'products':`);
    const schema = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);
    
    schema.rows.forEach((col: any) => {
      console.log(`   • ${col.column_name} (${col.data_type})`);
    });
    
    // 6. Verificar si hay otros campos de moneda
    console.log(`\n💱 BÚSQUEDA DE CAMPOS DE MONEDA:`);
    const currencyFields = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND (column_name LIKE '%currency%' OR column_name LIKE '%coin%' OR column_name LIKE '%moneda%')
    `);
    
    if (currencyFields.rows.length > 0) {
      console.log(`   Campos encontrados:`);
      currencyFields.rows.forEach((f: any) => {
        console.log(`   • ${f.column_name}`);
      });
    } else {
      console.log(`   ❌ No hay campo de moneda/divisa en tabla products`);
    }
    
    await pool.end();
    
  } catch (error: any) {
    console.error("Error:", error.message);
    await pool.end();
  }
}

checkAllTables();
