/**
 * Analizador de Resultados de Pruebas Conversacionales
 *
 * Genera reportes detallados y estadísticas de los test conversacionales
 *
 * Ejecutar: npx tsx scripts/analyze-test-results.ts
 */

import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTS_OUTPUT_DIR = path.join(__dirname, "../artifacts/test-reports");

interface TestAssertion {
  name: string;
  passed: boolean;
  error?: string;
}

interface TestMessage {
  role: "user" | "bot";
  content: string;
  intent?: string;
  agent?: string;
  timestamp: string;
}

interface TestResult {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  processingTime: number;
  messages?: TestMessage[];
  assertions?: TestAssertion[];
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  tests: TestResult[];
}

interface Analysis {
  report: TestReport;
  stats: {
    passRate: number;
    averageResponseTime: number;
    slowestTests: { name: string; time: number }[];
    fastestTests: { name: string; time: number }[];
    failedAssertions: { test: string; assertions: TestAssertion[] }[];
    agentPerformance: Record<
      string,
      {
        tested: number;
        passed: number;
        avgTime: number;
      }
    >;
  };
}

async function findLatestReport(): Promise<TestReport | null> {
  try {
    const files = await fs.readdir(TESTS_OUTPUT_DIR);
    const jsonFiles = files
      .filter((f) => f.startsWith("test-report-") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (jsonFiles.length === 0) {
      return null;
    }

    const latestFile = jsonFiles[0];
    const filepath = path.join(TESTS_OUTPUT_DIR, latestFile);
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error leyendo reportes:", error);
    return null;
  }
}

function analyzeReport(report: TestReport): Analysis {
  const passRate =
    report.totalTests > 0 ? (report.passed / report.totalTests) * 100 : 0;

  // Tiempos de respuesta
  const times = report.tests
    .map((t) => ({ name: t.name, time: t.processingTime }))
    .sort((a, b) => b.time - a.time);

  const slowestTests = times.slice(0, 3);
  const fastestTests = times.slice(-3).reverse();

  // Fallos de aserciones
  const failedAssertions = report.tests
    .filter((t) => t.assertions?.some((a) => !a.passed))
    .map((t) => ({
      test: t.name,
      assertions: t.assertions?.filter((a) => !a.passed) || [],
    }));

  // Performance por agente
  const agentPerformance: Record<
    string,
    {
      tested: number;
      passed: number;
      totalTime: number;
      times: number[];
    }
  > = {};

  for (const test of report.tests) {
    const agent = test.name.split(":")[0].trim();

    if (!agentPerformance[agent]) {
      agentPerformance[agent] = {
        tested: 0,
        passed: 0,
        totalTime: 0,
        times: [],
      };
    }

    agentPerformance[agent].tested += 1;
    if (test.status === "passed") {
      agentPerformance[agent].passed += 1;
    }
    agentPerformance[agent].totalTime += test.processingTime;
    agentPerformance[agent].times.push(test.processingTime);
  }

  const agentStats = Object.fromEntries(
    Object.entries(agentPerformance).map(([agent, stats]) => [
      agent,
      {
        tested: stats.tested,
        passed: stats.passed,
        avgTime: Math.round(stats.totalTime / stats.tested),
      },
    ]),
  );

  return {
    report,
    stats: {
      passRate: Math.round(passRate * 10) / 10,
      averageResponseTime: Math.round(
        report.tests.reduce((sum, t) => sum + t.processingTime, 0) /
          report.totalTests,
      ),
      slowestTests,
      fastestTests,
      failedAssertions,
      agentPerformance: agentStats,
    },
  };
}

function formatAnalysisReport(analysis: Analysis): string {
  const { report, stats } = analysis;

  let output = "\n";
  output += "═".repeat(80) + "\n";
  output += "📊 ANÁLISIS DETALLADO DE PRUEBAS CONVERSACIONALES\n";
  output += "═".repeat(80) + "\n\n";

  // Resumen General
  output += "🎯 RESUMEN GENERAL\n";
  output += "─".repeat(80) + "\n";
  output += `Timestamp:                  ${report.timestamp}\n`;
  output += `Total de Pruebas:          ${report.totalTests}\n`;
  output += `✅ Pruebas Exitosas:       ${report.passed}/${report.totalTests}\n`;
  output += `❌ Pruebas Fallidas:       ${report.failed}/${report.totalTests}\n`;
  output += `📈 Tasa de Éxito:          ${stats.passRate}%\n`;
  output += `⏱️  Tiempo Promedio:        ${stats.averageResponseTime}ms\n\n`;

  // Performance por Agente
  output += "🤖 PERFORMANCE POR AGENTE\n";
  output += "─".repeat(80) + "\n";
  for (const [agent, perf] of Object.entries(stats.agentPerformance)) {
    const passRate = ((perf.passed / perf.tested) * 100).toFixed(1);
    output += `${agent}:\n`;
    output += `  Testeados:    ${perf.tested}\n`;
    output += `  Exitosos:     ${perf.passed} (${passRate}%)\n`;
    output += `  Tiempo Prom:  ${perf.avgTime}ms\n\n`;
  }

  // Tests Más Lentos
  output += "🐌 TESTS MÁS LENTOS (Top 3)\n";
  output += "─".repeat(80) + "\n";
  for (let i = 0; i < Math.min(3, stats.slowestTests.length); i++) {
    const test = stats.slowestTests[i];
    output += `${i + 1}. ${test.name}\n`;
    output += `   Tiempo: ${test.time}ms\n`;
  }
  output += "\n";

  // Tests Más Rápidos
  output += "⚡ TESTS MÁS RÁPIDOS (Top 3)\n";
  output += "─".repeat(80) + "\n";
  for (let i = 0; i < Math.min(3, stats.fastestTests.length); i++) {
    const test = stats.fastestTests[i];
    output += `${i + 1}. ${test.name}\n`;
    output += `   Tiempo: ${test.time}ms\n`;
  }
  output += "\n";

  // Detalles de Fallos
  if (stats.failedAssertions.length > 0) {
    output += "❌ FALLOS IDENTIFICADOS\n";
    output += "─".repeat(80) + "\n";
    for (const failure of stats.failedAssertions) {
      output += `Test: ${failure.test}\n`;
      for (const assertion of failure.assertions) {
        output += `  ✗ ${assertion.name}\n`;
        if (assertion.error) {
          output += `    Detalle: ${assertion.error}\n`;
        }
      }
      output += "\n";
    }
  } else {
    output += "✅ NINGÚN FALLO IDENTIFICADO\n\n";
  }

  // Detalles de Todos los Tests
  output += "📋 DETALLES DE CADA TEST\n";
  output += "─".repeat(80) + "\n";
  for (const test of report.tests) {
    const statusIcon = test.status === "passed" ? "✅" : "❌";
    output += `${statusIcon} ${test.name}\n`;
    output += `   ID: ${test.id}\n`;
    output += `   Estado: ${test.status}\n`;
    output += `   Tiempo: ${test.processingTime}ms\n`;

    if (test.assertions) {
      output += `   Aserciones:\n`;
      for (const assertion of test.assertions) {
        const icon = assertion.passed ? "✓" : "✗";
        output += `     [${icon}] ${assertion.name}\n`;
      }
    }
    output += "\n";
  }

  // Recomendaciones
  output += "💡 RECOMENDACIONES\n";
  output += "─".repeat(80) + "\n";

  if (stats.passRate === 100) {
    output += "✅ Excelente: Todas las pruebas pasaron.\n";
  } else if (stats.passRate >= 80) {
    output +=
      "⚠️  Bueno: Algunas pruebas fallaron. Revisar los fallos identificados.\n";
  } else {
    output +=
      "❌ Crítico: Muchas pruebas fallaron. Se requiere acción inmediata.\n";
  }

  if (stats.averageResponseTime > 3000) {
    output += "⏱️  Tiempo de respuesta lento: Optimizar prompts y queries.\n";
  }

  output += "\n";
  output += "═".repeat(80) + "\n";

  return output;
}

async function generateHTMLReport(analysis: Analysis): Promise<void> {
  const { report, stats } = analysis;
  const passRate = stats.passRate;
  const statusColor =
    passRate === 100 ? "#10b981" : passRate >= 80 ? "#f59e0b" : "#ef4444";

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Pruebas Conversacionales</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f3f4f6;
      padding: 20px;
      color: #374151;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
    h1 { color: #1f2937; font-size: 32px; margin-bottom: 10px; }
    .timestamp { color: #6b7280; font-size: 14px; }
    
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .summary-card { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid #3b82f6;
    }
    .summary-card h3 { color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }
    .summary-card .value { font-size: 32px; font-weight: bold; color: #1f2937; }
    .summary-card.success { border-left-color: #10b981; }
    .summary-card.warning { border-left-color: #f59e0b; }
    .summary-card.danger { border-left-color: #ef4444; }
    
    .pass-rate { 
      width: 100%; 
      height: 8px; 
      background: #e5e7eb; 
      border-radius: 4px; 
      overflow: hidden;
      margin-top: 10px;
    }
    .pass-rate-fill { 
      height: 100%; 
      background: ${statusColor};
      width: ${passRate}%;
    }
    
    section { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
    section h2 { color: #1f2937; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f9fafb; }
    thead th { padding: 12px; text-align: left; font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; }
    tbody td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    tbody tr:hover { background: #f9fafb; }
    
    .test-item { display: flex; align-items: center; gap: 10px; }
    .test-icon { font-size: 16px; }
    .test-name { flex: 1; }
    .test-time { color: #6b7280; font-size: 14px; }
    
    .agent-badge { 
      display: inline-block; 
      padding: 4px 8px; 
      border-radius: 4px; 
      font-size: 12px; 
      font-weight: 600;
      background: #eff6ff;
      color: #0c4a6e;
    }
    
    .status-passed { color: #10b981; font-weight: 600; }
    .status-failed { color: #ef4444; font-weight: 600; }
    
    footer { text-align: center; color: #9ca3af; font-size: 14px; margin-top: 40px; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Reporte de Pruebas Conversacionales</h1>
      <p class="timestamp">${new Date(report.timestamp).toLocaleString("es-ES")}</p>
    </header>
    
    <div class="summary">
      <div class="summary-card success">
        <h3>Total de Pruebas</h3>
        <div class="value">${report.totalTests}</div>
      </div>
      <div class="summary-card success">
        <h3>Exitosas</h3>
        <div class="value">${report.passed}</div>
      </div>
      <div class="summary-card ${report.failed === 0 ? "success" : "danger"}">
        <h3>Fallidas</h3>
        <div class="value">${report.failed}</div>
      </div>
      <div class="summary-card ${passRate === 100 ? "success" : passRate >= 80 ? "warning" : "danger"}">
        <h3>Tasa de Éxito</h3>
        <div class="value">${passRate.toFixed(1)}%</div>
        <div class="pass-rate"><div class="pass-rate-fill"></div></div>
      </div>
    </div>
    
    <section>
      <h2>🤖 Performance por Agente</h2>
      <table>
        <thead>
          <tr>
            <th>Agente</th>
            <th>Pruebas</th>
            <th>Exitosas</th>
            <th>Tasa</th>
            <th>Tiempo Promedio</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(stats.agentPerformance)
            .map(
              ([agent, perf]) => `
            <tr>
              <td><span class="agent-badge">${agent}</span></td>
              <td>${perf.tested}</td>
              <td>${perf.passed}</td>
              <td>${((perf.passed / perf.tested) * 100).toFixed(1)}%</td>
              <td>${perf.avgTime}ms</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
    
    <section>
      <h2>⚡ Tests Más Rápidos</h2>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Tiempo</th>
          </tr>
        </thead>
        <tbody>
          ${stats.fastestTests
            .map(
              (test) => `
            <tr>
              <td>${test.name}</td>
              <td><span class="test-time">${test.time}ms</span></td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
    
    <section>
      <h2>🐌 Tests Más Lentos</h2>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Tiempo</th>
          </tr>
        </thead>
        <tbody>
          ${stats.slowestTests
            .map(
              (test) => `
            <tr>
              <td>${test.name}</td>
              <td><span class="test-time">${test.time}ms</span></td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
    
    <footer>
      <p>Generated on ${new Date().toLocaleString("es-ES")} | Sistema de Pruebas Conversacionales v1.0</p>
    </footer>
  </div>
</body>
</html>
  `;

  const timestamp = report.timestamp.replace(/[:.]/g, "-");
  const htmlPath = path.join(TESTS_OUTPUT_DIR, `test-report-${timestamp}.html`);
  await fs.writeFile(htmlPath, html);
  console.log(`\n📄 Reporte HTML generado: ${htmlPath}`);
}

async function main(): Promise<void> {
  console.log("🔍 Analizando Resultados de Pruebas Conversacionales\n");

  const report = await findLatestReport();

  if (!report) {
    console.error("❌ No se encontraron reportes de prueba.");
    console.log(
      "\n💡 Ejecuta primero las pruebas:\n   pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts",
    );
    process.exit(1);
  }

  const analysis = analyzeReport(report);
  const reportText = formatAnalysisReport(analysis);

  console.log(reportText);

  // Generar reporte HTML
  try {
    await generateHTMLReport(analysis);
  } catch (error) {
    console.warn("⚠️  No se pudo generar reporte HTML:", error);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
