# ARQUITECTURA: SISTEMA DE BOTS CONVERSACIONALES

## 1. ESTRUCTURA
```
artifacts/api-server/     Backend (Express, Node 24)
  ├── src/agents/         4 agentes: Sales, Support, Technical, Admin
  ├── src/core/router.ts  Orquestador principal
  ├── src/services/       aiService.ts (OpenAI)
  └── src/routes/         16 endpoints REST

lib/db/                   Capa de datos (Drizzle ORM)
  └── schema/             8 tablas PostgreSQL

artifacts/bot-dashboard/  Frontend React 19
```

## 2. AGENTES (4 Tipos)
| Agente | Intenciones | Propósito |
|--------|-------------|----------|
| Sales | saludo, compra, consulta_precio | Conversión de ventas |
| Support | soporte, reclamo | Resolución de problemas |
| Technical | especificacion_tecnica, comparacion | Info técnica |
| Admin | facturacion, ubicacion, horario | Gestión administrativa |

## 3. FLUJO DE CONVERSACIÓN (10 pasos)
1. getOrCreateClient(phone)
2. getBotConfig()
3. getHistory(clientId)
4. classifyIntent(msg) → GPT-4o-mini
5. searchRelevantProducts() → Búsqueda semántica
6. getProductContext() → SQL fallback
7. getKnowledgeContext() → FAQs
8. orchestrate() → elige agente
9. generateResponse() → respuesta final
10. INSERT + UPDATE cliente (lead scoring)

## 4. BASE DE DATOS (PostgreSQL, 8 tablas)
| Tabla | Propósito | Campos clave |
|-------|-----------|-------------|
| agents | Definición de agentes | key, name, system_prompt |
| products | Catálogo | name, price, category, stock |
| conversations | Histórico | client_id, role, message, intent, agent |
| clients | CRM | phone, lead_status, purchase_probability |
| bot_config | Config global | botName, personality, paymentMethods |
| ai_providers | Multi-provider IA | provider, apiKey, model |
| conversation_knowledge | Base de conocimiento | userQuery, botResponse |
| tenants/auth_users | Multi-tenancy SaaS | - |

## 5. BÚSQUEDA DE PRODUCTOS (Dual Strategy)
```
Semántica (GPT-4o): Evalúa relevancia
     ↓
SQL Fallback: ILIKE en name, category, brand
     ↓
Top 6 productos activos
```

## 6. LEAD SCORING
- purchase_probability += 20 si compra/pedido
- leadStatus: cold (0-40) → warm (40-70) → hot (70+)
- Actualizado automáticamente cada interacción

## 7. ENDPOINTS PRINCIPALES
```
POST /chat/message              # Principal
GET  /products, /clients, /agents/status
POST /import-products           # Excel/CSV/JSON
GET  /conversations             # Historial
```

## 8. STACK TECNOLÓGICO
- Backend: Node.js 24, Express 5, TypeScript 5.9
- BD: PostgreSQL + Drizzle ORM
- IA: OpenAI (GPT-4o), GitHub Models
- Frontend: React 19
- WhatsApp: Baileys 7.0.0-rc.9

## 9. OBSERVABILIDAD
- Logging: Pino
- Metrics: GET /agents/status, /metrics
- Tracing: intent, agent, confidence guardados

## 10. FORTALEZAS
✅ 4 agentes especializados
✅ Orquestación automática
✅ Búsqueda inteligente dual
✅ Lead scoring automático
✅ Multi-provider IA
✅ Type-safe (TypeScript + Zod)
