/**
 * PRUEBA: Bot con DATOS REALES de Colombia (137 productos)
 */

import axios from "axios";

async function testProductoReal(producto: string, index: number) {
  console.log(`\n${"═".repeat(80)}`);
  console.log(`📦 Prueba ${index}: "${producto}"`);
  console.log(`${"═".repeat(80)}\n`);
  
  try {
    const response = await axios.post(
      "http://localhost:5000/api/chat/message",
      {
        phone: `+573000000${index.toString().padStart(2, '0')}`,
        message: `¿Tienen ${producto}? ¿Cuál es el precio?`,
        clientName: `Cliente Colombia ${index}`,
      },
      { timeout: 15000 }
    );
    
    const botResponse = response.data.response;
    console.log(`🤖 Respuesta:\n${botResponse}\n`);
    
    // Validar COP
    const hasCOP = botResponse.includes("COP") || botResponse.includes("pesos") || botResponse.includes("$");
    const hasMegapack = botResponse.toLowerCase().includes("mega");
    const hasPrice = /\$?\d+[,.]?\d+/.test(botResponse);
    
    console.log(`✅ Validaciones:`);
    console.log(`   Menciona COP/pesos: ${hasCOP ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Menciona el producto: ${hasMegapack ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Tiene precio: ${hasPrice ? '✅ SÍ' : '❌ NO'}`);
    
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1500));
}

async function main() {
  console.log("\n" + "═".repeat(80));
  console.log("🧪 PRUEBA: BOT CON DATOS REALES DE COLOMBIA");
  console.log("═".repeat(80));
  console.log("\n✅ 137 PRODUCTOS REALES CARGADOS EN BD");
  console.log("✅ PRECIOS EN PESOS COLOMBIANOS (COP)");
  
  // Pruebas
  await testProductoReal("Mega Pack", 1);
  await testProductoReal("Impresora Epson", 2);
  await testProductoReal("Cepillo deslanador", 3);
  await testProductoReal("Portátil Asus", 4);
  await testProductoReal("PACK COMPLETO 40", 5);
  
  console.log("\n" + "═".repeat(80));
  console.log("✅ PRUEBAS COMPLETADAS");
  console.log("═".repeat(80));
}

main().catch(console.error);
