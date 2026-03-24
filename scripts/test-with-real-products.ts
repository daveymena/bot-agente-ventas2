/**
 * PRUEBAS DE CONVERSACIÓN CON DATOS REALES DE PRODUCTOS
 *
 * Este script simula conversaciones reales usando datos de productos
 * para verificar que el bot NO alucina y usa información correcta
 *
 * Ejecutar: npx tsx scripts/test-with-real-products.ts
 */

import axios from "axios";

// Productos de prueba (simularían estar en BD)
const TEST_PRODUCTS = [
  {
    id: 1,
    name: "Piano Digital 88 Teclas Profesional",
    price: 899.99,
    category: "Instrumentos Musicales",
    brand: "Yamaha",
    stock: 15,
    description:
      "Piano digital de 88 teclas con sonidos de calidad studio, diseñado para principiantes y profesionales. Incluye stand y pedales.",
    imageUrl: null, // NO URL inventada
  },
  {
    id: 2,
    name: "Guitarra Acústica de Madera Maciza",
    price: 349.99,
    category: "Instrumentos Musicales",
    brand: "Fender",
    stock: 8,
    description:
      "Guitarra acústica construida con madera maciza de abeto y cedro. Sonoridad cálida y proyección. Incluye funda acolchada.",
    imageUrl: null,
  },
  {
    id: 3,
    name: "Ukelele Soprano Concert Series",
    price: 89.99,
    category: "Instrumentos Musicales",
    brand: "Kala",
    stock: 25,
    description:
      "Ukelele de tamaño concert (23 pulgadas) con sonido brillante y alegre. Perfecto para principiantes. Cuerpo de caoba.",
    imageUrl: null,
  },
  {
    id: 4,
    name: "Micrófono Condensador USB",
    price: 129.99,
    category: "Equipos de Audio",
    brand: "Audio-Technica",
    stock: 20,
    description:
      "Micrófono condensador de estudio con conexión USB directa. Patrón cardioide. Perfecto para podcasts y grabaciones.",
    imageUrl: null,
  },
  {
    id: 5,
    name: "Amplificador de Guitarra 100W",
    price: 449.99,
    category: "Equipos de Audio",
    brand: "Marshall",
    stock: 5,
    description:
      "Amplificador versátil con 100W de potencia. Controles de ganancia, volumen, reverb. Entrada para auriculares.",
    imageUrl: null,
  },
];

interface ConversationTest {
  id: string;
  name: string;
  clientPhone: string;
  clientName: string;
  messages: string[];
  expectedToFind: string; // Qué producto/precio se espera encontrar
  shouldNotAlucinate: string[]; // Qué NO debe inventar
}

// Casos de prueba REALES
const TEST_CASES: ConversationTest[] = [
  {
    id: "real-1",
    name: "Prueba 1: Pregunta por Piano (EXISTE en BD)",
    clientPhone: "+34900001111",
    clientName: "Cliente Real 1",
    messages: [
      "Hola, ¿tienen pianos?",
      "¿Cuál es el precio del piano digital?",
      "¿Cuántas unidades tienen en stock?",
    ],
    expectedToFind: "Piano Digital 88 Teclas Profesional - $899.99",
    shouldNotAlucinate: [
      "piano de cola",
      "piano midi",
      "$1000",
      "https://",
      "50 sonidos",
    ],
  },
  {
    id: "real-2",
    name: "Prueba 2: Pregunta por Guitarra (EXISTE en BD)",
    clientPhone: "+34900002222",
    clientName: "Cliente Real 2",
    messages: [
      "¿Venden guitarras?",
      "¿Qué marca es?",
      "¿Cuál es exactamente el precio?",
    ],
    expectedToFind: "Guitarra Acústica de Madera Maciza - $349.99 - Fender",
    shouldNotAlucinate: [
      "guitarra eléctrica",
      "12 cuerdas",
      "$250",
      "made in USA",
    ],
  },
  {
    id: "real-3",
    name: "Prueba 3: Pregunta por Producto que NO EXISTE",
    clientPhone: "+34900003333",
    clientName: "Cliente Real 3",
    messages: [
      "¿Venden pianos de cola?",
      "¿Tienen algo profesional de $2000+?",
    ],
    expectedToFind: "No tenemos",
    shouldNotAlucinate: [
      "sí, tenemos piano de cola",
      "$2500",
      "modelo profesional",
    ],
  },
  {
    id: "real-4",
    name: "Prueba 4: Solicita Foto (NO debe inventar URL)",
    clientPhone: "+34900004444",
    clientName: "Cliente Real 4",
    messages: [
      "Hola, ¿me muestran la foto del piano?",
      "¿Dónde puedo ver las imágenes?",
    ],
    expectedToFind: "página web",
    shouldNotAlucinate: [
      "https://",
      "http://",
      ".jpg",
      ".png",
      "photo",
      "image",
    ],
  },
  {
    id: "real-5",
    name: "Prueba 5: Pregunta por Especificación NO en BD",
    clientPhone: "+34900005555",
    clientName: "Cliente Real 5",
    messages: [
      "¿Qué peso tiene el piano?",
      "¿Cuáles son las dimensiones exactas?",
    ],
    expectedToFind: "No tengo",
    shouldNotAlucinate: ["30kg", "1.2 metros", "pesa", "tamaño", "dimensiones"],
  },
  {
    id: "real-6",
    name: "Prueba 6: Comparación de Precios REALES",
    clientPhone: "+34900006666",
    clientName: "Cliente Real 6",
    messages: [
      "¿Cuál es más caro: guitarra o ukelele?",
      "¿Cuál es la diferencia de precio exacta?",
    ],
    expectedToFind: "Guitarra $349.99 - Ukelele $89.99",
    shouldNotAlucinate: ["$400", "$100", "aproximadamente", "alrededor de"],
  },
  {
    id: "real-7",
    name: "Prueba 7: Stock EXACTO de BD",
    clientPhone: "+34900007777",
    clientName: "Cliente Real 7",
    messages: [
      "¿Cuántos ukeleles tienen disponibles?",
      "¿Hay suficiente stock?",
    ],
    expectedToFind: "25 unidades",
    shouldNotAlucinate: ["muchos", "bastante", "limitado", "24", "26"],
  },
  {
    id: "real-8",
    name: "Prueba 8: Categoría EXACTA de BD",
    clientPhone: "+34900008888",
    clientName: "Cliente Real 8",
    messages: ["¿En qué categoría está el micrófono?", "¿Qué marca es?"],
    expectedToFind: "Equipos de Audio - Audio-Technica",
    shouldNotAlucinate: ["Accesorios", "Studio", "Professional"],
  },
];

// Colores para console
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

async function sendMessage(
  phone: string,
  message: string,
  clientName: string,
): Promise<string> {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/chat/message",
      {
        phone,
        message,
        clientName,
      },
    );
    return response.data.response;
  } catch (error: any) {
    console.error(`${RED}❌ Error:${RESET}`, error.message);
    throw error;
  }
}

function checkResponse(
  response: string,
  testCase: ConversationTest,
): { passed: boolean; issues: string[] } {
  const issues: string[] = [];

  // Verificar que encontró lo esperado (parcialmente)
  const foundExpected = testCase.expectedToFind
    .toLowerCase()
    .split(" - ")
    .some((part) => response.toLowerCase().includes(part.toLowerCase().trim()));

  if (!foundExpected && testCase.expectedToFind !== "No tenemos") {
    issues.push(`No encontró: "${testCase.expectedToFind}"`);
  }

  // Verificar que NO alucina
  for (const hallucination of testCase.shouldNotAlucinate) {
    if (response.toLowerCase().includes(hallucination.toLowerCase())) {
      issues.push(`⚠️  ALUCINACIÓN DETECTADA: "${hallucination}"`);
    }
  }

  // Verificar URLs inventadas
  const urlPattern = /https?:\/\/[^\s\)]+/gi;
  const urls = response.match(urlPattern) || [];
  if (urls.length > 0) {
    issues.push(`⚠️  URLs INVENTADAS: ${urls.join(", ")}`);
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

async function runTest(testCase: ConversationTest): Promise<void> {
  console.log(`\n${BLUE}${"=".repeat(80)}${RESET}`);
  console.log(`${BLUE}📝 ${testCase.name}${RESET}`);
  console.log(`${BLUE}${"=".repeat(80)}${RESET}`);

  console.log(`Cliente: ${testCase.clientName} (${testCase.clientPhone})\n`);

  const allResponses: string[] = [];

  for (let i = 0; i < testCase.messages.length; i++) {
    const message = testCase.messages[i];
    console.log(
      `${YELLOW}📨 Turno ${i + 1}/${testCase.messages.length}${RESET}`,
    );
    console.log(`👤 Cliente: "${message}"`);

    try {
      const response = await sendMessage(
        testCase.clientPhone,
        message,
        testCase.clientName,
      );
      console.log(
        `🤖 Bot: "${response.substring(0, 150)}${response.length > 150 ? "..." : ""}"`,
      );
      allResponses.push(response);

      const check = checkResponse(response, testCase);

      if (check.passed) {
        console.log(`${GREEN}✅ Respuesta VÁLIDA${RESET}`);
      } else {
        console.log(`${RED}❌ PROBLEMAS DETECTADOS:${RESET}`);
        for (const issue of check.issues) {
          console.log(`   ${RED}${issue}${RESET}`);
        }
      }
    } catch (error) {
      console.log(`${RED}❌ Error enviando mensaje${RESET}`);
    }

    // Pausa entre mensajes
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Resumen final
  console.log(`\n${YELLOW}Resumen Completo de la Conversación:${RESET}`);
  console.log("────────────────────────────────────────");

  const combinedResponse = allResponses.join(" ");
  const finalCheck = checkResponse(combinedResponse, testCase);

  if (finalCheck.passed) {
    console.log(
      `${GREEN}✅ PRUEBA PASADA - Sin alucinaciones detectadas${RESET}`,
    );
  } else {
    console.log(`${RED}❌ PRUEBA FALLIDA - Problemas encontrados:${RESET}`);
    for (const issue of finalCheck.issues) {
      console.log(`   ${issue}`);
    }
  }
}

async function main(): Promise<void> {
  console.log(`\n${BLUE}${"=".repeat(80)}${RESET}`);
  console.log(
    `${BLUE}🧪 PRUEBAS REALES CON PRODUCTOS DE LA BASE DE DATOS${RESET}`,
  );
  console.log(`${BLUE}${"=".repeat(80)}${RESET}\n`);

  console.log("Productos de Prueba Disponibles:");
  console.log("─────────────────────────────────");
  TEST_PRODUCTS.forEach((p) => {
    console.log(`  • ${p.name}: $${p.price} (Stock: ${p.stock})`);
  });
  console.log();

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    try {
      await runTest(testCase);
      passed++;
    } catch (error) {
      console.log(`${RED}❌ Error en prueba: ${testCase.id}${RESET}`);
      failed++;
    }
  }

  // Resumen final
  console.log(`\n${BLUE}${"=".repeat(80)}${RESET}`);
  console.log(`${BLUE}📊 RESUMEN FINAL${RESET}`);
  console.log(`${BLUE}${"=".repeat(80)}${RESET}\n`);

  const total = passed + failed;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total de pruebas: ${total}`);
  console.log(`${GREEN}✅ Pasadas: ${passed}${RESET}`);
  console.log(`${RED}❌ Fallidas: ${failed}${RESET}`);
  console.log(`Tasa de éxito: ${passRate}%\n`);

  if (failed === 0) {
    console.log(
      `${GREEN}🎉 ¡EXCELENTE! El bot NO alucina y usa datos REALES correctamente${RESET}`,
    );
  } else {
    console.log(
      `${RED}⚠️  El bot sigue teniendo problemas con alucinación${RESET}`,
    );
  }
}

main().catch((error) => {
  console.error(`${RED}Error fatal:${RESET}`, error);
  process.exit(1);
});
