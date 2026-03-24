/**
 * PRUEBA: Pregunta por MEGAPACK (producto que NO existe)
 * 
 * Objetivo: Verificar si el bot:
 * ✅ Responde honestamente que NO existe
 * ❌ O inventa un producto que no está en BD
 */

import axios from "axios";

async function testMegapack() {
  console.log("\n🧪 PRUEBA: PREGUNTA POR MEGAPACK\n");
  console.log("=".repeat(80));
  console.log("Objetivo: Validar que el bot NO inventa productos\n");
  
  const questions = [
    "¿Tienen megapack de instrumentos?",
    "¿Qué es el megapack?",
    "¿Cuál es el precio del megapack?",
  ];
  
  for (const question of questions) {
    try {
      console.log(`\n📨 Pregunta: "${question}"\n`);
      
      const response = await axios.post(
        "http://localhost:5000/api/chat/message",
        {
          phone: "+34988888888",
          message: question,
          clientName: "Cliente Prueba",
        },
        { timeout: 10000 }
      );
      
      const botResponse = response.data.response;
      console.log(`🤖 Respuesta del bot:\n${botResponse}\n`);
      
      // Validar si es honesto o si inventa
      const isHonest = 
        botResponse.toLowerCase().includes("no tenemos") ||
        botResponse.toLowerCase().includes("no tengo") ||
        botResponse.toLowerCase().includes("no disponible") ||
        botResponse.toLowerCase().includes("no existe") ||
        botResponse.toLowerCase().includes("no encontr");
      
      const isInventing = 
        botResponse.includes("$") && !botResponse.toLowerCase().includes("no tenemos") ||
        (botResponse.toLowerCase().includes("megapack") && 
         botResponse.toLowerCase().includes("disponible") &&
         !botResponse.toLowerCase().includes("no"));
      
      if (isHonest) {
        console.log("✅ RESPUESTA HONESTA: El bot admite que NO tiene megapack\n");
      } else if (isInventing) {
        console.log("❌ RESPUESTA SOSPECHOSA: El bot podría estar inventando detalles\n");
      } else {
        console.log("⚠️  RESPUESTA AMBIGUA: Necesita revisión\n");
      }
      
      console.log("-".repeat(80));
      
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}\n`);
    }
    
    // Pausa entre preguntas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("\n📊 CONCLUSIÓN:\n");
  console.log("Si el bot responde honestamente \"No tenemos megapack\":");
  console.log("  ✅ PASÓ - El bot NO inventa productos\n");
  console.log("Si el bot describe un megapack ficticio:");
  console.log("  ❌ FALLÓ - El bot está alucinando\n");
}

testMegapack().catch(console.error);
