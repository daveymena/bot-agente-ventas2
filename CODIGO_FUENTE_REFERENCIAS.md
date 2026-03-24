# Referencias de Código Fuente - Búsqueda de Productos

## Mapeo Completo: ¿Qué está en cada archivo?

### 1. ROUTER PRINCIPAL (ORQUESTADOR)
**Archivo**: `artifacts/api-server/src/core/router.ts`

| Función | Líneas | Qué Hace |
|---------|--------|---------|
| `getAgentPrompt()` | 7-12 | Obtiene prompt personalizado del agente |
| `getBotConfig()` | 14-21 | Obtiene configuración del bot |
| `getOrCreateClient()` | 23-30 | Obtiene o crea cliente |
| `getHistory()` | 32-35 | Obtiene historial de conversaciones |
| `getProductContext()` | 37-80 | ★ **BÚSQUEDA SQL (FALLBACK)** |
| `getKnowledgeContext()` | 82-106 | Obtiene información de base de conocimiento |
| `handleMessage()` | 108-196 | ★ **FUNCIÓN PRINCIPAL** |

**handleMessage() paso-a-paso**:
- Línea 110: Obtiene cliente y config
- Línea 112-114: Verifica si bot está activo
- Línea 117: Obtiene historial
- Línea 118: Clasifica intención
- Línea 121: ★ Get productos activos
- Línea 124: ★ Búsqueda semántica de productos
- Línea 127-137: ★ Query BD o fallback
- Línea 139: Obtiene contexto de conocimiento
- Línea 145: Orquestación (qué agente)
- Línea 152: Obtiene prompt del agente
- Línea 168: Genera respuesta final
- Línea 174-177: Guarda en conversaciones
- Línea 187-193: Actualiza estado del cliente

---

### 2. SERVICIOS DE IA (CORE INTELIGENCIA)
**Archivo**: `artifacts/api-server/src/services/aiService.ts`

| Función | Líneas | Qué Hace |
|---------|--------|---------|
| `getClient()` | 39-62 | Obtiene cliente OpenAI (proveedor) |
| `classifyIntent()` | 64-89 | ★ Clasifica intención del mensaje |
| `searchRelevantProducts()` | 90-173 | ★ **BÚSQUEDA IA SEMÁNTICA (PRINCIPAL)** |
| `orchestrate()` | 175-229 | Decide qué agente debe responder |
| `generateResponse()` | 231-257 | Genera respuesta final con contexto |

**classifyIntent() [Líneas 64-89]**:
- Llama a OpenAI gpt-4o-mini
- Retorna: {intent, confidence, entities}
- Extrae producto/marca/categoría

**searchRelevantProducts() [Líneas 90-173]**:
- ★ FUNCIÓN CRÍTICA PARA BÚSQUEDA
- Línea 95-113: Pregunta a LLM qué busca cliente
- Línea 117-125: **Normalización de nombres** (elimina diacríticos, caracteres especiales)
- Línea 127: Valida si respuesta es "none"
- Línea 130-133: Crea mapa de nombres normalizados
- Línea 136-139: Divide LLM output por separadores
- Línea 143-157: Busca coincidencias exactas/substring
- Línea 160-165: Fallback: busca en texto completo
- Línea 167-169: Retorna nombres encontrados

**normalize() [Líneas 118-125]**:
```
Entrada: "Piano—Digital" (guión largo)
  .normalize("NFD") → descompone caracteres
  .replace(/\p{Diacritic}/gu, "") → elimina diacríticos (á→a)
  .replace(/[^a-z0-9\s]/gi, "") → elimina especiales ← ¡BUG AQUÍ!
  .replace(/\s+/g, " ") → colapsa espacios
  .toLowerCase() → minúsculas
Salida: "pianodigital" ← ¡Sin espacio!
```

**orchestrate() [Líneas 175-229]**:
- Pregunta a LLM qué agente es mejor
- Retorna nombre del agente
- Agentes disponibles: saludo, interes_producto, tecnico, etc.

**generateResponse() [Líneas 231-257]**:
- Llama a OpenAI gpt-4o (modelo completo)
- Input: systemPrompt + context + history + mensaje
- Output: Respuesta de texto

---

### 3. AGENTE DE VENTAS (RESPUESTAS)
**Archivo**: `artifacts/api-server/src/agents/salesAgent.ts`

| Función | Líneas | Qué Hace |
|---------|--------|---------|
| `HANDLED_INTENTS[]` | 6-16 | Lista de intenciones que maneja |
| `handle()` | 18-67 | ★ Genera respuesta de ventas |

**handle() [Líneas 18-67]**:
- Línea 30-42: Busca productos por entities
- Línea 44-46: Crea contexto con productos
- Línea 48-64: Crea system prompt personalizado
- Línea 66: Llama a generateResponse()

**Query de productos [Líneas 30-42]**:
```typescript
if (entities.category || entities.product || entities.brand) {
  const conditions = [];
  if (entities.category) 
    conditions.push(ilike(productsTable.category, `%${entities.category}%`))
  if (entities.brand) 
    conditions.push(ilike(productsTable.brand, `%${entities.brand}%`))
  if (entities.product) 
    conditions.push(ilike(productsTable.name, `%${entities.product}%`))
  
  products = await db.select().from(productsTable).where(
    conditions.length > 0 ? 
      and(...conditions, eq(productsTable.isActive, true)) :
      eq(productsTable.isActive, true)
  ).limit(5)
}
```

---

### 4. AGENTE TÉCNICO (RESPUESTAS)
**Archivo**: `artifacts/api-server/src/agents/technicalAgent.ts`

| Función | Líneas | Qué Hace |
|---------|--------|---------|
| `HANDLED_INTENTS[]` | 6 | Intenciones: especificacion_tecnica, comparacion |
| `handle()` | 8-50 | Genera respuesta técnica |

Maneja búsquedas técnicas de manera similar a salesAgent

---

### 5. CRUD DE PRODUCTOS (API REST)
**Archivo**: `artifacts/api-server/src/routes/products.ts`

| Endpoint | Líneas | Qué Hace |
|----------|--------|---------|
| `GET /products` | 23-40 | Listado con búsqueda SQL |
| `POST /products` | 42-51 | Crear producto |
| `PUT /products/:id` | 53-66 | Actualizar producto |
| `DELETE /products/:id` | 68-77 | Desactivar producto |

**GET /products [Líneas 23-40]**:
- Query params: `search`, `category`, `limit`, `offset`
- Línea 29: Filtro por categoría
- Línea 30: ★ Filtro por búsqueda (nombre OR marca)
- Búsqueda SQL: `ilike(productsTable.name, `%${search}%`)`
- Retorna: JSON con array de productos

---

### 6. IMPORTACIÓN DE PRODUCTOS
**Archivo**: `artifacts/api-server/src/routes/importProducts.ts`

| Endpoint | Líneas | Qué Hace |
|----------|--------|---------|
| `POST /products/import/excel` | 26-70 | Importar de CSV/Excel |
| `POST /products/import/json` | 72-86 | Importar JSON |
| `POST /products/import/woocommerce` | 88-140 | Importar de WooCommerce |

**parseProducts() [Líneas 10-24]**:
- Normaliza datos entrantes
- Valida campos requeridos
- Convierte tipos de datos

---

### 7. ESQUEMA DE BASE DE DATOS
**Archivo**: `lib/db/src/schema/products.ts`

| Campo | Tipo | Propósito |
|-------|------|----------|
| `id` | SERIAL | PK |
| `name` | TEXT | ★ Crítico para búsqueda |
| `description` | TEXT | Detalles |
| `price` | REAL | Precio USD |
| `category` | VARCHAR(100) | Categoría |
| `brand` | TEXT | Marca |
| `stock` | INTEGER | Disponibilidad |
| `imageUrl` | TEXT | Imagen |
| `isActive` | BOOLEAN | ★ Filtro crítico |
| `createdAt` | TIMESTAMP | Fecha |

---

### 8. ENDPOINT DE CHAT
**Archivo**: `artifacts/api-server/src/routes/chat.ts`

| Endpoint | Líneas | Qué Hace |
|----------|--------|---------|
| `POST /chat/message` | 6-21 | ★ Punto de entrada del usuario |

**Lógica**:
- Línea 15: Llama a `handleMessage()` de router.ts
- Retorna: {response, intent, agent, confidence, clientId, processingTime}

---

## Flujo de Llamadas (Call Stack)

```
1. POST /api/chat/message
   └─ routes/chat.ts:15 → handleMessage()
   
2. handleMessage() [router.ts:108]
   ├─ getOrCreateClient() [line 110]
   ├─ getHistory() [line 117]
   ├─ classifyIntent() [line 118] ← aiService.ts
   ├─ Get Products [line 121]
   │  └─ db.select() ... isActive=true
   ├─ searchRelevantProducts() [line 124] ← aiService.ts ★★★
   │  └─ LLM call (gpt-4o-mini)
   │     └─ normalize() [line 118-125]
   ├─ Query BD [line 128]
   │  └─ db.select() ... WHERE name IN (...)
   ├─ getProductContext() [line 136] (si no encontró)
   ├─ getKnowledgeContext() [line 139]
   ├─ orchestrate() [line 145] ← aiService.ts
   │  └─ LLM call (gpt-4o-mini)
   ├─ getAgentPrompt() [line 152]
   ├─ generateResponse() [line 168] ← aiService.ts
   │  └─ LLM call (gpt-4o) ← MODELO COMPLETO
   └─ Save & Return [line 174-195]
```

---

## Números Clave de Línea - Referencia Rápida

### Búsqueda
| Qué | Archivo | Línea |
|-----|---------|-------|
| Búsqueda IA (PRINCIPAL) | aiService.ts | 90-173 |
| Normalización | aiService.ts | 118-125 |
| Búsqueda SQL (fallback) | router.ts | 37-80 |
| Query BD con nombres | router.ts | 128-130 |

### Clasificación
| Qué | Archivo | Línea |
|-----|---------|-------|
| Clasificar intención | aiService.ts | 64-89 |
| Extraer entities | aiService.ts | 73 |

### Validación
| Qué | Archivo | Línea |
|-----|---------|-------|
| ¿isActive = true? | router.ts | 37, 40, 57, 69 |
| ¿Producto existe? | router.ts | 121
