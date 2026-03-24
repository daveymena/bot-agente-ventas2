# 🧪 Sistema de Pruebas Conversacionales - Guía Completa

## 📋 Descripción General

Sistema profesional de pruebas end-to-end para validar los 4 agentes IA especializados del sistema en conversaciones reales de venta, soporte y consultoría técnica.

### ¿Qué se prueba?

- **Agente de Ventas**: Flujo completo saludo → consulta → venta
- **Agente de Soporte**: Resolución de problemas y devoluciones
- **Agente Técnico**: Especificaciones y comparaciones técnicas
- **Agente Admin**: Gestión administrativo

## 🚀 Quick Start (5 Minutos)

### Prerequisitos

- Base de datos PostgreSQL corriendo
- Servidor API en `http://localhost:3000`
- Dependencias instaladas (`pnpm install`)

### Paso 1: Cargar Datos de Prueba

```bash
# Inserta 10 productos reales, 5 clientes de prueba y agentes
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts
```

Esto crea:

- ✅ 10 productos musicales reales (pianos, guitarras, etc.)
- ✅ 5 clientes con diferentes perfiles
- ✅ Configuración profesional del bot
- ✅ 4 agentes especializados

**Salida esperada:**

```
📦 Insertando productos de prueba...
✅ 10 productos insertados:
   • Piano Digital 88 Teclas Profesional - $899.99
   • Guitarra Acústica de Madera Maciza - $349.99
   ...

👥 Insertando clientes de prueba...
✅ 5 clientes insertados:
   • María García (+34912345601)
   ...
```

### Paso 2: Ejecutar Pruebas Conversacionales

```bash
# Corre conversaciones realistas con todos los agentes (5-10 minutos)
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts
```

**Esto ejecuta 11 pruebas:**

| Agente     | Pruebas | Flujo                                 |
| ---------- | ------- | ------------------------------------- |
| 🛍️ Ventas  | 4       | Saludo → Consulta → Objeción → Cierre |
| 🆘 Soporte | 3       | Problema → Resolución → Devolución    |
| 🔧 Técnico | 3       | Specs → Instalación → Comparativa     |

### Paso 3: Revisar Reportes

```bash
# Los reportes se guardan aquí:
ls artifacts/test-reports/

# Ver último reporte
cat artifacts/test-reports/test-report-*.json | jq
```

## 📊 Estructura de Pruebas

### Pruebas del Agente de Ventas

```
1. sales-01: Saludo y Consulta Inicial
   Cliente: María García
   Intención: Descubrir qué productos hay
   Esperado: Bot saluda y ofrece categorías

2. sales-02: Consulta Específica de Producto
   Cliente: Juan López
   Intención: Comprar piano - quiere saber modelos y precios
   Esperado: Bot muestra pianos disponibles con precios

3. sales-03: Objeción de Precio y Cierre
   Cliente: Carlos Martín
   Intención: Negocia descuento
   Esperado: Bot justifica valor y cierra venta

4. sales-04: Métodos de Pago
   Cliente: Ana Rodríguez
   Intención: Pagar con cuotas
   Esperado: Bot explica opciones de financiamiento
```

### Pruebas del Agente de Soporte

```
1. support-01: Problema Técnico General
   Cliente: Pedro García
   Problema: Producto no funciona correctamente
   Esperado: Bot recaba detalles e intenta solucionarlo

2. support-02: Devolución y Reemplazo
   Cliente: Laura Fernández
   Problema: Producto dañado
   Esperado: Bot inicia proceso de devolución

3. support-03: Consulta de Entrega
   Cliente: Miguel Sánchez
   Problema: Pedido retrasado
   Esperado: Bot proporciona tracking
```

### Pruebas del Agente Técnico

```
1. technical-01: Especificaciones del Producto
   Cliente: Rafael Jiménez
   Pregunta: Detalles técnicos y compatibilidad
   Esperado: Bot proporciona specs exactas

2. technical-02: Configuración e Instalación
   Cliente: Teresa López
   Pregunta: Cómo instalar y configurar
   Esperado: Bot da pasos claros y accesibles

3. technical-03: Comparación Técnica de Modelos
   Cliente: David Martínez
   Pregunta: Diferencias entre modelos
   Esperado: Bot explica mejoras técnicas por modelo
```

## 📈 Métricas que se Evalúan

Cada prueba mide:

### 1. **Corrección de Intención**

- ¿El agente identificó correctamente la intención del cliente?
- Escala: 0-100%

### 2. **Tiempo de Respuesta**

- ¿La respuesta fue rápida? (ideal < 3 segundos)
- Se mide en milisegundos

### 3. **Coherencia Conversacional**

- ¿Mantiene el contexto entre turnos?
- ¿Las respuestas son relevantes?

### 4. **Profesionalismo**

- ¿Uso de lenguaje apropiado?
- ¿Formato y estructura clara?

### 5. **Resolución**

- ¿El bot resolvió la pregunta del cliente?
- ¿O necesitó escalada?

## 📝 Formato de Reporte

Cada ejecución genera un reporte JSON:

```json
{
  "timestamp": "2024-03-24T10:30:00.000Z",
  "totalTests": 11,
  "passed": 9,
  "failed": 2,
  "tests": [
    {
      "id": "sales-01",
      "name": "Ventas: Saludo y Consulta Inicial",
      "status": "passed",
      "processingTime": 2450,
      "messages": [
        {
          "role": "user",
          "content": "Hola, ¿qué tal?...",
          "agent": "sales",
          "intent": "saludo"
        },
        {
          "role": "bot",
          "content": "¡Hola María! Bienvenida a MusicPro Studio...",
          "agent": "sales",
          "intent": "saludo"
        }
      ],
      "assertions": [
        {
          "name": "Todos los mensajes se enviaron correctamente",
          "passed": true
        },
        {
          "name": "Tiempo de respuesta aceptable (< 5s por mensaje)",
          "passed": true
        }
      ]
    }
  ]
}
```

## 🔧 Configuración Personalizada

### Agregar Nuevos Productos

Edita `scripts/seed-test-data.ts`:

```typescript
const TEST_PRODUCTS = [
  {
    name: "Tu Producto",
    description: "Descripción detallada",
    price: 99.99,
    category: "Categoría",
    brand: "Marca",
    stock: 10,
    imageUrl: "https://...",
  },
  // ...más productos
];
```

Luego ejecuta:

```bash
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts
```

### Agregar Nuevas Conversaciones de Prueba

Edita `scripts/conversational-tests.ts`:

```typescript
const SALES_AGENT_TESTS: TestConversation[] = [
  // Pruebas existentes...
  {
    id: "sales-05",
    name: "Ventas: Tu Nueva Prueba",
    description: "Descripción de qué se prueba",
    phone: "+34912345605",
    clientName: "Nuevo Cliente",
    messages: [
      {
        role: "user",
        content: "Primer mensaje del cliente",
        timestamp: new Date().toISOString(),
      },
      // Más mensajes...
    ],
    status: "pending",
    processingTime: 0,
    startTime: new Date().toISOString(),
  },
];
```

## 🎯 Flujo de Trabajo Recomendado

### Desarrollo Local

```bash
# 1. Terminal 1: Iniciar servidor de desarrollo
pnpm dev

# 2. Terminal 2: En otra ventana, cargar datos
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts

# 3. Terminal 2: Ejecutar pruebas
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts

# 4. Ver resultados
cat artifacts/test-reports/test-report-*.json | jq '.tests[] | {name, status, processingTime}'
```

### Antes de Desplegar a Producción

```bash
# Ejecutar pruebas en modo CI
NODE_ENV=production pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts

# Validar que TODAS las pruebas pasan
pnpm run build
pnpm run typecheck
```

## 🐛 Troubleshooting

### Error: "DATABASE_URL must be set"

```bash
# Verifica que .env tiene DATABASE_URL
echo $DATABASE_URL

# Si no, agrégalo:
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/intelligent_agent_db" >> .env
```

### Error: "Cannot connect to API"

```bash
# Verifica que el servidor está corriendo
curl http://localhost:3000/health

# Si no responde, inicia el servidor:
pnpm --filter @workspace/api-server run dev
```

### Error: "No products found"

```bash
# Carga los datos de prueba:
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts

# Verifica:
curl http://localhost:3000/api/products
```

### Las Pruebas Fallan por Timeout

```bash
# Los timeouts suelen ser por BD lenta
# Aumenta el timeout en conversational-tests.ts:
timeout: 30000  // Cambiar a 30 segundos
```

## 📚 Archivos Clave

```
scripts/
├── conversational-tests.ts    ← Pruebas principales (11 test cases)
├── seed-test-data.ts          ← Insertar datos realistas
└── CONVERSATIONAL_TESTING.md  ← Esta guía

artifacts/
├── api-server/src/
│   ├── agents/               ← 4 agentes especializados
│   └── services/aiService.ts ← Procesamiento IA
└── test-reports/             ← Reportes generados

lib/db/src/schema/            ← Esquemas BD
├── products.ts
├── clients.ts
├── conversations.ts
└── agents.ts
```

## 🎓 Casos de Uso Avanzados

### Testing Manual en Dashboard

1. Abre http://localhost:3000/dashboard
2. Navega a "Chat" o "Test"
3. Selecciona un cliente de prueba
4. Envía mensajes manualmente
5. Observa respuestas del agente

### Integración con CI/CD

```yaml
# .github/workflows/test.yml
name: Conversational Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts
      - run: pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts
```

### Análisis de Conversaciones Guardadas

```bash
# Ver todas las conversaciones de un cliente
curl "http://localhost:3000/api/conversations?clientId=1"

# Ver conversaciones por intención
curl "http://localhost:3000/api/conversations?intent=compra"

# Exportar para análisis
curl http://localhost:3000/api/conversations > conversations.json
```

## 📞 Soporte

- 📖 Documentación: Ver [SETUP_GUIDE.md](../SETUP_GUIDE.md)
- 🐛 Issues: https://github.com/tu-repo/issues
- 💬 Discussions: https://github.com/tu-repo/discussions

---

**Última actualización:** Marzo 2024  
**Versión:** 1.0.0  
**Autores:** Sistema Inteligente de Agentes
