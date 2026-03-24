# 🛡️ Estrategia Anti-Alucinación - Sistema de Agentes

## 🎯 Problema Identificado

El bot estaba **inventando datos**:

- ❌ URLs de fotos que no existen
- ❌ Precios diferentes a los reales
- ❌ Características no registradas
- ❌ Productos que no existen

## ✅ Solución Implementada

Sistema **ESTRICTO** de reglas anti-alucinación en 3 niveles:

### Nivel 1: Prompts Mejorados

**Archivo:** `artifacts/api-server/src/agents/anti-hallucination-prompts.ts`

Prompts específicos ESTRICTOS para cada agente:

#### Agente de Ventas

```
❌ PROHIBIDO:
  • Inventar datos, precios o características
  • Crear URLs de imágenes
  • Sugerir productos que no existen
  • Hacer descuentos no autorizados

✅ PERMITIDO SOLO:
  • Información exacta del contexto
  • Métodos de pago reales
  • Lo que el cliente pregunta explícitamente
```

#### Agente de Soporte

```
❌ PROHIBIDO:
  • Prometer reembolsos sin verificar
  • Inventar políticas de devolución
  • Dar tracking falso
  • Sugerir soluciones fantasma

✅ PERMITIDO SOLO:
  • Empatía genuina
  • Pasos reales de troubleshooting
  • Admitir cuando NO sabes
  • Ofrecer escalada a supervisor
```

#### Agente Técnico

```
❌ PROHIBIDO:
  • Inventar especificaciones
  • Afirmar compatibilidades no verificadas
  • Crear benchmarks imaginarios
  • Sugerir upgrades que no existen

✅ PERMITIDO SOLO:
  • Datos técnicos del contexto
  • Comparativas reales vs reales
  • Admitir cuando NO tienes info
  • Referir a documentación oficial
```

### Nivel 2: Router Global Reforzado

**Archivo:** `artifacts/api-server/src/core/router.ts`

Prompt global con **reglas explícitas anti-alucinación**:

```
REGLAS ANTI-ALUCINACIÓN:

1. INFORMACIÓN PERMITIDA (SOLO ESTO):
   ✓ Datos en el contexto de productos
   ✓ Datos en el contexto de conocimiento
   ✓ Lo que el usuario pregunta explícitamente
   ✗ TODO LO DEMÁS = ALUCINACIÓN

2. PROHIBICIONES ABSOLUTAS:
   ✗ NO inventes URLs de imágenes
   ✗ NO inventes precios
   ✗ NO inventes características
   ✗ NO sugieras productos que no existen

3. CASOS ESPECÍFICOS:
   - Pregunta por foto → "Disponible en nuestra web" (NO URLs inventadas)
   - Pregunta por algo que no tienes → "No lo tengo, pero esto sí:" (DATOS REALES)
   - Precio $99.99 en BD → "$99.99" (NO "alrededor de $100")
   - Stock 5 → "5 unidades" (NO "pocas unidades")
```

### Nivel 3: Validación en Agentes

**Archivo:** `artifacts/api-server/src/agents/salesAgent.ts`

Prompt del agente de ventas incluye:

```
⚠️  REGLA CRÍTICA - LEE CON ATENCIÓN:
────────────────────────────────────
NUNCA inventes información, precios, URLs de fotos o características
que no estén EXACTAMENTE en el contexto de productos.

- Si pregunta por algo que no existe: Confresa que no lo tienes
- Si pregunta por foto: NUNCA inventes URL como "https://..."
- Si pregunta por precio: Muestra EXACTAMENTE lo que dice en contexto
- Si pregunta por especificación no disponible: "No tengo esa información"
```

---

## 📋 Validación de Datos

Antes de responder CUALQUIER cosa, el bot debe preguntarse:

```
CHECKLIST DE VALIDACIÓN:

1. ¿Este dato está en el contexto de productos proporcionado?
   SÍ → OK, puedo usarlo
   NO → Ir a paso 2

2. ¿Este dato está en el contexto de conocimiento?
   SÍ → OK, puedo usarlo
   NO → Ir a paso 3

3. ¿El cliente pregunta explícitamente por esto?
   SÍ → Responde con lo que SÍ tienes
   NO → Ir a paso 4

4. ¿Estoy a punto de inventar esto?
   SÍ → DETENTE Y DI: "No tengo esa información"
   NO → OK, continúa
```

---

## 🚫 Casos Específicos Prohibidos

### ❌ NUNCA Inventar URLs

**Incorrecto:**

```
"Aquí está la foto: https://example.com/piano-digital.jpg"
```

**Correcto:**

```
"La imagen del producto está disponible en nuestra página web"
O si existe en BD:
"imageUrl: [URL exacta de BD]"
```

### ❌ NUNCA Inventar Precios

**Incorrecto:**

```
"El piano cuesta alrededor de $900"
"El precio es entre $800-1000"
```

**Correcto:**

```
"El piano cuesta $899.99"
[Precio EXACTO de BD]
```

### ❌ NUNCA Inventar Características

**Incorrecto:**

```
"El piano tiene 88 teclas de marfil"
"La garantía es de 3 años"
"Viene con 50 sonidos incorporados"
```

**Correcto:**

```
"Según nuestro catálogo: [SOLO LO QUE DICE LA DESCRIPCIÓN EN BD]"
"No tengo detalles sobre [característica]"
```

### ❌ NUNCA Sugerir Productos Ficticio

**Incorrecto:**

```
"También tenemos un modelo profesional de $2,000"
"Vendemos la versión de 61 teclas"
```

**Correcto:**

```
"Los pianos que tenemos disponibles son:"
[SOLO PRODUCTOS EN BD]
```

### ❌ NUNCA Inventar Políticas

**Incorrecto:**

```
"Te devolvemos el dinero en 30 días"
"Tenemos garantía de 2 años"
"Envío gratis en compras mayores a $500"
```

**Correcto:**

```
"Para información sobre devoluciones, contacta a soporte"
"Necesito escalar esto a nuestro equipo administrativo"
```

---

## ✅ Formas Correctas de Responder

### Cuando TIENES el dato:

```
Cliente: "¿Cuánto cuesta el piano?"
Bot: "El piano digital 88 teclas profesional cuesta $899.99"
[Precio EXACTO de BD]
```

### Cuando NO TIENES el dato:

```
Cliente: "¿Cuánto pesa el piano?"
Bot: "No tengo esa especificación disponible.
Lo que puedo confirmar es que es un piano digital de 88 teclas
a $899.99 con stock disponible."
```

### Cuando es ambiguo:

```
Cliente: "¿Tiene buena calidad?"
Bot: "Depende de tus necesidades. Aquí están nuestros pianos:
- Piano Digital 88 Teclas: $899.99
- [Otros productos REALES]
¿Cuál se ajusta más a lo que buscas?"
```

### Cuando es posible alucinación:

```
Cliente: "¿Tienen pianos de cola?"
Bot: "En nuestro catálogo disponible no tenemos pianos de cola.
Contamos con piano digital 88 teclas a $899.99 y [otros REALES].
¿Alguno de estos te interesa?"
```

---

## 🔍 Verificación

### Para Verificar que está Funcionando:

1. **Pregunta por Producto Que Existe:**

```
Cliente: "¿Cuánto cuesta el piano?"
Bot: DEBE mostrar precio EXACTO de BD ($899.99)
Bot: NUNCA debe mostrar "alrededor de $900"
```

2. **Pregunta por Producto que NO Existe:**

```
Cliente: "¿Venden pianos de cola?"
Bot: DEBE decir "No tenemos ese producto"
Bot: NUNCA debe inventar características
```

3. **Pregunta por Especificación No en BD:**

```
Cliente: "¿Qué peso tiene?"
Bot: DEBE admitir "No tengo esa información"
Bot: NUNCA debe asumir basado en la categoría
```

4. **Pregunta por Foto/Imagen:**

```
Cliente: "¿Me muestras la foto?"
Bot: DEBE referenciar la página web
Bot: NUNCA debe inventar URL como "https://..."
```

---

## 📊 Métricas de Éxito

El sistema está funcionando correctamente cuando:

✅ **100% de precios coinciden con BD**

- `SELECT price FROM products WHERE id = X`
- Bot dice: "Exacto de BD"

✅ **0% de URLs inventadas**

- Si no tiene imageUrl en BD → No inventa

✅ **0% de características no confirmadas**

- Si no está en descripción → No lo dice

✅ **100% de honestidad en limitaciones**

- "No tengo esa información" cuando es verdad

---

## 🔄 Cómo Usar Esta Estrategia

### Paso 1: Verificar Prompts

Los prompts estrictos ya están en:

- `artifacts/api-server/src/agents/anti-hallucination-prompts.ts`
- `artifacts/api-server/src/agents/salesAgent.ts` (actualizado)
- `artifacts/api-server/src/core/router.ts` (actualizado)

### Paso 2: Reiniciar Servidor

```bash
pnpm --filter @workspace/api-server run dev
```

### Paso 3: Probar

```bash
# Ejecutar pruebas
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts

# O probar manualmente
curl -X POST http://localhost:3000/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+34123456789",
    "message": "¿Cuánto cuesta el piano?",
    "clientName": "Test"
  }'
```

### Paso 4: Validar Respuesta

```json
{
  "response": "El piano digital 88 teclas profesional cuesta $899.99",
  "intent": "consulta_precio",
  "agent": "sales",
  "confidence": 0.95
}
```

✅ OK - Precio EXACTO de BD
❌ FALLO - Si dice "$900" o "alrededor de $900"

---

## 🛡️ Protecciones Adicionales

### Si aún así alucina:

1. **Agregar validación en generateResponse()**
   - Verificar que URLs existen en BD
   - Verificar que precios coinciden

2. **Usar modelo más conservador**
   - Cambiar a gpt-4-turbo-preview
   - Aumentar temperature a 0.1

3. **Agregar filtro post-generación**
   - Regex para detectar URLs inventadas
   - Validación de precios vs BD

---

## 📞 Soporte

Si el bot sigue alucinando:

1. Revisa el contexto de productos → ¿Tiene datos reales?
2. Revisa el prompt → ¿Tiene reglas anti-alucinación?
3. Prueba con modelo diferente → ¿Sigue alucinando?
4. Agregar filtro post-generación → Última defensa

**Prioridad:** El bot NUNCA debe inventar datos. Mejor decir "No sé" que mentir.

---

**Versión:** 1.0.0  
**Última actualización:** Marzo 2024  
**Estado:** Implementado y listo para usar
