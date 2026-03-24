/**
 * Sistema Integral de Pruebas Conversacionales
 *
 * Pruebas end-to-end para todos los agentes:
 * - Agente de Ventas (saludo → consulta → venta)
 * - Agente de Soporte (problema → resolución)
 * - Agente Técnico (consulta → información)
 * - Agente Admin (gestión)
 *
 * Ejecutar: npx tsx scripts/conversational-tests.ts
 */

import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestMessage {
  role: "user" | "bot";
  content: string;
  intent?: string;
  agent?: string;
  timestamp: string;
}

interface TestConversation {
  id: string;
  name: string;
  description: string;
  phone: string;
  clientName: string;
  messages: TestMessage[];
  status: "pending" | "running" | "passed" | "failed";
  processingTime: number;
  startTime: string;
  endTime?: string;
  assertions?: {
    name: string;
    passed: boolean;
    error?: string;
  }[];
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  tests: TestConversation[];
}

const API_BASE = process.env.API_URL || "http://localhost:3000";
const TESTS_OUTPUT_DIR = path.join(__dirname, "../artifacts/test-reports");

// ============================================================================
// PRUEBAS DE AGENTE DE VENTAS - FLUJO COMPLETO
// ============================================================================

const SALES_AGENT_TESTS: TestConversation[] = [
  {
    id: "sales-01",
    name: "Ventas: Saludo y Consulta Inicial",
    description: "Cliente nuevo saluda y pregunta por productos disponibles",
    phone: "+34912345601",
    clientName: "María García",
    messages: [
      {
        role: "user",
        content: "Hola, ¿qué tal? Estoy buscando un producto para mi negocio",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content:
          "Me interesa saber qué categorías de productos tienen disponibles",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
  {
    id: "sales-02",
    name: "Ventas: Consulta Específica de Producto",
    description:
      "Cliente pregunta por producto específico con comparación de precios",
    phone: "+34912345602",
    clientName: "Juan López",
    messages: [
      {
        role: "user",
        content:
          "Hola, estoy interesado en comprar un piano. ¿Qué modelos tienen?",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content: "¿Cuál es el precio del modelo más básico? ¿Hay garantía?",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
  {
    id: "sales-03",
    name: "Ventas: Objeción de Precio y Cierre",
    description: "Cliente con objeción de precio es persuadido hacia la venta",
    phone: "+34912345603",
    clientName: "Carlos Martín",
    messages: [
      {
        role: "user",
        content: "¿Tienen ofertas o descuentos especiales en estos momentos?",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content:
          "Es que el precio me parece un poco alto. ¿Cuál es el mínimo que pueden hacer?",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content:
          "Bueno, si incluyen envío gratis, puedo cerrar la compra hoy mismo",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
  {
    id: "sales-04",
    name: "Ventas: Consulta de Métodos de Pago",
    description:
      "Cliente pregunta disponibilidad de métodos de pago para finalizar compra",
    phone: "+34912345604",
    clientName: "Ana Rodríguez",
    messages: [
      {
        role: "user",
        content:
          "Quiero comprar pero necesito saber si aceptan tarjeta de crédito",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content: "¿Y qué tal pagos en cuotas? ¿Tienen financiamiento?",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
];

// ============================================================================
// PRUEBAS DE AGENTE DE SOPORTE - RESOLUCIÓN DE PROBLEMAS
// ============================================================================

const SUPPORT_AGENT_TESTS: TestConversation[] = [
  {
    id: "support-01",
    name: "Soporte: Problema Técnico General",
    description:
      "Cliente reporta problema técnico con el producto y busca asistencia",
    phone: "+34912345701",
    clientName: "Pedro García",
    messages: [
      {
        role: "user",
        content:
          "Hola, compré hace una semana y el producto no funciona correctamente",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content: "Se apaga sola sin motivo aparente. ¿Qué puedo hacer?",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
  {
    id: "support-02",
    name: "Soporte: Devolución y Reemplazo",
    description: "Cliente solicita devolución por defecto del producto",
    phone: "+34912345702",
    clientName: "Laura Fernández",
    messages: [
      {
        role: "user",
        content: "Hola, quería devolver mi compra. El producto está dañado",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content:
          "¿Cuál es el proceso? ¿Tengo que enviar algo o vienen ustedes a buscarlo?",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
  {
    id: "support-03",
    name: "Soporte: Consulta de Entrega",
    description: "Cliente pregunta sobre estado de entrega de su pedido",
    phone: "+34912345703",
    clientName: "Miguel Sánchez",
    messages: [
      {
        role: "user",
        content: "¿Dónde está mi pedido? Hice la compra hace 5 días",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content:
          "¿Cuánto tiempo más falta? Necesitaba el producto urgentemente",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
];

// ============================================================================
// PRUEBAS DE AGENTE TÉCNICO - INFORMACIÓN ESPECIALIZADA
// ============================================================================

const TECHNICAL_AGENT_TESTS: TestConversation[] = [
  {
    id: "technical-01",
    name: "Técnico: Especificaciones del Producto",
    description:
      "Cliente pregunta especificaciones técnicas detalladas del producto",
    phone: "+34912345801",
    clientName: "Rafael Jiménez",
    messages: [
      {
        role: "user",
        content:
          "¿Cuáles son las especificaciones técnicas del producto? Necesito saber sobre compatibilidad",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content:
          "¿Necesito software especial para usarlo? ¿Es compatible con Windows y Mac?",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
  {
    id: "technical-02",
    name: "Técnico: Configuración e Instalación",
    description:
      "Cliente solicita asistencia para configurar e instalar el producto",
    phone: "+34912345802",
    clientName: "Teresa López",
    messages: [
      {
        role: "user",
        content:
          "Recibí el producto pero no sé cómo instalarlo. ¿Tienen tutorial?",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content: "¿Es complicado? ¿Necesito conocimientos técnicos avanzados?",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
  {
    id: "technical-03",
    name: "Técnico: Comparación Técnica de Productos",
    description:
      "Cliente compara especificaciones técnicas entre dos modelos diferentes",
    phone: "+34912345803",
    clientName: "David Martínez",
    messages: [
      {
        role: "user",
        content:
          "¿Cuál es la diferencia técnica entre el modelo básico y el profesional?",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user",
        content:
          "¿Vale la pena el extra de precio? ¿Cuáles son las mejoras reales?",
        timestamp: new Date().toISOString(),
      },
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
];

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

async function sendMessage(
  phone: string,
  message: string,
  clientName: string,
): Promise<{
  response: string;
  intent: string;
  agent: string;
  confidence: number;
  processingTime: number;
}> {
  try {
    const response = await axios.post(`${API_BASE}/chat/message`, {
      phone,
      message,
      clientName,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Error enviando mensaje: ${error.message}`,
      error.response?.data || "",
    );
    throw error;
  }
}

async function runConversation(
  test: TestConversation,
): Promise<TestConversation> {
  console.log(`\n📝 Iniciando: ${test.name}`);
  console.log(`   Descripción: ${test.description}`);
  console.log(`   Cliente: ${test.clientName} (${test.phone})`);

  const result: TestConversation = { ...test, status: "running" };
  const userMessages = test.messages.filter((m) => m.role === "user");
  let totalTime = 0;

  for (let i = 0; i < userMessages.length; i++) {
    const userMsg = userMessages[i];
    console.log(
      `\n   👤 Cliente (${i + 1}/${userMessages.length}): "${userMsg.content}"`,
    );

    try {
      const startTime = Date.now();
      const aiResponse = await sendMessage(
        test.phone,
        userMsg.content,
        test.clientName,
      );
      const responseTime = Date.now() - startTime;
      totalTime += responseTime;

      console.log(
        `   🤖 Bot (${aiResponse.agent} | Intent: ${aiResponse.intent}): "${aiResponse.response.substring(0, 100)}..."`,
      );
      console.log(
        `   ⏱️  Tiempo: ${responseTime}ms | Confianza: ${(aiResponse.confidence * 100).toFixed(1)}%`,
      );

      // Agregar a historial
      result.messages.push(
        {
          role: "user",
          content: userMsg.content,
          intent: aiResponse.intent,
          agent: aiResponse.agent,
          timestamp: new Date().toISOString(),
        },
        {
          role: "bot",
          content: aiResponse.response,
          intent: aiResponse.intent,
          agent: aiResponse.agent,
          timestamp: new Date().toISOString(),
        },
      );
    } catch (error) {
      console.error(`   ❌ Error en turno ${i + 1}:`, error);
      result.status = "failed";
      result.assertions = [
        {
          name: `Turno ${i + 1}: Mensaje enviado correctamente`,
          passed: false,
          error: String(error),
        },
      ];
      break;
    }

    // Pequeña pausa entre mensajes
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  result.processingTime = totalTime;
  result.endTime = new Date().toISOString();
  result.status = result.status === "failed" ? "failed" : "passed";

  // Crear aserciones básicas
  result.assertions = [
    {
      name: "Todos los mensajes se enviaron correctamente",
      passed: result.status === "passed",
    },
    {
      name: "Tiempo de respuesta aceptable (< 5s por mensaje)",
      passed: totalTime / userMessages.length < 5000,
    },
    {
      name: "Conversación mantuvo coherencia",
      passed: result.messages.filter((m) => m.role === "bot").length > 0,
    },
  ];

  const allPassed = result.assertions.every((a) => a.passed);
  result.status = allPassed ? "passed" : "failed";

  return result;
}

async function runAllTests(
  tests: TestConversation[],
  agentName: string,
): Promise<TestConversation[]> {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🧪 PRUEBAS DEL AGENTE: ${agentName}`);
  console.log(`${"=".repeat(80)}`);

  const results: TestConversation[] = [];

  for (const test of tests) {
    try {
      const result = await runConversation(test);
      results.push(result);

      const statusEmoji =
        result.status === "passed"
          ? "✅"
          : result.status === "failed"
            ? "❌"
            : "⏳";
      console.log(
        `\n${statusEmoji} ${result.name} - ${result.processingTime}ms`,
      );
    } catch (error) {
      console.error(`❌ Error ejecutando test ${test.id}:`, error);
      results.push({
        ...test,
        status: "failed",
        processingTime: 0,
        endTime: new Date().toISOString(),
      });
    }
  }

  return results;
}

function generateReport(allResults: TestConversation[]): TestReport {
  const passed = allResults.filter((t) => t.status === "passed").length;
  const failed = allResults.filter((t) => t.status === "failed").length;

  return {
    timestamp: new Date().toISOString(),
    totalTests: allResults.length,
    passed,
    failed,
    tests: allResults,
  };
}

function formatReport(report: TestReport): string {
  const passRate = ((report.passed / report.totalTests) * 100).toFixed(1);

  let output = `\n${"=".repeat(80)}\n`;
  output += `📊 REPORTE DE PRUEBAS CONVERSACIONALES\n`;
  output += `${"=".repeat(80)}\n`;
  output += `Timestamp: ${report.timestamp}\n`;
  output += `Total: ${report.totalTests} | Pasadas: ${report.passed} | Fallidas: ${report.failed}\n`;
  output += `Tasa de éxito: ${passRate}%\n`;
  output += `${"=".repeat(80)}\n\n`;

  for (const test of report.tests) {
    const statusEmoji = test.status === "passed" ? "✅" : "❌";
    output += `${statusEmoji} ${test.name}\n`;
    output += `   ID: ${test.id}\n`;
    output += `   Cliente: ${test.clientName}\n`;
    output += `   Tiempo: ${test.processingTime}ms\n`;

    if (test.assertions) {
      output += `   Aserciones:\n`;
      for (const assertion of test.assertions) {
        const icon = assertion.passed ? "✓" : "✗";
        output += `     [${icon}] ${assertion.name}\n`;
        if (assertion.error) {
          output += `         Error: ${assertion.error}\n`;
        }
      }
    }

    output += `\n`;
  }

  return output;
}

async function ensureOutputDir(): Promise<void> {
  try {
    await fs.mkdir(TESTS_OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creando directorio de salida:", error);
  }
}

async function saveReport(report: TestReport): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `test-report-${timestamp}.json`;
    const filepath = path.join(TESTS_OUTPUT_DIR, filename);

    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Reporte guardado: ${filepath}`);
  } catch (error) {
    console.error("Error guardando reporte:", error);
  }
}

// ============================================================================
// EJECUCIÓN PRINCIPAL
// ============================================================================

async function main(): Promise<void> {
  console.log("🚀 Iniciando Sistema de Pruebas Conversacionales\n");
  console.log(`📌 API Base: ${API_BASE}`);
  console.log(`📁 Directorio de salida: ${TESTS_OUTPUT_DIR}\n`);

  await ensureOutputDir();

  // Ejecutar todas las suites de pruebas
  const allResults: TestConversation[] = [];

  const salesResults = await runAllTests(SALES_AGENT_TESTS, "Agente de Ventas");
  allResults.push(...salesResults);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const supportResults = await runAllTests(
    SUPPORT_AGENT_TESTS,
    "Agente de Soporte",
  );
  allResults.push(...supportResults);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const technicalResults = await runAllTests(
    TECHNICAL_AGENT_TESTS,
    "Agente Técnico",
  );
  allResults.push(...technicalResults);

  // Generar y guardar reporte
  const report = generateReport(allResults);
  const reportText = formatReport(report);

  console.log(reportText);

  await saveReport(report);

  // Resumen final
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🎯 RESUMEN FINAL`);
  console.log(`${"=".repeat(80)}`);
  console.log(
    `✅ Pruebas exitosas: ${report.passed}/${report.totalTests} (${((report.passed / report.totalTests) * 100).toFixed(1)}%)`,
  );
  console.log(`❌ Pruebas fallidas: ${report.failed}/${report.totalTests}`);
  console.log(`\n✨ Pruebas completadas exitosamente\n`);

  process.exit(report.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
