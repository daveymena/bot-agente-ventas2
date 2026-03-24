import { handleMessage } from "./artifacts/api-server/src/core/router.js";

/**
 * Test para verificar si el bot confunde productos
 * Casos de prueba con mensajes similares
 */

async function runTests() {
  console.log("🧪 TEST: ¿Confunde el bot productos similares?\n");
  console.log("=".repeat(70));

  const testCases = [
    {
      name: "Caso 1: Cliente busca 'Curso de Piano'",
      phone: "test_001",
      message: "Me interesa comprar un curso de piano",
      expectedProduct: "Curso Completo de Piano Online",
    },
    {
      name: "Caso 2: Cliente busca 'Mega Pack de Piano'",
      phone: "test_002",
      message: "Quiero el mega pack de piano",
      expectedProduct: "PACK COMPLETO 40 Mega Packs",
    },
    {
      name: "Caso 3: Cliente busca 'Mega Pack' (ambiguo)",
      phone: "test_003",
      message: "Quiero comprar un mega pack",
      expectedProduct: "PACK COMPLETO 40 Mega Packs",
    },
    {
      name: "Caso 4: Cliente pide 'Pack de Piano Completo'",
      phone: "test_004",
      message: "Necesito el pack completo de piano",
      expectedProduct: "PACK COMPLETO 40 Mega Packs",
    },
    {
      name: "Caso 5: Cliente dice 'Piano, no mega pack'",
      phone: "test_005",
      message: "Quiero piano, no el mega pack",
      expectedProduct: "Curso Completo de Piano Online",
    },
    {
      name: "Caso 6: Cliente confundido '¿Cuál es la diferencia entre piano y mega pack?'",
      phone: "test_006",
      message: "¿Cuál es la diferencia entre el curso de piano y el mega pack?",
      expectedProduct: "Ambos",
    },
  ];

  let correctMatches = 0;
  let confusions = 0;
  const results = [];

  for (const testCase of testCases) {
    console.log(`\n✓ ${testCase.name}`);
    console.log(`  Mensaje: "${testCase.message}"`);
    console.log(`  Esperado: ${testCase.expectedProduct}`);

    try {
      const result = await handleMessage(
        testCase.phone,
        testCase.message,
        "Test User",
      );

      const response = result.response.toLowerCase();

      // Verificar si menciona los productos correctos
      const mentionsCurso =
        response.includes("curso completo de piano") ||
        response.includes("curso de piano") ||
        response.includes("piano online");

      const mentionsMegaPack =
        response.includes("pack completo") ||
        response.includes("mega pack") ||
        response.includes("40 mega packs");

      let detected = "Ninguno";
      if (mentionsCurso && mentionsMegaPack) detected = "Ambos";
      else if (mentionsCurso) detected = "Curso de Piano";
      else if (mentionsMegaPack) detected = "Mega Pack";

      const isCorrect = detected
        .toLowerCase()
        .includes(testCase.expectedProduct.toLowerCase().split(",")[0]);

      console.log(`  Detectado: ${detected}`);

      if (isCorrect) {
        console.log("  ✅ CORRECTO");
        correctMatches++;
      } else {
        console.log("  ❌ CONFUSIÓN DETECTADA");
        confusions++;
      }

      console.log(`  Intent: ${result.intent}`);
      console.log(
        `  Respuesta preview: ${result.response.substring(0, 120)}...`,
      );

      results.push({
        test: testCase.name,
        message: testCase.message,
        detected,
        expected: testCase.expectedProduct,
        correct: isCorrect,
        response: result.response,
      });
    } catch (err) {
      console.log(`  ❌ ERROR: ${(err as Error).message}`);
      confusions++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("\n📊 RESULTADOS:\n");
  console.log(`  ✅ Correctos: ${correctMatches}/${testCases.length}`);
  console.log(`  ❌ Confusiones: ${confusions}/${testCases.length}`);
  console.log(
    `  📈 Precisión: ${Math.round((correctMatches / testCases.length) * 100)}%`,
  );

  if (correctMatches < testCases.length) {
    console.log("\n⚠️  NECESITA MEJORAS:\n");
    results.forEach((r) => {
      if (!r.correct) {
        console.log(`  • ${r.test}`);
        console.log(`    Mensaje: "${r.message}"`);
        console.log(
          `    Esperaba: ${r.expected}, pero detectó: ${r.detected}\n`,
        );
      }
    });
  }

  console.log("=".repeat(70));
}

// Run tests
runTests().catch(console.error);
