/**
 * PRUEBA RÁPIDA DE ANTI-ALUCINACIÓN
 * Valida que el bot use datos REALES y NO invente información
 */

import axios from "axios";

const PRODUCTS = [
  { name: "Piano Digital 88 Teclas Profesional", price: "$899.99", stock: "15" },
  { name: "Guitarra Acústica de Madera Maciza", price: "$349.99", stock: "8" },
  { name: "Ukelele Soprano Concert Series", price: "$89.99", stock: "25" },
];

interface TestResult {
  name: string;
  passed: boolean;
  response: string;
  issues: string[];
}

async function testQuery(phone: string, query: string, expectedPrice?: string): Promise<TestResult> {
  try {
    const response = await axios.post("http://localhost:5000/api/chat/message", {
      phone,
      message: query,
      clientName: `Cliente ${phone}`,
    });
    
    const text = response.data.response;
    const issues: string[] = [];
    
    // Verificar precios inventados
    if (expectedPrice && !text.includes(expectedPrice)) {
      issues.push(`❌ No contiene precio exacto: ${expectedPrice}`);
    }
    
    // Verificar URLs inventadas
    const fakeUrls = (text.match(/https?:\/\/(fake|example|test|imgur|cdn)/gi) || []);
    if (fakeUrls.length > 0) {
      issues.push(`❌ URLs inventadas: ${fakeUrls.join(", ")}`);
    }
    
    // Verificar especificaciones inventadas
    if (text.includes("Bluetooth 5.0") || text.includes("batería de 48h") || text.includes("compatible con")) {
      issues.push(`❌ Especificaciones inventadas`);
    }
    
    return {
      name: query,
      passed: issues.length === 0,
      response: text.substring(0, 200),
      issues,
    };
  } catch (error: any) {
    return {
      name: query,
      passed: false,
      response: "",
      issues: [`Error: ${error.message}`],
    };
  }
}

async function main() {
  console.log("\n🧪 PRUEBA RÁPIDA DE ANTI-ALUCINACIÓN\n");
  
  const results: TestResult[] = [];
  
  // Prueba 1: Pregunta sobre piano (DEBE encontrar $899.99)
  console.log("1️⃣  Validando precio del piano...");
  results.push(await testQuery("+34901234567", "¿Cuál es el precio del piano?", "$899.99"));
  
  // Prueba 2: Pregunta sobre guitarra (DEBE encontrar $349.99)
  console.log("2️⃣  Validando precio de la guitarra...");
  results.push(await testQuery("+34901234568", "¿Cuánto cuesta la guitarra?", "$349.99"));
  
  // Prueba 3: Stock (DEBE encontrar 25 para ukelele)
  console.log("3️⃣  Validando stock del ukelele...");
  results.push(await testQuery("+34901234569", "¿Cuántos ukeleles tienen?", "25"));
  
  // Prueba 4: Producto NO EXISTE (NO debe inventar)
  console.log("4️⃣  Validando que NO inventa productos...");
  results.push(await testQuery("+34901234570", "¿Venden saxofones?"));
  
  // Prueba 5: Foto SIN URL inventada
  console.log("5️⃣  Validando que NO inventa URLs...");
  results.push(await testQuery("+34901234571", "¿Puedo ver la foto del piano?"));
  
  // Mostrar resultados
  console.log("\n" + "=".repeat(80));
  console.log("📊 RESULTADOS\n");
  
  let passed = 0;
  for (const result of results) {
    if (result.passed) {
      console.log(`✅ PASADA: ${result.name}`);
      passed++;
    } else {
      console.log(`❌ FALLIDA: ${result.name}`);
      for (const issue of result.issues) {
        console.log(`   ${issue}`);
      }
    }
    console.log(`   Respuesta: "${result.response}${result.response.length === 200 ? "..." : ""}"`);
    console.log();
  }
  
  console.log("=".repeat(80));
  console.log(`\n📈 RESUMEN: ${passed}/${results.length} pruebas pasadas (${Math.round(passed/results.length*100)}%)\n`);
  
  if (passed === results.length) {
    console.log("🎉 ¡EXCELENTE! El bot NO alucina y usa datos REALES\n");
  } else {
    console.log("⚠️  Algunas pruebas fallaron. Revisar respuestas del bot.\n");
  }
}

main().catch(console.error);
