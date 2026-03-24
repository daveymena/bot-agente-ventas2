# Documentación: Sistema de Búsqueda de Productos - Bot de Ventas

## 📋 Índice Completo

### Documentos Generados (Nueva documentación)

Esta documentación fue generada para explicar completamente cómo funciona la búsqueda de productos en el bot de ventas inteligente.

#### 1. **RESUMEN_EJECUTIVO.txt** ⭐ COMIENZA AQUÍ
**Tamaño**: 12 KB | **Lectura**: 5-10 minutos

Visión general rápida del sistema:
- Cómo funciona la búsqueda de "piano" en 6 pasos
- 5 problemas principales por qué falla
- 10 puntos clave para recordar
- Checklist rápido de solución

**👉 Lee esto PRIMERO si tienes prisa**

---

#### 2. **QUICK_START_REFERENCE.md** ⭐ REFERENCIA RÁPIDA
**Tamaño**: 8.1 KB | **Lectura**: 3-5 minutos

Preguntas y respuestas rápidas:
- P: ¿Por qué falla a veces?
- P: ¿Dónde se buscan los productos?
- P: ¿Cómo se valida si existe?
- Tabla de archivos críticos
- Comandos de diagnóstico
- Checklist de verificación

**👉 Usa esto cuando necesites respuesta RÁPIDA a una pregunta específica**

---

#### 3. **PRODUCT_SEARCH_SYSTEM_ANALYSIS.md** 📚 DOCUMENTACIÓN TÉCNICA COMPLETA
**Tamaño**: 8.3 KB | **Lectura**: 15-20 minutos

Explicación técnica profunda:
- Arquitectura general del sistema
- Flujo paso-a-paso con ejemplos
- Componentes clave (BD, funciones, etc.)
- 6 problemas identificados + soluciones
- Caso especial: búsqueda de "piano"
- Diagrama de flujo completo
- Archivos relacionados

**👉 Lee esto si necesitas ENTENDER completamente**

---

#### 4. **TROUBLESHOOTING_PRODUCT_SEARCH.md** 🔧 GUÍA DE SOLUCIÓN DE PROBLEMAS
**Tamaño**: 8.3 KB | **Lectura**: 10-15 minutos

Guía práctica para problemas:
- Checklist rápida (5 verificaciones)
- Soluciones específicas para cada problema
- Diagrama de depuración
- Comandos SQL y curl para diagnosticar
- Casos de prueba completos

**👉 Usa esto cuando la búsqueda FALLA**

---

#### 5. **VISUAL_FLOW_DIAGRAMS.txt** 📊 DIAGRAMAS VISUALES
**Tamaño**: 13 KB | **Lectura**: 10 minutos

Diagramas ASCII del flujo:
- Capas de la aplicación
- Flujo paso-a-paso completo (11 pasos)
- Árbol de decisión: ¿Por qué falla?
- Puntos de falla críticos

**👉 Mejor para ENTENDER VISUALMENTE el flujo**

---

## 🎯 Cómo Usar Esta Documentación

### Escenario 1: "Necesito entender el sistema AHORA"
```
1. Lee: RESUMEN_EJECUTIVO.txt (5 min)
2. Lee: PRODUCT_SEARCH_SYSTEM_ANALYSIS.md (15 min)
3. Visualiza: VISUAL_FLOW_DIAGRAMS.txt (10 min)
Total: 30 minutos → Conocimiento completo
```

### Escenario 2: "La búsqueda no funciona, necesito arreglarlo RÁPIDO"
```
1. Abre: QUICK_START_REFERENCE.md
2. Busca tu problema en tabla de "Problemas Comunes"
3. Ejecuta checklist de diagnóstico
4. Aplica solución correspondiente
Total: 5-10 minutos → Problema resuelto (probablemente)
```

### Escenario 3: "Necesito una referencia para consultar después"
```
- Guarda: QUICK_START_REFERENCE.md
- Usa cuando necesites: ¿Qué archivo hace qué?
- Consulta tabla: "Funciones Clave"
- Copia-pega comandos de diagnóstico
```

### Escenario 4: "Necesito debuggear paso-a-paso"
```
1. Abre: TROUBLESHOOTING_PRODUCT_SEARCH.md
2. Sección: "Diagrama de Depuración"
3. Ejecuta comando en cada paso
4. Compara con esperado
```

---

## 📁 Estructura de Archivos del Proyecto

### Archivos Clave para Búsqueda de Productos

```
artifacts/api-server/src/
├── core/
│   └── router.ts                    ← PRINCIPAL: handleMessage() y búsquedas
├── services/
│   └── aiService.ts                 ← IA: classifyIntent, searchRelevantProducts
├── agents/
│   ├── salesAgent.ts                ← Respuestas de ventas
│   └── technicalAgent.ts            ← Respuestas técnicas
└── routes/
    ├── products.ts                  ← CRUD de productos (API)
    ├── importProducts.ts            ← Importación de datos
    └── chat.ts                      ← Endpoint POST /api/chat/message

lib/db/src/
├── schema/
│   └── products.ts                  ← ESQUEMA: definición tabla products
└── index.ts                         ← Conexión a BD
```

---

## 🔍 Búsqueda Rápida por Problema

| Problema | Documento | Sección |
|----------|-----------|---------|
| ¿Dónde se buscan los productos? | QUICK_START_REFERENCE.md | P: ¿Dónde se buscan...? |
| Producto no se encuentra | TROUBLESHOOTING_PRODUCT_SEARCH.md | Solución 1 |
| isActive = false | TROUBLESHOOTING_PRODUCT_SEARCH.md | Solución 2 |
| LLM no reconoce | TROUBLESHOOTING_PRODUCT_SEARCH.md | Solución 3 |
| Normalización falla | TROUBLESHOOTING_PRODUCT_SEARCH.md | Solución 4 |
| BD desconectada | TROUBLESHOOTING_PRODUCT_SEARCH.md | Solución 5 |
| Importar productos | QUICK_START_REFERENCE.md | "Cómo Importar Productos" |
| Ver logs | TROUBLESHOOTING_PRODUCT_SEARCH.md | "LOGS IMPORTANTES" |
| Flujo paso-a-paso | PRODUCT_SEARCH_SYSTEM_ANALYSIS.md | Sección 2 |
| Diagrama visual | VISUAL_FLOW_DIAGRAMS.txt | FLUJO DETALLADO PASO-A-PASO |

---

## 🎓 Conceptos Clave

### Las 2 Búsquedas Principales

1. **searchRelevantProducts()** (IA)
   - Ubicación: `aiService.ts` línea 90
   - Usa: OpenAI gpt-4o-mini + Normalización
   - Retorna: Productos MÁS RELEVANTES
   - Mejor para: Búsquedas semánticas

2. **getProductContext()** (SQL)
   - Ubicación: `router.ts` línea 37
   - Usa: SQL ILIKE
   - Retorna: Productos por regex
   - Mejor para: Búsquedas exactas

### El Flujo en 30 Segundos

```
Usuario: "Quiero piano"
    ↓
classifyIntent() → {intent: "consulta_producto", entities: {product: "piano"}}
    ↓
searchRelevantProducts() → ["Piano Profesional", "Piano Digital"]
    ↓
Query BD → Objetos con precio, descripción, etc.
    ↓
orchestrate() → Decide qué agente responde
    ↓
generateResponse() → "Tenemos Piano Profesional $5999..."
    ↓
Respuesta a Usuario ✓
```

---

## 📊 Estadísticas de Documentación

| Documento | Tamaño | Tiempo Lectura | Público |
|-----------|--------|---|---------|
| RESUMEN_EJECUTIVO.txt | 12 KB | 5-10 min | Todos |
| QUICK_START_REFERENCE.md | 8.1 KB | 3-5 min | Developers |
| PRODUCT_SEARCH_SYSTEM_ANALYSIS.md | 8.3 KB | 15-20 min | Developers |
| TROUBLESHOOTING_PRODUCT_SEARCH.md | 8.3 KB | 10-15 min | DevOps |
| VISUAL_FLOW_DIAGRAMS.txt | 13 KB | 10 min | Architects |
| **TOTAL** | **50 KB** | **~1 hora** | - |

---

## 🚀 Pasos Siguientes Recomendados

### Si eres nuevo en el proyecto:
1. Lee: RESUMEN_EJECUTIVO.txt
2. Mira: VISUAL_FLOW_DIAGRAMS.txt
3. Lee: PRODUCT_SEARCH_SYSTEM_ANALYSIS.md
4. Guarda: QUICK_START_REFERENCE.md para referencia

### Si estás debuggeando:
1. Abre: TROUBLESHOOTING_PRODUCT_SEARCH.md
2. Ejecuta: Checklist de diagnóstico
3. Compara: Con "Problemas Comunes"
4. Aplica: Solución recomendada

### Si necesitas mantener el sistema:
1. Memoriza: 5 Problemas Principales
2. Ten cerca: QUICK_START_REFERENCE.md
3. Ejecuta regularmente: Comandos de verificación
4. Importa: Nuevos productos cuando sea necesario

---

## 📞 Referencias Rápidas

### Comandos Esenciales

```bash
# Ver si hay productos
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products WHERE is_active=true"

# Buscar por nombre
psql $DATABASE_URL -c "SELECT * FROM products WHERE name ILIKE '%piano%'"

# Probar búsqueda
curl http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"phone": "test", "message": "Quiero un piano"}'

# Ver logs
tail -f output.log | grep -i "product\|error"
```

### Funciones Críticas

| Función | Archivo | Línea |
|---------|---------|-------|
| handleMessage | router.ts | 108 |
| classifyIntent | aiService.ts | 64 |
| searchRelevantProducts | aiService.ts | 90 |
| getProductContext | router.ts | 37 |
| orchestrate | aiService.ts | 175 |
| generateResponse | aiService.ts | 231 |

---

## ❓ Preguntas Frecuentes (Mini FAQ)

**P: ¿Por qué a veces encuentra "piano" y a veces no?**
A: Ver PRODUCT_SEARCH_SYSTEM_ANALYSIS.md Sección 4 - 6 problemas principales

**P: ¿Dónde se guardan los productos?**
A: PostgreSQL tabla `products`. Ver QUICK_START_REFERENCE.md "Dónde están los productos almacenados"

**P: ¿Cómo importo productos?**
A: QUICK_START_REFERENCE.md "Cómo Importar Productos (3 formas)"

**P: ¿Qué significa isActive?**
A: Si es false, el producto NO aparece en búsquedas. Siempre debe ser true.

**P: ¿Puedo cambiar la lógica de búsqueda?**
A: Sí, está e
