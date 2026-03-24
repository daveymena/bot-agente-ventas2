# ANÁLISIS COMPLETO: Sistema de Búsqueda de Productos - Bot de Ventas

## TABLA DE CONTENIDOS
1. Arquitectura General
2. Flujo de Búsqueda de Productos
3. Componentes Clave
4. Problemas Identificados y Soluciones
5. Casos de Prueba: "Piano"
6. Diagrama de Flujo Completo

---

## 1. ARQUITECTURA GENERAL DEL SISTEMA

### Estructura de Directorios Clave
```
Intelligent-Agent-System/
├── artifacts/api-server/src/
│   ├── routes/              # Endpoints HTTP
│   │   ├── chat.ts          # Recibe mensajes
│   │   ├── products.ts      # CRUD productos
│   │   ├── importProducts.ts # Importación de datos
│   │   └── index.ts         # Orquestador de rutas
│   ├── core/
│   │   └── router.ts        # LÓGICA PRINCIPAL: handleMessage()
│   ├── services/
│   │   ├── aiService.ts     # Clasificación de intenciones & búsqueda semántica
│   │   └── whatsappService.ts
│   └── agents/
│       ├── salesAgent.ts    # Agente de ventas
│       ├── technicalAgent.ts
│       ├── supportAgent.ts
│       └── adminAgent.ts
├── lib/db/src/
│   └── schema/
│       └── products.ts      # ESQUEMA de base de datos
└── (raíz)/
    ├── check_products.ts    # Script diagnóstico
    └── tmp_search_piano.ts  # Script de prueba (BÚSQUEDA DE PIANO)
```

### Stack Tecnológico
- **Base de Datos**: PostgreSQL 
- **ORM**: Drizzle ORM
- **IA/LLM**: OpenAI (gpt-4o, gpt-4o-mini)
- **API REST**: Express.js
- **Lenguaje**: TypeScript

---

## 2. FLUJO DE BÚSQUEDA DE PRODUCTOS - PASO A PASO

### ENTRADA: El usuario envía un mensaje
```
Usuario: "Tengo interés en un piano"
         ↓
POST /api/chat/message
├── phone: "1234567890"
├── message: "Tengo interés en un piano"
└── clientName: "Juan" (opcional)
```

### PASO 1: router.ts - handleMessage() [LÍNEAS 108-196]
**Archivo**: `artifacts/api-server/src/core/router.ts`

```typescript
export async function handleMessage(phone: string, message: string, clientName?: string)
```

**Lo que hace**:
- Obtiene o crea el cliente en la BD
- Obtiene el historial de conversaciones previas
- Llama a `classifyIntent()` para identificar la intención
- **BUSCA PRODUCTOS** (líneas 120-137)
- Orquesta qué agente debe responder
- Genera la respuesta final
- Guarda todo en la BD

### PASO 2: classifyIntent() [LÍNEAS 64-89 en aiService.ts]
**Archivo**: `artifacts/api-server/src/services/aiService.ts`

```typescript
export async function classifyIntent(message: string): Promise<IntentResult>
```

**Entrada**: "Tengo interés en un piano"

**Llama a OpenAI gpt-4o-mini**:
```json
SYSTEM: "Clasifica la intención del mensaje.
         Intenciones: [saludo, despedida, consulta_precio, consulta_producto, ...]
         Responde SOLO JSON"

USER: "Mensaje: 'Tengo interés en un piano'"
```

**Salida esperada**:
```json
{
  "intent": "consulta_producto",
  "confidence": 0.95,
  "entities": {
    "product": "piano",
    "category": null,
    "brand": null
  }
}
```

### PASO 3: searchRelevantProducts() [LÍNEAS 90-173 en aiService.ts]
**ESTA ES LA FUNCIÓN CRÍTICA PARA ENCONTRAR "PIANO"**

**Entrada**:
- `message`: "Tengo interés en un piano"
- `productNames`: ["Producto A", "Piano Profesional", "Piano Digital", ...]

**Lógica**:
```
1. Llama a OpenAI gpt-4o-mini con:
   SYSTEM: "Identifica EXACTAMENTE qué productos de la lista está buscando el cliente.
            REGLAS:
            - Si pregunta por un producto específico (ej: 'curso de piano'), 
              UNICAMENTE elige ese producto.
            - No elijas 'mega packs' si busca artículo individual.
            - Si es vago, máximo 2 relacionados.
            - Si no hay coincidencia, devuelve 'none'.
            PRODUCTOS: Piano Profesional, Piano Digital, ..."
   
   USER: "Mensaje: 'Tengo interés en un piano'"

2. LLM responde: "Piano Profesional, Piano Digital"

3. NORMALIZACIÓN (líneas 117-125):
   - Elimina diacríticos (á→a, é→e)
   - Elimina puntuación
   - Convierte a minúsculas
   - Colapsa espacios múltiples
   Ejemplo: "Piano Profesional" → "piano profesional"

4. MATCHING (líneas 141-157):
   - Intenta coincidencia exacta con nombres normalizados
   - Si falla, intenta substring matching
   
5. FALLBACK (líneas 160-165):
   - Si aún no hay resultados, busca en el texto completo

6. RETORNA: ["Piano Profesional", "Piano Digital"]
```

**Pseudocódigo**:
```typescript
const normalize = (s) => s.normalize("NFD")
                          .replace(/\p{Diacritic}/gu, "")
                          .replace(/[^a-z0-9\s]/gi, "")
                          .replace(/\s+/g, " ")
                          .toLowerCase()

// normMap = {"piano profesional": "Piano Profesional", ...}
// Busca coincidencias en LLM output
// Retorna nombres originales
```

### PASO 4: Recuperar datos del producto de la BD [LÍNEAS 127-137 en router.ts]
**Archivo**: `artifacts/api-server/src/core/router.ts`

```typescript
if (relevantProductNames.length > 0) {
  const products = await db.select().from(productsTable).where(
    and(sql`${productsTable.name} IN (${sql.join(...)})`, 
        eq(productsTable.isActive, true))
  ).limit(5)
}
```

**Esto busca en la BD**:
```sql
SELECT * FROM products 
WHERE name IN ('Piano Profesional', 'Piano Digital')
  AND is_active = true
LIMIT 5
```

**Retorna**: Objeto de producto completo
```json
{
  "id": 1,
  "name": "Piano Profesional",
  "description": "Piano de cola de 88 teclas",
  "price": 5999.99,
  "category": "Instrumentos Musicales",
  "brand": "Yamaha",
  "stock": 5,
  "imageUrl": "...",
  "isActive": true,
  "createdAt": "2024-03-24T10:00:00Z"
}
```

### PASO 5: Contexto de Producto [LÍNEAS 132-137 en router.ts]

**Si encontró productos relevantes**:
```typescript
productContext = `PRODUCTOS RELEVADOS PARA ESTA CONSULTA:
• Piano Profesional | Precio: $5999.99 USD | Detalles: Piano de cola de 88 teclas`
```

**Si NO encontró (fallback)** [LÍNEA 136]:
```typescript
productContext = await getProductContext(intentData.entities)
```

Esto llama a `getProductContext()` que busca por:
- `category` (si existe)
- `brand` (si existe) 
- `product` keywords (si existe, divide por palabras clave > 2 caracteres)

### PASO 6: Orquestación [LÍNEAS 141-145 en router.ts]

```typescript
const agentKey = await orchestrate(message, history, businessSummary)
```

Determina qué agente debe responder. Para "piano" probablemente:
- `agentKey = "interes_producto"`

### PASO 7: Genera Respuesta Final [LÍNEAS 154-168 en router.ts]

```typescript
response = await generateResponse(fullPrompt, combinedContext, message, history)
```

**El prompt incluye**:
- Sistema del agente elegido
- Contexto del negocio
- **Contexto del producto** (Piano Profesional $5999.99, etc.)
- Historial de conversación (últimas 12 mensajes)
- Mensaje del usuario

**OpenAI gpt-4o genera**:
```
"¡Excelente elección! Tenemos disponibles dos opciones de pianos.
El Piano Profesional de Yamaha es nuestra joya de 88 teclas con sonido...
Precio: $5,999.99 (5 unidades en stock)
¿Te gustaría conocer más detalles técnicos o coordinar una demostración?"
```

### PASO 8: Guarda en BD [LÍNEAS 174-177]
```typescript
await db.insert(conversationsTable).values([
  { clientId, role: "user", message, intent, agent, confidence },
  { clientId, role: "bot", message: response, intent, agent, confidence }
])
```

### PASO 9: Actualiza Estado del Cliente [LÍNEAS 179-193]
```typescript
// Actualiza probability, leadStatus, lastInteraction, etc.
await db.update(clientsTable).set({...}).where(eq(...))
```

---

## 3. COMPONENTES CLAVE

### 3.1 Tabla de Base de Datos: `products`
**Archivo**: `lib/db/src/schema/products.ts`

```typescript
export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                    // ← CRÍTICO para búsqueda
  description: text("description"),
  price: real("price").notNull(),
  category: varchar("category", { length: 100 }).notNull(),  // ← Para filtros
  brand: text("brand"),                            // ← Para búsqueda por marca
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),  // ← FILTRO CRÍTICO
  createdAt: timestamp("created_at")
