/**
 * PRUEBA: Cada producto REAL que existe en la BD
 * 
 * Valida que el bot devuelva datos EXACTOS para cada uno
 */

import axios from "axios";

const PRODUCTOS_BD = [
  { name: "Piano Digital 88 Teclas Profesional", expectedPrice: 899.99, expectedStock: 15 },
  { name: "Guitarra Acústica de Madera Maciza", expectedPrice: 349.99, expectedStock: 8 },
  { name: "Ukelele Soprano Concert Series", expectedPrice: 89.99, expectedStock: 25 },
  { name: "Micrófono Condensador USB", expectedPrice: 129.99, expectedStock: 20 },
  { name: "Amplificador de Guitarra 100W", expectedPrice: 449.99, expectedStock: 5 },
];

async function testProducto(producto: any, index: number) {
  console.log(`\n${"═".repeat(80)}`);
  console.log(`📦 Producto ${index + 1}/5: ${producto.name}`);
  console.log(`${"═".repeat(80)}\n`);
  
  try {
    const response = await axios.post(
      "http://localhost:5000/api/chat/message",
      {
        phone: `+3499000000${index}`,
        message: `¿Cuánto cuesta ${producto.name}? ¿Tienen stock?`,
        clientName: `Cliente ${index}`,
      },
      { timeout: 15000 }
    );
    
    const botResponse = response.data.response;
    console.log(`🤖 Respuesta:\n${botResponse}\n`);
    
    // Validar precio exacto
    const priceStr = `$${producto.expectedPrice}`;
    const hasPriceExact = botResponse.includes(priceStr);
    const hasPriceClose = botResponse.includes(`${Math.round(producto.expectedPrice)}`);
    
    // Validar stock
    const hasStockExact = botResponse.includes(`${producto.expectedStock}`);
    
    console.log(`\n✅ VALIDACIONES:`);
    console.log(`   Precio exacto (${priceStr}): ${hasPriceExact ? '✅ SÍ' : hasPriceClose ? '⚠️ APROXIMADO' : '❌ NO'}`);
    console.log(`   Stock exacto (${producto.expectedStock} unidades): ${hasStockExact ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Nombre del producto: ${botResponse.toLowerCase().includes(producto.name.toLowerCase()) ? '✅ SÍ' : '❌ NO'}`);
    
    // Detectar alucinaciones
    const hasUrl = /https?:\/\/[^\s)]+/gi.test(botResponse);
    const hasInventedSpecs = botResponse.includes("Bluetooth") || 
                             botResponse.includes("batería") ||
                             botResponse.includes("garantía");
    
    console.log(`   URLs inventadas: ${hasUrl ? '❌ SÍ' : '✅ NO'}`);
    console.log(`   Especificaciones inventadas: ${hasInventedSpecs ? '❌ SÍ' : '✅ NO'}`);
    
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  // Pausa entre productos
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function main() {
  console.log("\n" + "═".repeat(80));
  console.log("🧪 PRUEBA: CADA PRODUCTO REAL DE LA BD");
  console.log("═".repeat(80));
  
  for (let i = 0; i < PRODUCTOS_BD.length; i++) {
    await testProducto(PRODUCTOS_BD[i], i);
  }
  
  console.log("\n" + "═".repeat(80));
  console.log("📊 RESUMEN FINAL");
  console.log("═".repeat(80));
  console.log(`
  Se validaron todos los productos REALES de la BD.
  
  Si el bot respondió con:
  ✅ Precios exactos ($X.XX)
  ✅ Stock preciso
  ✅ Nombres correctos
  ✅ Sin URLs inventadas
  ✅ Sin características ficticias
  
  Entonces: 🎉 SISTEMA FUNCIONANDO PERFECTAMENTE
  `);
}

main().catch(console.error);
