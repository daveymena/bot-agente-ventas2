#!/bin/bash

# 🧪 Setup Rápido del Sistema de Pruebas Conversacionales
# 
# Este script automatiza el setup en 3 pasos:
# 1. Verifica requisitos
# 2. Carga datos de prueba
# 3. Ejecuta pruebas
# 4. Genera reportes
#
# Uso: bash setup-testing.sh

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🧪 SISTEMA DE PRUEBAS CONVERSACIONALES - SETUP AUTOMÁTICO"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. VERIFICAR REQUISITOS
echo -e "${BLUE}📋 PASO 1: Verificando Requisitos${NC}"
echo "─────────────────────────────────────────────────────────────"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js${NC} $(node --version)"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ pnpm${NC} $(pnpm --version)"

# Verificar postgres
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL CLI no encontrado (opcional)${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL${NC}"
fi

# Verificar .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    echo "Copia .env.example a .env y configura DATABASE_URL"
    exit 1
fi
echo -e "${GREEN}✅ Archivo .env${NC} encontrado"

# Verificar DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    echo -e "${RED}❌ DATABASE_URL no está en .env${NC}"
    exit 1
fi
echo -e "${GREEN}✅ DATABASE_URL${NC} configurado"

echo ""

# 2. CARGAR DATOS DE PRUEBA
echo -e "${BLUE}📦 PASO 2: Cargando Datos de Prueba${NC}"
echo "─────────────────────────────────────────────────────────────"
echo "Insertando 10 productos, 5 clientes y 4 agentes..."
echo ""

if pnpm --filter @workspace/api-server exec npx tsx ../../scripts/seed-test-data.ts; then
    echo ""
    echo -e "${GREEN}✅ Datos cargados exitosamente${NC}"
else
    echo ""
    echo -e "${RED}❌ Error cargando datos${NC}"
    exit 1
fi

echo ""

# 3. EJECUTAR PRUEBAS CONVERSACIONALES
echo -e "${BLUE}🧪 PASO 3: Ejecutando Pruebas Conversacionales${NC}"
echo "─────────────────────────────────────────────────────────────"
echo "Ejecutando 11 pruebas (4 Ventas, 3 Soporte, 3 Técnico)..."
echo "Esto tomará aproximadamente 5-10 minutos."
echo ""

if pnpm --filter @workspace/api-server exec npx tsx ../../scripts/conversational-tests.ts; then
    echo ""
    echo -e "${GREEN}✅ Pruebas completadas exitosamente${NC}"
else
    echo ""
    echo -e "${RED}❌ Error ejecutando pruebas${NC}"
    exit 1
fi

echo ""

# 4. GENERAR REPORTES Y ANÁLISIS
echo -e "${BLUE}📊 PASO 4: Analizando Resultados${NC}"
echo "─────────────────────────────────────────────────────────────"
echo "Generando reportes JSON y HTML..."
echo ""

if pnpm --filter @workspace/api-server exec npx tsx ../../scripts/analyze-test-results.ts; then
    echo ""
    echo -e "${GREEN}✅ Análisis completado${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  No se pudo generar análisis${NC}"
fi

echo ""

# 5. MOSTRAR RESUMEN FINAL
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✨ ¡SETUP COMPLETADO EXITOSAMENTE!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}📊 RESULTADOS:${NC}"
echo "  • Datos: 10 productos + 5 clientes + 4 agentes"
echo "  • Pruebas: 11 conversaciones ejecutadas"
echo "  • Reportes: JSON + HTML generados"
echo ""
echo -e "${BLUE}📁 ARCHIVOS GENERADOS:${NC}"
echo "  • artifacts/test-reports/test-report-*.json"
echo "  • artifacts/test-reports/test-report-*.html"
echo ""
echo -e "${BLUE}📖 DOCUMENTACIÓN:${NC}"
echo "  • QUICK_START_TESTING.md - Referencia rápida"
echo "  • CONVERSATIONAL_TESTING.md - Guía completa"
echo "  • TESTING_VISUAL_GUIDE.md - Diagramas"
echo ""
echo -e "${YELLOW}💡 PRÓXIMOS PASOS:${NC}"
echo "  1. Ver reporte HTML: open artifacts/test-reports/test-report-*.html"
echo "  2. Personalizar datos: edita scripts/seed-test-data.ts"
echo "  3. Agregar nuevas pruebas: edita scripts/conversational-tests.ts"
echo "  4. Integrar en CI/CD: copia este script a .github/workflows/"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
