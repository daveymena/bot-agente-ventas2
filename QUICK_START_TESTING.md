# 🧪 Sistema de Pruebas Conversacionales - QUICK START

## ¿Qué es esto?

Sistema profesional **end-to-end** para probar los 4 agentes IA en conversaciones reales:

- 🛍️ **Agente de Ventas**: Saludo → Consulta → Venta
- 🆘 **Agente de Soporte**: Problema → Resolución
- 🔧 **Agente Técnico**: Consulta → Información
- 👨‍💼 **Agente Admin**: Gestión administrativo

## ⚡ 3 Comandos para Empezar (5 minutos)

### 1️⃣ Cargar Datos Realistas

```bash
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts
```

✅ Inserta:

- 10 productos musicales reales
- 5 clientes con perfiles diferentes
- Configuración profesional del bot
- 4 agentes especializados

### 2️⃣ Ejecutar Pruebas Conversacionales

```bash
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts
```

🎯 Ejecuta 11 pruebas:

- 4 para Agente de Ventas
- 3 para Agente de Soporte
- 3 para Agente Técnico

⏱️ **Duración**: 5-10 minutos

### 3️⃣ Analizar Resultados

```bash
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/analyze-test-results.ts
```

📊 Genera:

- Reporte en consola con estadísticas
- Reporte HTML interactivo
- Análisis por agente

## 📊 Qué se Prueba

| Agente      | Test         | Flujo                           |
| ----------- | ------------ | ------------------------------- |
| **Ventas**  | sales-01     | Saludo → Descubre categorías    |
|             | sales-02     | Consulta específica de producto |
|             | sales-03     | Objeción de precio → Cierre     |
|             | sales-04     | Métodos de pago                 |
| **Soporte** | support-01   | Problema técnico                |
|             | support-02   | Devolución y reemplazo          |
|             | support-03   | Estado de entrega               |
| **Técnico** | technical-01 | Especificaciones                |
|             | technical-02 | Configuración e instalación     |
|             | technical-03 | Comparativa de modelos          |

## 📁 Archivos Creados

```
scripts/
├── conversational-tests.ts    ← 11 pruebas conversacionales
├── seed-test-data.ts          ← Datos de prueba realistas
├── analyze-test-results.ts    ← Análisis y reportes

artifacts/
└── test-reports/              ← Reportes generados (JSON + HTML)

CONVERSATIONAL_TESTING.md       ← Guía completa
```

## 📈 Métricas Evaluadas

Cada prueba mide:

- ✅ **Intención detectada correctamente**
- ⏱️ **Tiempo de respuesta** (ideal < 3s)
- 💬 **Coherencia conversacional**
- 📝 **Profesionalismo y claridad**
- 🎯 **Resolución del cliente**

## 🛠️ Personalización

### Agregar Productos Nuevos

Edita `scripts/seed-test-data.ts`:

```typescript
const TEST_PRODUCTS = [
  {
    name: "Tu Producto",
    description: "Descripción",
    price: 99.99,
    category: "Categoría",
    brand: "Marca",
    stock: 10,
  },
];
```

### Agregar Nuevas Pruebas

Edita `scripts/conversational-tests.ts`:

```typescript
const SALES_AGENT_TESTS: TestConversation[] = [
  // Pruebas existentes...
  {
    id: "sales-05",
    name: "Mi nueva prueba",
    messages: [
      { role: "user", content: "Primer mensaje..." },
      { role: "user", content: "Segundo mensaje..." },
    ],
    // ...
  },
];
```

## 🎯 Flujo Recomendado

### Desarrollo Local

```bash
# Terminal 1: Servidor
pnpm dev

# Terminal 2: Cargar datos → Ejecutar pruebas → Analizar
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/analyze-test-results.ts
```

### Antes de Deploy

```bash
# CI/CD Pipeline
pnpm run build
pnpm run typecheck
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts

# Validar que TODAS pasan
# Si alguna falla → no desplegar
```

## 🔍 Salida Esperada

### Pruebas en Ejecución

```
🚀 Iniciando Sistema de Pruebas Conversacionales

🧪 PRUEBAS DEL AGENTE: Agente de Ventas
════════════════════════════════════════════════════════

📝 Iniciando: Ventas: Saludo y Consulta Inicial
   Cliente: María García (+34912345601)

   👤 Cliente (1/2): "Hola, ¿qué tal? Estoy buscando..."
   🤖 Bot (sales | Intent: saludo): "¡Hola María! Bienvenida a MusicPro Studio..."
   ⏱️  Tiempo: 2450ms | Confianza: 95.2%

   👤 Cliente (2/2): "Me interesa saber qué categorías..."
   🤖 Bot (sales | Intent: consulta_producto): "Tenemos varias categorías..."
   ⏱️  Tiempo: 1850ms | Confianza: 88.5%

✅ Ventas: Saludo y Consulta Inicial - 4300ms

...más pruebas...
```

### Reporte Final

```
════════════════════════════════════════════════════════
📊 ANÁLISIS DETALLADO DE PRUEBAS CONVERSACIONALES
════════════════════════════════════════════════════════

🎯 RESUMEN GENERAL
────────────────────────────────────────────────────────
Total de Pruebas:          11
✅ Pruebas Exitosas:       10/11
❌ Pruebas Fallidas:       1/11
📈 Tasa de Éxito:          90.9%
⏱️  Tiempo Promedio:        2850ms

🤖 PERFORMANCE POR AGENTE
────────────────────────────────────────────────────────
Agente de Ventas:
  Testeados:    4
  Exitosos:     4 (100%)
  Tiempo Prom:  2650ms

Agente de Soporte:
  Testeados:    3
  Exitosos:     3 (100%)
  Tiempo Prom:  2950ms

Agente Técnico:
  Testeados:    3
  Exitosos:     2 (66.7%)
  Tiempo Prom:  3100ms
```

## 🆘 Troubleshooting

| Problema                   | Solución                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| "DATABASE_URL must be set" | Agrega a `.env`: `DATABASE_URL=postgresql://...`                                            |
| "Cannot connect to API"    | Inicia servidor: `pnpm dev`                                                                 |
| "No products found"        | Ejecuta: `pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts` |
| "Timeout en pruebas"       | BD lenta: aumenta timeout en script                                                         |

## 📚 Documentación

- 📖 [Guía Completa](./CONVERSATIONAL_TESTING.md) - Toda la documentación detallada
- 🏗️ [Setup Guide](./SETUP_GUIDE.md) - Instalación y configuración
- 📘 [README Principal](./README.md) - Descripción general del proyecto

## ✨ Características

✅ **11 Pruebas completas** - Flujos reales end-to-end  
✅ **Datos realistas** - 10 productos, 5 clientes auténticum  
✅ **Reportes detallados** - JSON + HTML interactivo  
✅ **Análisis automático** - Estadísticas por agente  
✅ **Fácil de personalizar** - Agregar más pruebas y productos  
✅ **CI/CD ready** - Integrable en pipelines

---

**¡Listo para empezar!** 🚀

Ejecuta los 3 comandos y tendrás análisis completo en 15 minutos.
