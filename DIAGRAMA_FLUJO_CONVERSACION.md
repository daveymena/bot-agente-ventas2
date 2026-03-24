# DIAGRAMA DETALLADO: FLUJO DE CONVERSACIÓN

## Entrada de Usuario
```
Usuario (WhatsApp): "Hola, busco un piano bajo presupuesto"
                           |
                           v
              POST /chat/message
              {
                phone: "+34666777888",
                message: "Hola, busco un piano bajo presupuesto",
                clientName: "Juan"
              }
```

## Procesamiento en handleMessage()

```
PASO 1: INICIALIZACIÓN (Promise.all)
════════════════════════════════════════════════════════════════
  ├─► getOrCreateClient(phone, clientName)
  │   └─ SELECT FROM clients WHERE phone = "+34666777888"
  │   └─ Si no existe: INSERT con leadStatus='cold'
  │   └─ Retorna: { id: 123, phone, name, leadStatus, ... }
  │
  └─► getBotConfig()
      └─ SELECT FROM bot_config LIMIT 1
      └─ Si no existe: INSERT defaults
      └─ Retorna config global


PASO 2: RECUPERAR CONTEXTO
════════════════════════════════════════════════════════════════
  ├─► getHistory(client.id = 123, limit = 10)
  │   └─ SELECT * FROM conversations 
  │       WHERE client_id = 123
  │       ORDER BY created_at DESC
  │       LIMIT 10
  │   └─ Retorna: [ {role: "user", content: "..."}, ... ]
  │
  ├─► classifyIntent(message)
  │   │ Envía a GPT-4o-mini:
  │   │   "Clasifica: 'Hola, busco un piano bajo presupuesto'"
  │   │   Responde SOLO JSON: {"intent":"...", "confidence":0.9, 
  │   │                        "entities":{"product":"..."}}"
  │   │
  │   └─ Retorna: {
  │       intent: "consulta_producto",
  │       confidence: 0.92,
  │       entities: { product: "piano", priceRange: "bajo" }
  │     }
  │
  └─► SELECT FROM products (para búsqueda semántica)
      └─ Obtiene TODOS los productos activos
      └─ ["Piano Mega Pack", "Piano Básico", ..., N]


PASO 3: BÚSQUEDA INTELIGENTE DE PRODUCTOS
════════════════════════════════════════════════════════════════
  
  A) BÚSQUEDA SEMÁNTICA (searchRelevantProducts):
     ├─ Envía a GPT-4o:
     │   "De estos productos: [Piano Mega Pack $999, Piano Básico $299, ...],
     │    ¿cuáles son más relevantes para: 'busco un piano bajo presupuesto'?
     │    Retorna solo nombres de productos"
     │
     ├─ Normaliza respuesta (elimina acentos, emojis, puntos)
     │
     └─ Retorna: ["Piano Básico", "Piano Entry Level"]
        
        SI TIENE RESULTADOS:
        ├─ SELECT FROM products 
        │  WHERE name IN ("Piano Básico", "Piano Entry Level")
        │  AND is_active = true
        │  LIMIT 5
        │
        └─ Retorna context con detalles:
           "PRODUCTOS RELEVADOS PARA ESTA CONSULTA:
            • Piano Básico | Precio: $299 USD | Detalles: Teclado 88 teclas
            • Piano Entry Level | Precio: $399 USD | Detalles: Con pedal"
  
  B) FALLBACK SQL (si búsqueda semántica falla):
     ├─ entities.product = "piano"
     ├─ entities.priceRange = "bajo"
     │
     ├─ SELECT FROM products 
     │  WHERE (name ILIKE "%piano%"
     │        AND price < 500)
     │  AND is_active = true
     │  LIMIT 5
     │
     └─ Retorna context con productos baratos


PASO 4: BASE DE CONOCIMIENTO
════════════════════════════════════════════════════════════════
  ├─ Keywords extraídas: ["busco", "piano", "presupuesto"]
  │  (Solo palabras con length > 3)
  │
  ├─ SELECT FROM conversation_knowledge
  │  WHERE userQuery ILIKE "%busco%"
  │     OR botResponse ILIKE "%piano%"
  │  LIMIT 3
  │
  └─ Retorna FAQs previas (si existen):
     "Pregunta Frecuente: Busco un piano económico
      Respuesta Sugerida: Tenemos modelos desde $299..."


PASO 5: ORQUESTACIÓN DE AGENTES
════════════════════════════════════════════════════════════════
  ├─ Envía a GPT-4o:
  │   "Usuario pregunta: 'busco un piano bajo presupuesto'
  │    Contexto: NEGOCIO: Tienda de Pianos
  │    INTENCIÓN DETECTADA: consulta_producto
  │    Agentes disponibles: sales, support, technical, admin
  │    ¿Qué agente maneja mejor esto? Retorna SOLO nombre agente"
  │
  └─ Retorna: "sales"
     
     ├─ SELECT FROM agents 
     │  WHERE key = "sales"
     │  LIMIT 1
     │
     └─ Retorna system_prompt del agente:
        "Eres Sales Agent de Tienda de Pianos...
         Tu rol: Asistente de ventas...
         INSTRUCCIONES: Responde en español, máximo 3 párrafos..."


PASO 6: CONSTRUCCIÓN DEL PROMPT FINAL
════════════════════════════════════════════════════════════════
  
  fullPrompt = systemPrompt + context
  
  Contenido completo:
  ┌────────────────────────────────────────────────────────────┐
  │ "Eres Sales Agent, agente de ventas de Tienda de Pianos   │
  │  Personalidad: Soy amable, profesional, entusiasta...     │
  │                                                             │
  │  NEGOCIO: Tienda de Pianos | TIPO: Retail Musical         │
  │  HORARIO: Lunes-Viernes 9am-6pm, Sábados 10am-2pm         │
  │  CLIENTE: Juan                                             │
  │  CONTEXTO DE LA CONSULTA:                                  │
  │                                                             │
  │  PRODUCTOS RELEVADOS PARA ESTA CONSULTA:                  │
  │  • Piano Básico | Precio: $299 USD | Detalles: Teclado 88 teclas │
  │  • Piano Entry Level | Precio: $399 USD | Detalles: Con pedal    │
  │                                                             │
  │  INFORMACIÓN ADICIONAL DE BASE DE CONOCIMIENTO:            │
  │  Pregunta Frecuente: Busco un piano económico              │
  │  Respuesta Sugerida: Tenemos modelos desde $299...         │
  │                                                             │
  │  INSTRUCCIÓN: Sé lo más ESPECÍFICO posible.                │
  │  NUNCA inventes información. SIEMPRE presenta detalles      │
  │  exactos del contexto. Si no tienes info, confiésalo.     │
  │  Responde en máximo 3 párrafos."                           │
  └────────────────────────────────────────────────────────────┘


PASO 7: GENERACIÓN DE RESPUESTA
════════════════════════════════════════════════════════════════
  ├─ generateResponse(fullPrompt, combinedContext, message, history)
  │
  ├─ Envía a GPT-4o:
  │   model: "gpt-4o"
  │   messages: [
  │     { role: "system", content: fullPrompt },
  │     ...history...,
  │     { role: "user", content: "Hola, busco un piano..." }
  │   ]
  │
  └─ Retorna: "¡Hola Juan! 🎹 Excelente pregunta. Tenemos dos 
               opciones perfectas para tu presupuesto:
               
               1. Piano Básico - $299
                  Teclado de 88 teclas semipesadas, ideal para 
                  principiantes. Muy buena relación precio-calidad.
               
               2. Piano Entry Level - $399
                  Incluye pedal expresivo, sonido más profesional.
               
               ¿Te gustaría conocer más detalles de alguno?"


PASO 8: GUARDAR EN HISTORICO
════════════════════════════════════════════════════════════════
  INSERT INTO conversations (client_id, role, message, intent, agent, confidence)
  VALUES
    (123, 'user', 'Hola, busco un piano bajo presupuesto', 'consulta_producto', 'sales', 0.92),
    (123, 'bot', '¡Hola Juan! 🎹 Excelente pregunta...', 'consulta_producto', 'sales', 0.92);


PASO 9: ACTUALIZAR CLIENTE (LEAD SCORING)
════════════════════════════════════════════════════════════════
  
  Lógica de puntuación:
  ├─ Si intent IN ('compra', 'pedido'):
  │   └─ purchaseProbability += 20
  │
  └─ En este caso: intent = 'consulta_producto'
     └─ purchaseProbability no cambia (sigue en 0)
  
  Determinación de lead status:
  ├─ Si purchaseProbability >= 70:
  │   └─ leadStatus = 'hot'
  │
  ├─ Si purchaseProbability >= 40:
  │   └─ leadStatus = 'warm'
  │
  └─ Si purchaseProbability < 40:
      └─ leadStatus = 'cold'
  
  UPDATE clients
  SET totalInteractions = totalInteractions + 1,
      purchaseProbability = 0,
      leadStatus = 'cold',
      lastInteraction = NOW(),
      name = 'Juan'
  WHERE id = 123;


PASO 10: RESPUESTA AL CLIENTE
════════════════════════════════════════════════════════════════
  
  Response JSON:
  {
    "response": "¡Hola Juan! 🎹 Excelente pregunta. Tenemos dos 
                opciones pe
