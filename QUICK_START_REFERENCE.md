# REFERENCIA RÁPIDA - Sistema de Búsqueda de Productos

## Archivos Críticos (¿Qué hay en cada uno?)

| Archivo | Ubicación | Propósito | Líneas Clave |
|---------|-----------|----------|-------------|
| **router.ts** | `core/router.ts` | Orquestador principal | 108-196 |
| **aiService.ts** | `services/aiService.ts` | Clasificación + Búsqueda semántica | 64-173 |
| **salesAgent.ts** | `agents/salesAgent.ts` | Respuestas de ventas | 30-42 |
| **products.ts (routes)** | `routes/products.ts` | CRUD de productos | 23-40 |
| **products.ts (schema)** | `lib/db/schema/products.ts` | Estructura BD | - |
| **importProducts.ts** | `routes/importProducts.ts` | Importar datos | 10-85 |

## Flujo en 5 segundos

```
1. Usuario envía: "Quiero piano"
   ↓
2. classifyIntent() → detecto intención + entities
   ↓
3. searchRelevantProducts() → pregunto a LLM qué productos busca
   ↓
4. Query BD → recupero objetos de producto
   ↓
5. generateResponse() → genero respuesta con contexto
   ↓
6. Save + Return → guardo en BD y retorno respuesta
```

## Preguntas Rápidas & Respuestas

### P: ¿Por qué a veces encuentra "piano" y a veces no?

**R**: Posibles causas (en orden de probabilidad):

1. **Producto no existe en BD** → `SELECT * FROM products WHERE name ILIKE '%piano%'`
2. **isActive = false** → `UPDATE products SET is_active=true WHERE name ILIKE '%piano%'`
3. **LLM no reconoce el nombre** → Producto mal nombrado (ej: "Teclado" en vez de "Piano")
4. **Normalización falla** → Caracteres especiales en nombre del producto
5. **BD desconectada** → Check `.env` DATABASE_URL

---

### P: ¿Dónde se buscan los productos?

**R**: 3 lugares diferentes (en orden):

1. **searchRelevantProducts()** (línea 124 router.ts)
   - Usa LLM para búsqueda semántica
   - Retorna productos MÁS RELEVANTES
   
2. **getProductContext()** (línea 136 router.ts)
   - Fallback si #1 no encuentra
   - Busca por SQL ILIKE en category/brand/name

3. **En prompt al LLM**
   - Si #1 y #2 fallan, LLM tiene lista de ALL productos

---

### P: ¿Cómo se valida si un producto existe?

**R**: 2 lugares:

```typescript
// 1. En router.ts línea 121
const allActiveProducts = await db.select({ name: productsTable.name })
  .from(productsTable)
  .where(eq(productsTable.isActive, true))

// 2. En router.ts línea 128-130
const products = await db.select().from(productsTable).where(
  and(sql`${productsTable.name} IN (${sql.join(...)})`, 
      eq(productsTable.isActive, true))
)
```

---

### P: ¿Dónde están los productos almacenados?

**R**: PostgreSQL tabla `products`:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,           ← CRÍTICO para búsqueda
  description TEXT,
  price REAL NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand TEXT,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true, ← FILTRO CRÍTICO
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### P: ¿Cómo se genera la respuesta cuando no encuentra producto?

**R**: Fallback en orden:

1. Si `searchRelevantProducts()` retorna resultados → usa esos
2. Si no → `getProductContext(entities)` intenta buscar por SQL
3. Si aún no → genera respuesta genérica con "catálogo disponible"
4. Si falla todo → retorna `botConfig.fallbackMessage`

---

## Checklist de Diagnóstico

Cuando la búsqueda NO funciona, ejecuta en orden:

```bash
# 1. Ver si hay productos
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products WHERE name ILIKE '%piano%';"

# 2. Ver si están activos
psql $DATABASE_URL -c "SELECT name, is_active FROM products WHERE name ILIKE '%piano%';"

# 3. Probar API directa
curl http://localhost:5000/api/products?search=piano

# 4. Probar chat end-to-end
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"phone": "test", "message": "Quiero un piano"}'

# 5. Ver logs
tail -f output.log | grep -i "error\|piano\|product"
```

---

## Cómo Importar Productos (3 formas)

### Forma 1: JSON directo
```bash
curl -X POST http://localhost:5000/api/products/import/json \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"name": "Piano", "price": 5999, "category": "Instrumentos", "stock": 5}
    ]
  }'
```

### Forma 2: CSV/Excel
```bash
# Crear archivo productos.csv
name,price,category,brand,stock
Piano Profesional,5999.99,Instrumentos,Yamaha,5
Piano Digital,2999.99,Instrumentos,Casio,10

# Importar
curl -X POST http://localhost:5000/api/products/import/excel \
  -F "file=@productos.csv"
```

### Forma 3: WooCommerce
```bash
curl -X POST http://localhost:5000/api/products/import/woocommerce \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://tu-tienda.com",
    "consumerKey": "ck_...",
    "consumerSecret": "cs_..."
  }'
```

---

## Funciones Clave (¿Qué hace cada una?)

### classifyIntent(message)
- **Input**: "Quiero un piano"
- **Output**: `{intent: "consulta_producto", entities: {product: "piano"}, confidence: 0.95}`
- **LLM**: gpt-4o-mini
- **Archivo**: aiService.ts línea 64

### searchRelevantProducts(message, productNames)
- **Input**: "Quiero un piano", ["Piano Profesional", "Piano Digital", ...]
- **Output**: ["Piano Profesional", "Piano Digital"]
- **LLM**: gpt-4o-mini
- **Especial**: Normaliza nombres, valida coincidencias
- **Archivo**: aiService.ts línea 90

### getProductContext(entities)
- **Input**: `{product: "piano", category: null, brand: null}`
- **Output**: String con formato "CATÁLOGO: • Piano..., • Piano..."
- **SQL**: Búsqueda ILIKE
- **Archivo**: router.ts línea 37

### orchestrate(message, history, businessSummary)
- **Input**: "Quiero un piano", historial, "NEGOCIO: ..."
- **Output**: "interes_producto" (agente a usar)
- **LLM**: gpt-4o-mini
- **Archivo**: aiService.ts línea 175

### generateResponse(systemPrompt, context, message, history)
- **Input**: Prompt del agente + contexto + mensaje + historial
- **Output**: Texto de respuesta
- **LLM**: gpt-4o (modelo completo)
- **Archivo**: aiService.ts línea 231

---

## Modelos de IA Usados

| Función | Modelo | Tokens |
|---------|--------|--------|
| classifyIntent | gpt-4o-mini | 150 max |
| searchRelevantProducts | gpt-4o-mini | auto |
| orchestrate | gpt-4o-mini | 20 max |
| generateResponse | gpt-4o | 600 max |

---

## Variables Clave en BD

```sql
-- Verificar si cliente tiene compras potenciales
SELECT name, purchase_probability, lead_status FROM clients 
WHERE phone='1234567890';

-- Ver intenciones más comunes
SELECT intent, COUNT(*) as count FROM conversations 
GROUP BY intent ORDER BY count DESC;

-- Productos más mencionados
SELECT message FROM conversations 
WHERE message ILIKE '%piano%' 
ORDER BY created_at DESC LIMIT 10;
```

---

## Configuración en .env (Crítica para búsqueda)

```
# Base de datos
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OpenAI
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Puerto
PORT=5000
```

---

## Problemas Comunes y Soluciones Rápidas

| Síntoma | Causa | Solución |
|---------|-------|----------|
| "piano" NO aparece | Producto no existe | `INSERT INTO products` o importar |
| "piano" NO aparece pero existe | isActive=false | `UPDATE SET is_active=true` |
| LLM retorna "none" | Nombre muy diferente | Renombrar producto |
| Búsqueda lenta | Índices faltantes | Crear índice en column name |
| "Error fetching product" | BD desconectada | Check DATABASE_URL |
| Respuesta genérica | Productos vacíos | Agregar más productos |

---

## Cómo Debuggear

**Agregar logs en router.ts**:
```typescript
logger.debug({productNames}, "Available products")
logger.debug({relevantProductNames}, "Found relevant products")
logger.debug({products}, "Product objects from DB")
logger.debug({productContext}, "Final product context")
```

**Ver logs en vivo**:
```bash
tail -f output.log | grep -i "debug\|product\|error"
```

---

## Contacto Rápido

- **Tabla de productos**: `lib/db/src/schema/products.ts`
- **Búsqueda principal**: `artifacts/api-server/src/core/router.ts`
- **IA**: `artifacts/api-server/src/services/aiService.ts`
- **Importar datos**: POST `/api/products/import/json`
- **Probar chat**: POS
