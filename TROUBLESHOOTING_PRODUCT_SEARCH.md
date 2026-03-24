# GUÍA DE SOLUCIÓN DE PROBLEMAS - Búsqueda de Productos

## PROBLEMA: "Piano" no se encuentra pero debería

### Lista de Verificación Rápida

#### 1. ¿Existe el producto en la BD?
```bash
npm run check:products
# O manualmente:
psql "postgresql://user:pass@host/db"
SELECT COUNT(*), name FROM products WHERE name ILIKE '%piano%' GROUP BY name;
```

**Esperado**: 
```
count │ name
------+----
  1   │ Piano Profesional
  2   │ Piano Digital
```

**Si retorna 0**: El producto NO EXISTE → Ve a "Solución 1"

---

#### 2. ¿El producto está activo?
```sql
SELECT name, is_active, price FROM products 
WHERE name ILIKE '%piano%';
```

**Esperado**: `is_active = true`

**Si es false**: 
```sql
UPDATE products SET is_active = true 
WHERE name ILIKE '%piano%';
```

---

#### 3. ¿El nombre del producto es exacto?
La búsqueda es CASE-INSENSITIVE pero depende de cómo está guardado.

**BUENO**:
- "Piano Profesional"
- "Piano Digital Kawai"
- "PIANO DE COLA"

**MALO** (espacios extra):
- "Piano  Profesional" (2 espacios)
- " Piano Profesional " (espacios al inicio/final)

**Limpiar**: 
```sql
UPDATE products SET name = TRIM(name) 
WHERE name LIKE '%  %' OR name ~ '^ | $';
```

---

#### 4. Probar búsqueda de API directa
```bash
curl http://localhost:5000/api/products?search=piano
```

**Esperado**: Retorna array con productos

**Si es 200 pero array vacío**: Los productos existen pero SQL ILIKE falla

---

#### 5. Probar end-to-end de chat
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "message": "Quiero comprar un piano"
  }'
```

**Respuesta exitosa**:
```json
{
  "response": "¡Excelente! Tenemos disponibles...",
  "intent": "consulta_producto",
  "confidence": 0.95,
  "agent": "interes_producto"
}
```

---

## SOLUCIONES ESPECÍFICAS

### Solución 1: El producto NO existe

**Opción A: Crear manualmente en BD**
```sql
INSERT INTO products (name, price, category, is_active, stock) 
VALUES ('Piano Profesional', 5999.99, 'Instrumentos', true, 5);
```

**Opción B: Importar Excel/CSV**
1. Crear archivo `productos.csv`:
```
name,price,category,brand,stock,is_active
Piano Profesional,5999.99,Instrumentos,Yamaha,5,true
Piano Digital,2999.99,Instrumentos,Casio,10,true
```

2. Importar:
```bash
curl -X POST http://localhost:5000/api/products/import/excel \
  -F "file=@productos.csv"
```

**Opción C: Importar JSON directo**
```bash
curl -X POST http://localhost:5000/api/products/import/json \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "name": "Piano Profesional",
        "description": "Piano de cola Yamaha, 88 teclas",
        "price": 5999.99,
        "category": "Instrumentos Musicales",
        "brand": "Yamaha",
        "stock": 5
      },
      {
        "name": "Piano Digital Casio",
        "description": "Piano digital con 88 teclas ponderadas",
        "price": 2999.99,
        "category": "Instrumentos Musicales",
        "brand": "Casio",
        "stock": 10
      }
    ]
  }'
```

---

### Solución 2: Problemas con LLM Recognition

**Síntoma**: El producto existe pero LLM retorna "none"

**Causa**: El nombre del producto es muy diferente de lo que el usuario dice

**Ejemplo**:
- Producto: "Teclado Musical Profesional de 88 Teclas"
- Usuario: "piano"
- LLM: "none" (no ve la coincidencia)

**Fix**:
```sql
-- Renombrar a algo más intuitivo
UPDATE products 
SET name = 'Piano Digital' 
WHERE name ILIKE '%teclado%88%';

-- O agregar alias/variaciones
-- (requiere tabla separada de sinónimos)
```

---

### Solución 3: Problemas de Normalización

**Síntoma**: La búsqueda falla por caracteres especiales

**Ejemplos que fallan**:
- "Piano—Digital" (guión largo)
- "Piano/Digital" (barra)
- "Piano–Digital" (en-dash)

**Fix**: Normalizar nombres en la BD
```sql
-- Reemplazar caracteres especiales
UPDATE products 
SET name = REGEXP_REPLACE(
  name, 
  '[—–\-/]', 
  ' ',  -- reemplazar con espacio
  'g'
)
WHERE name ~ '[—–\-/]';
```

---

### Solución 4: Database Connection Issues

**Si ves error**: "Error fetching product context"

**Verificar conexión**:
```bash
# En .env, verifica:
echo $DATABASE_URL

# Prueba conexión directa:
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"
```

**Si falla**:
```bash
# Obtener conexión correcta
PGPASSWORD=TuPassword psql -h host -U user -d database -c "SELECT 1"

# Actualizar .env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

---

### Solución 5: Limpiar y Re-indexar

**Si las búsquedas son lentas o inconsistentes**:

```sql
-- Crear índice en nombre
CREATE INDEX IF NOT EXISTS idx_products_name 
ON products(LOWER(name));

-- O para búsquedas full-text
CREATE INDEX IF NOT EXISTS idx_products_name_gin 
ON products USING GIN(to_tsvector('spanish', name));

-- Limpiar duplicados
DELETE FROM products p1 
WHERE p1.id > (
  SELECT MIN(p2.id) 
  FROM products p2 
  WHERE p1.name = p2.name
);
```

---

## DIAGRAMA DE DEPURACIÓN

```
Usuario: "Quiero un piano"
  │
  ├─ PASO 1: classifyIntent()
  │  └─ ¿Retorna entity product="piano"?
  │     ├─ NO → Revisar sistema de clasificación
  │     └─ SÍ ✓ → Siguiente
  │
  ├─ PASO 2: getProductNames()
  │  └─ Query: SELECT name FROM products WHERE is_active=true
  │     ├─ Retorna []? → PROBLEMA 1 (no hay productos)
  │     └─ Retorna ["Piano Profesional", ...]? ✓ → Siguiente
  │
  ├─ PASO 3: searchRelevantProducts(message, productNames)
  │  │
  │  ├─ Pregunta LLM: "¿Qué productos busca el cliente?"
  │  │  ├─ LLM responde: "none" → Ir a PASO 4 (fallback)
  │  │  └─ LLM responde: "Piano Profesional" → PASO 3b
  │  │
  │  ├─ PASO 3b: normalize("Piano Profesional")
  │  │  └─ Resultado: "piano profesional"
  │  │     ├─ ¿Coincide en normMap? NO → ERROR (fallo en normalize)
  │  │     └─ ¿Coincide? SÍ ✓ → Retorna nombre original
  │  │
  │  └─ PASO 3c: Query BD
  │     ├─ WHERE name IN ("Piano Profesional") AND is_active=true
  │     └─ Retorna objeto producto ✓
  │
  ├─ PASO 4: getProductContext(entities) [si PASO 3 falla]
  │  └─ Búsqueda secundaria por SQL ILIKE
  │
  ├─ PASO 5: generateResponse()
  │  └─ Usa productContext en prompt
  │
  └─ ✓ RESPUESTA AL USUARIO
```

---

## COMANDOS DE DIAGNÓSTICO

### Ver todos los productos
```bash
psql $DATABASE_URL -c "SELECT id, name, category, price, is_active FROM products ORDER BY created_at DESC LIMIT 20;"
```

### Ver qué se buscó
```bash
psql $DATABASE_URL -c "SELECT * FROM conversations WHERE message ILIKE '%piano%' ORDER BY created_at DESC LIMIT 10;"
```

### Ver intenciones clasificadas
```bash
psql $DATABASE_URL -c "SELECT intent, COUNT(*) FROM conversations GROUP BY intent;"
```

### Ver productos que nunca se mencionan
```bash
psql $DATABASE_URL -c "
SELECT p.name, p.price 
FROM products p 
LEFT JOIN conversations c ON c.message ILIKE '%' || p.name || '%'
WHERE c.id IS NULL AND p.is_active = true;"
```

---

## CASOS DE PRUEBA

### Test 1: Producto Simple
```bash
# Crear producto
curl -X POST http://localhost:5000/api/products/import/json \
  -H "Content-Type: application/json" \
  -d '{"products": [{"name": "Piano Test", "price": 100, "category": "Test", "stock": 1}]}'

# Buscar
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"phone": "test1", "message": "Hola, quiero un piano"}'

# Esperado: Response contiene "Piano Test" y precio
```

### Test 2: Producto Inactivo
```bash
# Desactivar
psql $DATABASE_URL -c "UPDATE products SET is_active=false WHERE name='Piano Test';"

# Buscar (debería no aparecer)
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"phone": "test2", "message": "Hola, quiero un piano"}'

# Esperado: Response no menciona "Piano Test"
```

### Test 3: Múltiples Productos
```bash
# Crear varios
curl -X POST http://localhost:5000/api/products/import/json \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"name": "Piano Profesional", "price": 5000, "category": "Pianos", "stock": 5},
      {"name": "Piano Digital", "price": 2000, "category": "Pianos", "stock": 10}
    ]
  }'

# Buscar
curl 
