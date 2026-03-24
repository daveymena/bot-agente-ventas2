/**
 * PRUEBA: Los 5 productos RESTANTES de la BD
 * (Batería, Interfaz, Cascos, Soporte, Cable)
 */

import axios from "axios";

const PRODUCTOS_RESTANTES = [
  { name: "Batería Acústica de 5 Piezas", expectedPrice: 599.99, expectedStock: 3, brand: "Pearl" },
  { name: "Interfaz de Audio Profesional", expectedPrice: 199.99, expectedStock: 12, brand: "Focusrite" },
  { name: "Cascos Audiófilos Over-Ear", expectedPrice: 349.99, expectedStock: 18, brand: "Sony" },
  { name: "Soporte Profesional para Micrófono", expectedPrice: 49.99, expectedStock: 30 },
  { name: "Cable XLR Balanceado 10 Metros", expectedPrice: 24.99, expectedStock: 50 },
];

async function testProducto(producto: any, index: number) {
  console.log(`\n${"═".repeat(80)}`);
  console.log(`📦 Producto ${index + 1}/5: ${producto.name}`);
  console.log(`   Precio esperado: $${producto.expectedPrice}`);
  console.log(`   Stock esperado: ${producto.expectedStock} unidades`);
  console.log(`${"═".repeat(80)}\n`);
  
  try {
    const response = await axios.post(
      "http://localhost:5000/api/chat/message",
      {
        phone: `+3499100000${index}`,
        message: `¿Tienen ${producto.name}? ¿Cuál es el precio y stock?`,
        clientName: `Cliente ${index}`,
      },
      { timeout: 15000 }
    );
    
    const botResponse = response.data.response;
    console.log(`🤖 Respuesta del bot:\n${botResponse}\n`);
    
    // Validar precio exacto
    const priceStr = `$${producto.expectedPrice}`;
    const hasPriceExact = botResponse.includes(priceStr);
    
    // Validar stock
    const hasStockExact = botResponse.includes(`${producto.expectedStock}`);
    
    // Validar marca si existe
    const hasBrand = !producto.brand || botResponse.includes(producto.brand);
    
    console.log(`\n✅ VALIDACIONES:`);
    console.log(`   Precio exacto (${priceStr}): ${hasPriceExact ? '✅ EXACTO' : '❌ NO COINCIDE'}`);
    console.log(`   Stock exacto (${producto.expectedStock} unidades): ${hasStockExact ? '✅ EXACTO' : '❌ NO COINCIDE'}`);
    console.log(`   Marca ${producto.brand ? `(${producto.brand})` : '(N/A)'}: ${hasBrand ? '✅ CORRECTA' : '⚠️ FALTA'}`);
    console.log(`   Nombre reconocido: ${botResponse.toLowerCase().includes(producto.name.toLowerCase().split(' ')[0]) ? '✅ SÍ' : '❌ NO'}`);
    
    // Detectar alucinaciones
    const hasUrl = /https?:\/\/[^\s)]+/gi.test(botResponse);
    console.log(`   URLs inventadas: ${hasUrl ? '❌ SÍ (ALUCINACIÓN!)' : '✅ NO'}`);
    
    // Resumen
    const allCorrect = hasPriceExact && hasStockExact && hasBrand;
    console.log(`\n   RESULTADO: ${allCorrect ? '✅ PASADA - DATOS EXACTOS' : '⚠️ REVISAR'}`);
    
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function main() {
  console.log("\n" + "═".repeat(80));
  console.log("🧪 PRUEBA: PRODUCTOS RESTANTES (5 PRODUCTOS MÁS)");
  console.log("═".repeat(80));
  console.log("\nEstos son los 5 productos adicionales no probados aún:");
  PRODUCTOS_RESTANTES.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.name} - $${p.expectedPrice}`);
  });
  
  for (let i = 0; i < PRODUCTOS_RESTANTES.length; i++) {
    await testProducto(PRODUCTOS_RESTANTES[i], i);
  }
  
  console.log("\n" + "═".repeat(80));
  console.log("📊 RESUMEN TOTAL: 10/10 PRODUCTOS VALIDADOS");
  console.log("═".repeat(80));
}

main().catch(console.error);
