# 📚 Índice Completo - Sistema de Pruebas Conversacionales

## 🎯 Comienza Aquí

Dependiendo de lo que necesites, aquí están los documentos en orden de relevancia:

### ⚡ Tengo 5 Minutos

👉 **Lee**: [QUICK_START_TESTING.md](./QUICK_START_TESTING.md)

- 3 comandos para empezar
- Qué se prueba
- Cómo personalizar

### 📖 Tengo 30 Minutos

👉 **Lee**: [CONVERSATIONAL_TESTING.md](./CONVERSATIONAL_TESTING.md)

- Guía completa y detallada
- Descripción de cada prueba
- Troubleshooting
- Casos de uso avanzados

### 🎨 Prefiero Ver Diagramas

👉 **Lee**: [TESTING_VISUAL_GUIDE.md](./TESTING_VISUAL_GUIDE.md)

- Flujos visuales
- Explicaciones gráficas
- Ciclos de vida con ASCII art
- Orquestación de agentes

### 📊 Necesito Resumen Ejecutivo

👉 **Lee**: [TESTING_SUMMARY.md](./TESTING_SUMMARY.md)

- Qué se entrega
- Cómo usar
- Personalización
- Próximos pasos

---

## 📁 Archivos del Sistema

### Scripts Ejecutables

#### 1. **scripts/seed-test-data.ts** (330 líneas)

Carga datos realistas en la BD.

```bash
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts
```

**Inserta:**

- 10 productos musicales
- 5 clientes variados
- Configuración del bot
- 4 agentes especializados

**Tiempo:** ~2-3 segundos

---

#### 2. **scripts/conversational-tests.ts** (460 líneas)

Ejecuta 11 conversaciones realistas.

```bash
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts
```

**Pruebas:**

- 4 para Agente de Ventas
- 3 para Agente de Soporte
- 3 para Agente Técnico

**Tiempo:** ~5-10 minutos

---

#### 3. **scripts/analyze-test-results.ts** (440 líneas)

Analiza y genera reportes.

```bash
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/analyze-test-results.ts
```

**Genera:**

- Reporte en consola
- Archivo JSON
- Archivo HTML interactivo

**Tiempo:** ~5-10 segundos

---

### Documentación

#### 📄 **QUICK_START_TESTING.md** (200 líneas)

Guía de referencia rápida.

- 3 comandos principales
- 11 pruebas explicadas
- Troubleshooting
- Personalización básica

**Lectura:** 5-10 minutos

---

#### 📘 **CONVERSATIONAL_TESTING.md** (450 líneas)

Guía completa y detallada.

- Descripción de cada prueba
- Métricas evaluadas
- Configuración personalizada
- Casos de uso avanzados
- CI/CD integration
- Archivo por archivo

**Lectura:** 20-30 minutos

---

#### 🎨 **TESTING_VISUAL_GUIDE.md** (400 líneas)

Diagramas y explicaciones visuales.

- Flujo general con ASCII
- Flujo conversacional detallado
- Agentes especializados
- Flujo de datos en BD
- Ciclo de vida de prueba

**Lectura:** 15-20 minutos

---

#### 📊 **TESTING_SUMMARY.md** (300 líneas)

Resumen ejecutivo del proyecto.

- Objetivo conseguido
- Archivos creados
- Cómo usar (3 pasos)
- Qué se evalúa
- Personalización
- Próximos pasos

**Lectura:** 10-15 minutos

---

#### 🚀 **setup-testing.sh** (100 líneas)

Script automatizado de setup.

Ejecuta automáticamente:

1. Verifica requisitos
2. Carga datos
3. Ejecuta pruebas
4. Genera reportes

```bash
bash setup-testing.sh
```

---

### Archivos Generados (después de ejecutar)

#### `artifacts/test-reports/test-report-TIMESTAMP.json`

Datos completos de todas las pruebas.

```json
{
  "timestamp": "2024-03-24T10:30:00Z",
  "totalTests": 11,
  "passed": 10,
  "failed": 1,
  "tests": [
    {
      "id": "sales-01",
      "name": "Ventas: Saludo y Consulta Inicial",
      "status": "passed",
      "processingTime": 4300,
      "messages": [...],
      "assertions": [...]
    }
  ]
}
```

---

#### `artifacts/test-reports/test-report-TIMESTAMP.html`

Reporte interactivo visual.

- Resumen general con gráficas
- Performance por agente
- Tests más rápidos/lentos
- Detalles de fallos
- Recomendaciones

---

## 🎯 Flujo de Trabajo

### Primer Uso

```
1. Lee QUICK_START_TESTING.md (5 min)
   ↓
2. Ejecuta setup-testing.sh
   ↓
3. Revisa artifacts/test-reports/*.html
   ↓
4. Lee CONVERSATIONAL_TESTING.md para detalles (20 min)
```

### Desarrollo Continuo

```
Cambio en prompts o lógica
   ↓
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts
   ↓
pnpm --filter @workspace/api-server exec npx tsx ../../scripts/analyze-test-results.ts
   ↓
Revisar resultados → Ajustar → Repetir
```

### Antes de Deploy

```
git push a rama de feature
   ↓
CI/CD ejecuta setup-testing.sh
   ↓
Si todas las pruebas pasan → Merge allowed
Si alguna falla → Bloquear merge
```

---

## 📊 Información de Cada Prueba

### Agente de Ventas (4 pruebas)

| ID       | Nombre              | Descripción                       | Clientes      | Duración |
| -------- | ------------------- | --------------------------------- | ------------- | -------- |
| sales-01 | Saludo y Consulta   | Cliente nuevo descubre categorías | María García  | 2-3 min  |
| sales-02 | Producto Específico | Cliente pregunta por piano        | Juan López    | 2-3 min  |
| sales-03 | Objeción de Precio  | Cliente negocia descuento         | Carlos Martín | 2-3 min  |
| sales-04 | Métodos de Pago     | Cliente pregunta opciones         | Ana Rodríguez | 2-3 min  |

### Agente de Soporte (3 pruebas)

| ID         | Nombre           | Descripción                 | Clientes        | Duración |
| ---------- | ---------------- | --------------------------- | --------------- | -------- |
| support-01 | Problema Técnico | Cliente reporta fallo       | Pedro García    | 2-3 min  |
| support-02 | Devolución       | Cliente solicita devolución | Laura Fernández | 2-3 min  |
| support-03 | Entrega          | Cliente pregunta tracking   | Miguel Sánchez  | 2-3 min  |

### Agente Técnico (3 pruebas)

| ID           | Nombre           | Descripción             | Clientes       | Duración |
| ------------ | ---------------- | ----------------------- | -------------- | -------- |
| technical-01 | Especificaciones | Cliente pregunta specs  | Rafael Jiménez | 2-3 min  |
| technical-02 | Instalación      | Cliente pide guía setup | Teresa López   | 2-3 min  |
| technical-03 | Comparativa      | Cliente compara modelos | David Martínez | 2-3 min  |

---

## 🔍 Buscar por Tema

### Quiero entender el sistema

1. TESTING_VISUAL_GUIDE.md - Diagramas
2. CONVERSATIONAL_TESTING.md - Sección "Estructura de Pruebas"

### Quiero ejecutar las pruebas

1. QUICK_START_TESTING.md - 3 comandos
2. setup-testing.sh - Script automatizado

### Quiero personalizar

1. QUICK_START_TESTING.md - Sección "Configuración Personalizada"
2. CONVERSATIONAL_TESTING.md - Sección "Agregar Nuevas Conversaciones"

### Quiero integrar en CI/CD

1. CONVERSATIONAL_TESTING.md - Sección "Integración con CI/CD"
2. setup-testing.sh - Usar como base

### Tengo un error

1. QUICK_START_TESTING.md - "Troubleshooting"
2. CONVERSATIONAL_TESTING.md - "Troubleshooting" (más detallado)

### Quiero métricas detalladas

1. TESTING_VISUAL_GUIDE.md - Sección "Métricas y Evaluación"
2. CONVERSATIONAL_TESTING.md - Sección "Métricas que se Evalúan"

### Quiero casos de uso avanzados

1. CONVERSATIONAL_TESTING.md - Sección "Casos de Uso Avanzados"
2. TESTING_SUMMARY.md - Sección "Casos de Uso"

---

## 🆘 Help & Support

### Documentación Rápida

- **QUICK_START_TESTING.md** - Para comenzar rápido

### Documentación Completa

- **CONVERSATIONAL_TESTING.md** - Todo está aquí

### Diagramas Visuales

- **TESTING_VISUAL_GUIDE.md** - Para entender el sistema

### Resumen Ejecutivo

- **TESTING_SUMMARY.md** - Para directivos/stakeholders

### Troubleshooting Específico

**"DATABASE_URL must be set"**
→ Ver QUICK_START_TESTING.md > Troubleshooting

**"Cannot connect to API"**
→ Ver QUICK_START_TESTING.md > Troubleshooting

**"No products found"**
→ Ver QUICK_START_TESTING.md > Troubleshooting

**Quiero agregar más pruebas**
→ Ver CONVERSATIONAL_TESTING.md > Agregar Nuevas Conversaciones

---

## ⏱️ Estimaciones de Tiempo

| Tarea                  | Tiempo       | Documento                       |
| ---------------------- | ------------ | ------------------------------- |
| Lectura introductoria  | 5 min        | QUICK_START_TESTING.md          |
| Primer setup completo  | 15 min       | setup-testing.sh                |
| Ejecutar pruebas       | 5-10 min     | scripts/conversational-tests.ts |
| Analizar resultados    | 5-10 min     | scripts/analyze-test-results.ts |
| Lectura detallada      | 30 min       | CONVERSATIONAL_TESTING.md       |
| Personalización básica | 10 min       | Editar seed-test-data.ts        |
| Agregar nueva prueba   | 15 min       | Editar conversational-tests.ts  |
| **TOTAL TIEMPO TOTAL** | **~2 horas** | Para comprensión completa       |

---

## 📞 Información de Contacto

Para preguntas o problemas:

1. Revisa la documentación relevante arriba
2. Ejecuta `bash setup-testing.sh` para setup automático
3. Lee CONVERSATIONAL_TESTING.md sección Troubleshooting
4. Consulta TESTING_VISUAL_GUIDE.md para comprender la arquitectura

---

## ✨ Resumen

**Se ha implementado un sistema profesional completo de pruebas conversacionales:**

✅ 3 scripts ejecutables listo para usar  
✅ 11 casos de prueba realistas  
✅ 4 documentos de referencia  
✅ Datos de prueba auténticos  
✅ Reportes automáticos (JSON + HTML)  
✅ Análisis detallados por agente  
✅ Fácil de personalizar y extender  
✅ Listo para CI/CD

**¡Comienza por QUICK_START_TESTING.md en 5 minutos!** ⚡

---

**Última actualización:** Marzo 2024  
**Versión:** 1.0.0  
**Sistema:** Pruebas Conversacionales Multi-Agente
