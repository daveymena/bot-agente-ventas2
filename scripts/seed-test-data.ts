/**
 * Datos de Prueba Realistas
 *
 * Inserta productos, clientes y configuración en la BD para pruebas
 *
 * Ejecutar: npx tsx scripts/seed-test-data.ts
 */

import { db } from "../lib/db/src/index.js";
import {
  productsTable,
  clientsTable,
  botConfigTable,
  agentsTable,
} from "../lib/db/src/schema/index.js";

// ============================================================================
// DATOS DE PRUEBA REALISTAS
// ============================================================================

const TEST_PRODUCTS = [
  {
    name: "Piano Digital 88 Teclas Profesional",
    description:
      "Piano digital de 88 teclas con sonidos de calidad studio, diseñado para principiantes y profesionales. Incluye stand y pedales.",
    price: 899.99,
    category: "Instrumentos Musicales",
    brand: "Yamaha",
    stock: 15,
    imageUrl: "https://via.placeholder.com/300?text=Piano+Digital",
  },
  {
    name: "Guitarra Acústica de Madera Maciza",
    description:
      "Guitarra acústica construida con madera maciza de abeto y cedro. Sonoridad cálida y proyección. Incluye funda acolchada.",
    price: 349.99,
    category: "Instrumentos Musicales",
    brand: "Fender",
    stock: 8,
    imageUrl: "https://via.placeholder.com/300?text=Guitarra+Acustica",
  },
  {
    name: "Ukelele Soprano Concert Series",
    description:
      "Ukelele de tamaño concert (23 pulgadas) con sonido brillante y alegre. Perfecto para principiantes. Cuerpo de caoba.",
    price: 89.99,
    category: "Instrumentos Musicales",
    brand: "Kala",
    stock: 25,
    imageUrl: "https://via.placeholder.com/300?text=Ukelele+Soprano",
  },
  {
    name: "Amplificador de Guitarra 100W",
    description:
      "Amplificador versátil con 100W de potencia. Controles de ganancia, volumen, reverb. Entrada para auriculares.",
    price: 449.99,
    category: "Equipos de Audio",
    brand: "Marshall",
    stock: 5,
    imageUrl: "https://via.placeholder.com/300?text=Amplificador+Guitarra",
  },
  {
    name: "Batería Acústica de 5 Piezas",
    description:
      "Batería profesional de 5 piezas con platillos incluidos. Estructura de madera de abedul. Ideal para estudio y actuaciones.",
    price: 599.99,
    category: "Instrumentos Musicales",
    brand: "Pearl",
    stock: 3,
    imageUrl: "https://via.placeholder.com/300?text=Bateria+Acustica",
  },
  {
    name: "Micrófono Condensador USB",
    description:
      "Micrófono condensador de estudio con conexión USB directa. Patrón cardioide. Perfecto para podcasts y grabaciones.",
    price: 129.99,
    category: "Equipos de Audio",
    brand: "Audio-Technica",
    stock: 20,
    imageUrl: "https://via.placeholder.com/300?text=Microfono+USB",
  },
  {
    name: "Interfaz de Audio Profesional",
    description:
      "Interfaz de audio con 2 entradas XLR, 2 salidas, y conexión MIDI. Resolución 24-bit/192kHz. Software incluido.",
    price: 199.99,
    category: "Equipos de Audio",
    brand: "Focusrite",
    stock: 12,
    imageUrl: "https://via.placeholder.com/300?text=Interfaz+Audio",
  },
  {
    name: "Cascos Audiófilos Over-Ear",
    description:
      "Cascos de diadema con sonido de calidad audiófila. Cancelación de ruido activa. Batería 30 horas. Conector de audio de 3.5mm.",
    price: 349.99,
    category: "Equipos de Audio",
    brand: "Sony",
    stock: 18,
    imageUrl: "https://via.placeholder.com/300?text=Cascos+Audiophile",
  },
  {
    name: "Soporte Profesional para Microófono",
    description:
      "Soporte articulado de araña para micrófono con reductor de ruido integrado. Brazo ajustable 360°.",
    price: 49.99,
    category: "Accesorios",
    brand: "Neewer",
    stock: 40,
    imageUrl: "https://via.placeholder.com/300?text=Soporte+Microfono",
  },
  {
    name: "Cable XLR Balanceado 10 Metros",
    description:
      "Cable XLR profesional balanceado de 10 metros. Conectores de oro. Blindaje de múltiples capas contra interferencias.",
    price: 24.99,
    category: "Accesorios",
    brand: "Mogami",
    stock: 50,
    imageUrl: "https://via.placeholder.com/300?text=Cable+XLR",
  },
];

const TEST_CLIENTS = [
  {
    phone: "+34912345601",
    name: "María García",
    leadStatus: "cold" as const,
    purchaseProbability: 0,
    technicalLevel: "basic" as const,
    totalInteractions: 0,
  },
  {
    phone: "+34912345602",
    name: "Juan López",
    leadStatus: "warm" as const,
    purchaseProbability: 45,
    technicalLevel: "intermediate" as const,
    totalInteractions: 3,
  },
  {
    phone: "+34912345603",
    name: "Carlos Martín",
    leadStatus: "hot" as const,
    purchaseProbability: 75,
    technicalLevel: "advanced" as const,
    totalInteractions: 8,
  },
  {
    phone: "+34912345604",
    name: "Ana Rodríguez",
    leadStatus: "warm" as const,
    purchaseProbability: 50,
    technicalLevel: "basic" as const,
    totalInteractions: 2,
  },
  {
    phone: "+34912345701",
    name: "Pedro García",
    leadStatus: "warm" as const,
    purchaseProbability: 30,
    technicalLevel: "intermediate" as const,
    totalInteractions: 5,
  },
];

const BOT_CONFIG = {
  businessName: "MusicPro Studio",
  businessType: "e-commerce",
  personality:
    "Soy amable, profesional y entusiasta sobre la música. Me encanta ayudar a los clientes a encontrar el instrumento perfecto.",
  botName: "MusicBot",
  paymentMethods: "Tarjeta crédito, PayPal, transferencia bancaria, cuotas",
  maxContextMessages: 10,
  isActive: true,
  fallbackMessage:
    "Lo siento, no entendí bien tu pregunta. ¿Puedes reformularla, por favor?",
  workingHours: "Lunes a viernes: 9:00-18:00 | Fines de semana: 10:00-14:00",
};

const BOT_AGENTS = [
  {
    key: "sales",
    name: "Agente de Ventas",
    description: "Especializado en venta de productos y consultoría",
    systemPrompt: `Eres un agente de ventas experto y amable de MusicPro Studio. Tu objetivo es:
1. Entender las necesidades del cliente
2. Recomendar productos apropiados
3. Responder preguntas sobre precio, características y disponibilidad
4. Guiar al cliente hacia la compra

Siempre sé honesto sobre los productos. Si el cliente tiene dudas, acláralas sin presionar.
Usa un tono conversacional y cálido. Termina siempre con una pregunta para mantener el diálogo.`,
    isActive: true,
  },
  {
    key: "support",
    name: "Agente de Soporte",
    description: "Resuelve problemas y gestiona reclamaciones",
    systemPrompt: `Eres un agente de soporte empático y profesional de MusicPro Studio. Tu objetivo es:
1. Entender el problema del cliente
2. Ofrecer soluciones rápidas
3. Gestionar devoluciones y reemplaos
4. Mantener la satisfacción del cliente

Siempre muestra empatía. Si no puedes resolver el problema, escala a un supervisor.
Proporciona pasos claros y específicos para resolver el problema.`,
    isActive: true,
  },
  {
    key: "technical",
    name: "Agente Técnico",
    description: "Proporciona información técnica y especializada",
    systemPrompt: `Eres un ingeniero técnico especializado en instrumentos musicales. Tu objetivo es:
1. Proporcionar especificaciones técnicas detalladas
2. Comparar modelos objetivamente
3. Dar recomendaciones basadas en necesidades técnicas
4. Explicar características de forma clara

Usa terminología técnica pero explica conceptos complejos de forma accesible.
Siempre cita las especificaciones reales del producto.`,
    isActive: true,
  },
  {
    key: "admin",
    name: "Agente Admin",
    description: "Gestiona aspectos administrativos",
    systemPrompt: `Eres un agente administrativo de MusicPro Studio. Tu objetivo es:
1. Gestionar pedidos
2. Proporcionar información de facturación
3. Responder preguntas administrativas
4. Coordinar con otros departamentos

Sé profesional y mantén registros precisos.`,
    isActive: true,
  },
];

// ============================================================================
// FUNCIONES DE INSERCIÓN
// ============================================================================

async function seedProducts(): Promise<void> {
  try {
    console.log("\n📦 Insertando productos de prueba...");

    // Limpiar productos existentes
    await db.delete(productsTable);

    // Insertar nuevos productos
    const inserted = await db
      .insert(productsTable)
      .values(TEST_PRODUCTS)
      .returning();

    console.log(`✅ ${inserted.length} productos insertados:`);
    for (const product of inserted) {
      console.log(`   • ${product.name} - $${product.price}`);
    }
  } catch (error) {
    console.error("Error insertando productos:", error);
    throw error;
  }
}

async function seedClients(): Promise<void> {
  try {
    console.log("\n👥 Insertando clientes de prueba...");

    // Limpiar clientes existentes
    await db.delete(clientsTable);

    // Insertar nuevos clientes
    const inserted = await db
      .insert(clientsTable)
      .values(TEST_CLIENTS)
      .returning();

    console.log(`✅ ${inserted.length} clientes insertados:`);
    for (const client of inserted) {
      console.log(`   • ${client.name} (${client.phone})`);
    }
  } catch (error) {
    console.error("Error insertando clientes:", error);
    throw error;
  }
}

async function seedBotConfig(): Promise<void> {
  try {
    console.log("\n⚙️ Actualizando configuración del bot...");

    // Limpiar configuración existente
    await db.delete(botConfigTable);

    // Insertar nueva configuración
    const [config] = await db
      .insert(botConfigTable)
      .values(BOT_CONFIG)
      .returning();

    console.log(`✅ Configuración actualizada:`);
    console.log(`   • Negocio: ${config.businessName}`);
    console.log(`   • Tipo: ${config.businessType}`);
    console.log(`   • Bot: ${config.botName}`);
  } catch (error) {
    console.error("Error actualizando configuración:", error);
    throw error;
  }
}

async function seedAgents(): Promise<void> {
  try {
    console.log("\n🤖 Insertando agentes especializados...");

    // Limpiar agentes existentes
    await db.delete(agentsTable);

    // Insertar nuevos agentes
    const inserted = await db
      .insert(agentsTable)
      .values(BOT_AGENTS)
      .returning();

    console.log(`✅ ${inserted.length} agentes insertados:`);
    for (const agent of inserted) {
      console.log(`   • ${agent.name} (${agent.key})`);
    }
  } catch (error) {
    console.error("Error insertando agentes:", error);
    throw error;
  }
}

// ============================================================================
// EJECUCIÓN PRINCIPAL
// ============================================================================

async function main(): Promise<void> {
  console.log("🌱 Sembrando Datos de Prueba en la Base de Datos\n");
  console.log("=".repeat(60));

  try {
    await seedProducts();
    await seedClients();
    await seedBotConfig();
    await seedAgents();

    console.log("\n" + "=".repeat(60));
    console.log("✨ ¡Datos de prueba insertados exitosamente!");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error durante el seeding:", error);
    process.exit(1);
  }
}

main();
