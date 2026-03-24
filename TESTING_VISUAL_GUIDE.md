# 🧪 Sistema de Pruebas Conversacionales - Diagrama Visual

## 📊 Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  SISTEMA DE PRUEBAS CONVERSACIONALES                    │
└─────────────────────────────────────────────────────────────────────────┘

1️⃣  PREPARACIÓN
    └──> seed-test-data.ts
         ├── Inserta 10 productos
         ├── Crea 5 clientes
         ├── Configura bot profesional
         └── Crea 4 agentes especializados

                    ↓

2️⃣  EJECUCIÓN DE PRUEBAS
    └──> conversational-tests.ts

         ┌────────────────────┐
         │   11 Pruebas       │
         ├────────────────────┤
         │ 4 - Agente Ventas  │
         │ 3 - Agente Soporte │
         │ 3 - Agente Técnico │
         └────────────────────┘

         Para cada prueba:
         ├── Crear cliente
         ├── Enviar mensaje 1
         ├── Recibir respuesta 1
         ├── Medir tiempo
         ├── Enviar mensaje 2
         ├── Recibir respuesta 2
         ├── Guardar historial
         └── Validar aserciones

                    ↓

3️⃣  ANÁLISIS
    └──> analyze-test-results.ts
         ├── Calcula tasa de éxito
         ├── Analiza tiempos
         ├── Genera estadísticas por agente
         ├── Crea reporte console
         └── Genera HTML interactivo

                    ↓

4️⃣  SALIDA
    └──> artifacts/test-reports/
         ├── test-report-TIMESTAMP.json (datos)
         ├── test-report-TIMESTAMP.html (visual)
         └── Console output (immediato)
```

## 🤖 Flujo Conversacional - Agente de Ventas

```
PRUEBA: sales-01 (Saludo y Consulta Inicial)
CLIENT: María García (+34912345601)

┌────────────────────────────────────────────────────────────────┐
│ TURNO 1: SALUDO                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  👤 CLIENTE:                                                   │
│  "Hola, ¿qué tal? Estoy buscando un producto para mi negocio" │
│                                                                │
│  ↓ [envía a API]                                               │
│                                                                │
│  🔍 PROCESAMIENTO:                                             │
│  1. Clasificar intención: "saludo"                             │
│  2. Buscar productos relevantes                               │
│  3. Cargar historial del cliente                              │
│  4. Orchestrar agente: sales                                  │
│  5. Generar respuesta IA                                      │
│  6. Guardar en historial                                      │
│                                                                │
│  ⏱️  TIEMPO: 2.45 segundos                                     │
│  🤖 BOT:                                                       │
│  "¡Hola María! 👋 Bienvenida a MusicPro Studio.               │
│   Somos especialistas en instrumentos musicales.              │
│   ¿Cuál es tu presupuesto y qué tipo de instrumento           │
│   te interesa?"                                               │
│                                                                │
│  📊 INTENCIÓN: saludo (95.2% confianza)                       │
│  🤖 AGENTE: sales                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TURNO 2: CONSULTA                                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  👤 CLIENTE:                                                   │
│  "Me interesa saber qué categorías de productos tienen"       │
│                                                                │
│  🔍 PROCESAMIENTO:                                             │
│  1. Clasificar intención: "consulta_producto"                 │
│  2. Buscar todos los productos activos                        │
│  3. Obtener historial previo (2 mensajes)                     │
│  4. Mantener agente: sales                                    │
│  5. Generar respuesta con contexto previo                     │
│                                                                │
│  ⏱️  TIEMPO: 1.85 segundos                                     │
│  🤖 BOT:                                                       │
│  "Excelente pregunta. Tenemos 5 categorías principales:       │
│   • 🎹 Instrumentos Musicales                                 │
│   • 🎙️ Equipos de Audio                                       │
│   • 🎚️ Accesorios                                             │
│   ¿Cuál te interesa?"                                         │
│                                                                │
│  📊 INTENCIÓN: consulta_producto (88.5% confianza)            │
│  🤖 AGENTE: sales                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘

✅ TEST RESULTADO: PASSED
⏱️  TIEMPO TOTAL: 4.3 segundos
📊 ASERCIONES:
   ✓ Todos los mensajes se enviaron correctamente
   ✓ Tiempo de respuesta aceptable (< 5s por mensaje)
   ✓ Conversación mantuvo coherencia
```

## 🧠 Agentes Especializados

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORQUESTACIÓN DE AGENTES                    │
└─────────────────────────────────────────────────────────────────┘

MENSAJE DEL CLIENTE
        ↓
    [ORCHESTRATOR]
    "¿Quién debe responder?"
        ↓
    ┌─────────────────────────────────────────┐
    │   ANÁLISIS DEL CONTEXTO:                │
    │   • Mensaje: "Quiero comprar un piano"  │
    │   • Intención: compra                   │
    │   • Historial: 5 mensajes previos       │
    │   • Lead status: warm                   │
    └─────────────────────────────────────────┘
        ↓
    ┌──────────┬──────────┬──────────┬─────────┐
    │ VENTAS   │ SOPORTE  │ TÉCNICO  │ ADMIN   │
    │  (80%)   │  (5%)    │  (10%)   │  (5%)   │
    └──────────┴──────────┴──────────┴─────────┘
        ↓
    SELECCIONA: AGENTE VENTAS
        ↓

1️⃣  AGENTE DE VENTAS
    ┌────────────────────────────────────────────┐
    │ ESPECIALISTA EN CONVERSIÓN Y CIERRE        │
    │                                            │
    │ FUNCIONES:                                 │
    │ • Entender necesidades del cliente         │
    │ • Recomendar productos apropiados          │
    │ • Responder sobre precio y características │
    │ • Guiar hacia la compra                    │
    │ • Manejar objeciones                       │
    │                                            │
    │ TONO: Amable, entusiasta, persuasivo      │
    │                                            │
    │ SKILLS:                                    │
    │ ✓ Búsqueda de productos                   │
    │ ✓ Comparación de precios                  │
    │ ✓ Cálculo de descuentos                   │
    │ ✓ Manejo de objeciones                    │
    └────────────────────────────────────────────┘

2️⃣  AGENTE DE SOPORTE
    ┌────────────────────────────────────────────┐
    │ ESPECIALISTA EN RESOLUCIÓN Y RETENCIÓN     │
    │                                            │
    │ FUNCIONES:                                 │
    │ • Identificar problemas                    │
    │ • Proporcionar soluciones                  │
    │ • Gestionar devoluciones                   │
    │ • Mantener satisfacción del cliente        │
    │                                            │
    │ TONO: Empático, profesional, resolutivo   │
    │                                            │
    │ SKILLS:                                    │
    │ ✓ Troubleshooting                         │
    │ ✓ Gestión de devoluciones                 │
    │ ✓ Tracking de pedidos                     │
    │ ✓ Escalada a supervisor                   │
    └────────────────────────────────────────────┘

3️⃣  AGENTE TÉCNICO
    ┌────────────────────────────────────────────┐
    │ ESPECIALISTA EN ESPECIFICACIONES           │
    │                                            │
    │ FUNCIONES:                                 │
    │ • Proporcionar datos técnicos              │
    │ • Comparar especificaciones                │
    │ • Explicar características                 │
    │ • Dar recomendaciones técnicas             │
    │                                            │
    │ TONO: Experto, claro, accesible           │
    │                                            │
    │ SKILLS:                                    │
    │ ✓ Especificaciones exactas                │
    │ ✓ Compatibilidad de sistemas              │
    │ ✓ Instalación y setup                     │
    │ ✓ Análisis técnico comparativo            │
    └────────────────────────────────────────────┘

4️⃣  AGENTE ADMIN
    ┌────────────────────────────────────────────┐
    │ ESPECIALISTA EN GESTIÓN ADMINISTRATIVA     │
    │                                            │
    │ FUNCIONES:                                 │
    │ • Gestionar pedidos                        │
    │ • Información de facturación               │
    │ • Datos administrativos                    │
    │ • Coordinación interna                     │
    │                                            │
    │ TONO: Profesional, preciso, formal        │
    │                                            │
    │ SKILLS:                                    │
    │ ✓ Gestión de órdenes                      │
    │ ✓ Información de facturación              │
    │ ✓ Datos administrativos                   │
    │ ✓ Seguimiento de procesos                 │
    └────────────────────────────────────────────┘
```

## 📊 Flujo de Datos en Base de Datos

```
ANTES DE PRUEBAS:
┌──────────────────────────────┐
│     productsTable (0)        │
│     clientsTable (0)         │
│     conversationsTable (0)   │
└──────────────────────────────┘

DESPUÉS DE SEED:
┌──────────────────────────────┐
│   productsTable (10)         │
│   ├─ Piano Digital           │
│   ├─ Guitarra Acústica       │
│   ├─ Ukelele Soprano         │
│   ├─ Amplificador            │
│   ├─ Batería Acústica        │
│   ├─ Micrófono Condensador   │
│   ├─ Interfaz de Audio       │
│   ├─ Cascos Audiófilos       │
│   ├─ Soporte Micrófono       │
│   └─ Cable XLR               │
│                              │
│   clientsTable (5)           │
│   ├─ María García            │
│   ├─ Juan López              │
│   ├─ Carlos Martín           │
│   ├─ Ana Rodríguez           │
│   └─ Pedro García            │
│                              │
│   botConfigTable (1)         │
│   └─ MusicPro Studio Config  │
│                              │
│   agentsTable (4)            │
│   ├─ Agente Ventas           │
│   ├─ Agente Soporte          │
│   ├─ Agente Técnico          │
│   └─ Agente Admin            │
└──────────────────────────────┘

DURANTE PRUEBAS:
┌──────────────────────────────┐
│ conversationsTable (+22)      │
│                              │
│ Prueba 1: 2 mensajes         │
│ ├─ User: "Hola, qué tal?"   │
│ └─ Bot: "¡Hola María!..."   │
│                              │
│ Prueba 2: 2 mensajes         │
│ ├─ User: "Quiero un piano"  │
│ └─ Bot: "Tenemos pianos..."  │
│                              │
│ ... (más conversaciones)     │
│                              │
│ Total: 22 mensajes guardados │
│ (2 mensajes por prueba × 11) │
└──────────────────────────────┘
```

## 📈 Métricas y Evaluación

```
PARA CADA TEST:
┌─────────────────────────────────────────────┐
│          REPORTE DE UNA PRUEBA              │
├─────────────────────────────────────────────┤
│                                             │
│ sales-01: Ventas - Saludo y Consulta       │
│                                             │
│ ⏱️  TIEMPO:                                  │
│    ├─ Turno 1: 2.45s                       │
│    ├─ Turno 2: 1.85s                       │
│    └─ TOTAL: 4.30s                         │
│                                             │
│ 🎯 INTENCIONES:                             │
│    ├─ Turno 1: saludo (95.2%)              │
│    └─ Turno 2: consulta_producto (88.5%)   │
│                                             │
│ 🤖 AGENTES:                                 │
│    ├─ Turno 1: sales                       │
│    └─ Turno 2: sales                       │
│                                             │
│ ✅ ASERCIONES:                              │
│    ├─ Mensajes enviados: PASSED            │
│    ├─ Tiempo aceptable: PASSED             │
│    └─ Coherencia: PASSED                   │
│                                             │
│ 📊 ESTADO: PASSED ✅                        │
│                                             │
└─────────────────────────────────────────────┘

REPORTE AGREGADO:
┌─────────────────────────────────────────────┐
│        RESUMEN DE TODAS LAS PRUEBAS         │
├─────────────────────────────────────────────┤
│                                             │
│ Total: 11 pruebas                          │
│ Pasadas: 10 (90.9%)                        │
│ Fallidas: 1 (9.1%)                         │
│                                             │
│ AGENTE DE VENTAS:                          │
│ ├─ Testeados: 4                            │
│ ├─ Pasadas: 4 (100%)                       │
│ └─ Tiempo promedio: 2.65s                  │
│                                             │
│ AGENTE DE SOPORTE:                         │
│ ├─ Testeados: 3                            │
│ ├─ Pasadas: 3 (100%)                       │
│ └─ Tiempo promedio: 2.95s                  │
│                                             │
│ AGENTE TÉCNICO:                            │
│ ├─ Testeados: 3                            │
│ ├─ Pasadas: 2 (66.7%)                      │
│ └─ Tiempo promedio: 3.10s                  │
│                                             │
│ ⏱️  Tiempo Total: 31.5 minutos              │
│                                             │
└─────────────────────────────────────────────┘
```

## 🔄 Ciclo de Vida de una Prueba

```
START
  │
  ├─► SETUP
  │   ├─ Crear cliente en BD
  │   ├─ Asignar teléfono único
  │   └─ Cargar nombre del cliente
  │
  ├─► PRIMER MENSAJE
  │   ├─ Enviar mensaje 1
  │   ├─ API procesa
  │   ├─ Guardar en historial
  │   ├─ Medir tiempo (T1)
  │   └─ Guardar intención y agente
  │
  ├─► SEGUNDO MENSAJE
  │   ├─ Enviar mensaje 2
  │   ├─ API procesa (con historial)
  │   ├─ Guardar en historial
  │   ├─ Medir tiempo (T2)
  │   └─ Guardar intención y agente
  │
  ├─► VALIDACIÓN
  │   ├─ Aserciones:
  │   │  ├─ ¿Mensajes llegaron?
  │   │  ├─ ¿Tiempos aceptables?
  │   │  └─ ¿Conversación coherente?
  │   └─ Determinar PASSED/FAILED
  │
  ├─► AGREGACIÓN
  │   ├─ Almacenar resultados
  │   ├─ Calcular estadísticas
  │   └─ Preparar para reporte
  │
  ├─► REPORTE
  │   ├─ Guardar JSON
  │   ├─ Generar HTML
  │   └─ Mostrar en consola
  │
  END
```

---

**Sistema diseñado para ser:**

- ✅ Profesional y realista
- ✅ Fácil de ejecutar
- ✅ Información detallada
- ✅ Escalable para más pruebas
- ✅ Listo para CI/CD
