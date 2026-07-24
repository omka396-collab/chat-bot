import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
  utils,
} from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";

const PORT = process.env.PORT ?? 3008;
const NUMERO_AMERICANA = "4149746280";
const NUMERO_EKOPACK = "4247517912";

const PIE_MENU = "\n\n🔄 Escribe *menu* en cualquier momento para volver al inicio.";

// --- HELPER DE VALIDACIÓN DE MENÚ ---
// Normaliza el texto quitando acentos y espacios extra para validar si solicita el menú
const esComandoMenu = (texto: string): boolean => {
  const limpio = texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Quita tildes: menú -> menu
  return limpio === "menu" || limpio === "inicio" || limpio === "menú";
};

// --- ESTRUCTURA DE DATOS / CATÁLOGOS ---

const tiposBolsas = [
  { nombre: "Bolsas Boutique" },
  { nombre: "Bolsas con Asa" },
  { nombre: "Bolsas para Panadería" },
  { nombre: "Bolsas tipo Cono" },
  { nombre: "Bolsas de Aseo" },
  { nombre: "Bolsas para Hielo" },
  { nombre: "Bolsas para Pulpa" },
  { nombre: "Bolsas para Cestas" },
  { nombre: "Bolsas para Papelera" },
  { nombre: "Bolsas Multiusos" },
  { nombre: "Bolsas Chillonas" },
  { nombre: "Bolsas para Granos" },
  { nombre: "Bolsas Hospitalarias" },
  { nombre: "Bolsas de Seguridad para Enviós"},
  { nombre: "Bolsas para Pollo"},
  { nombre: "Bolsas Sector Industrial"},
  { nombre: "Bolsas para Queso"},
  { nombre: "Bolsas para Suero"},
  { nombre: "Bolsas para Sal"},
  { nombre: "Bolsas para Pego"},
  { nombre: "Bolsas para Cal"},
  { nombre: "Bolsones (Diferentes Medidas)"},
];

const tiposInsumosHogar = [
  { nombre: "Suavizante" },
  { nombre: "Servilletas" },
  { nombre: "Cinta de Embalar" },
  { nombre: "Papel de Aluminio" },
  { nombre: "Papel para Hornear" },
  { nombre: "Papel para Envolver" },
  { nombre: "Papel Parafinado Antigrasa" },
  { nombre: "Envoltura Plástica" },
];

// Helper para iterar e imprimir con formato de lista
const listaBolsasFormateada = tiposBolsas.map((item) => `✅ ${item.nombre}`).join("\n");
const listaHogarFormateada = tiposInsumosHogar.map((item) => `✅ ${item.nombre}`).join("\n");

// --- SUBFLUJOS DE CATÁLOGO ---

const flujoCatalogoBolsas = addKeyword<Provider, Database>(
  utils.setEvent("CATALOGO_BOLSAS")
).addAnswer(
  [
    "🛍️ *Línea de Bolsas y Empaques (Americana del Plástico)*",
    "",
    listaBolsasFormateada,
    "",
    "📌 *Nota:* Los precios se cotizan según el volumen de compra.",
    "",
    "📲 Escribe *pedir* para solicitar una cotización con la fábrica." + PIE_MENU,
  ].join("\n"),
  { capture: true },
  async (ctx, { gotoFlow, fallBack }) => {
    const txt = ctx.body.trim().toLowerCase();

    if (txt.includes("pedir") || txt.includes("cotizar") || txt.includes("comprar")) {
      return gotoFlow(flujoPedidoBolsas);
    }
    if (esComandoMenu(txt)) {
      return gotoFlow(flujoMenu);
    }

    return fallBack(
      "⚠️ Respuesta no válida. Escribe *pedir* para cotizar estas bolsas o *menu* para volver al inicio."
    );
  }
);

const flujoCatalogoHogar = addKeyword<Provider, Database>(
  utils.setEvent("CATALOGO_HOGAR")
).addAnswer(
  [
    "🏠 *Línea Hogar, Papelería e Insumos (Ekopack)*",
    "",
    listaHogarFormateada,
    "",
    "📌 *Nota:* Los precios se cotizan según el volumen de compra.",
    "",
    "📲 Escribe *pedir* para solicitar una cotización con la distribuidora." + PIE_MENU,
  ].join("\n"),
  { capture: true },
  async (ctx, { gotoFlow, fallBack }) => {
    const txt = ctx.body.trim().toLowerCase();

    if (txt.includes("pedir") || txt.includes("cotizar") || txt.includes("comprar")) {
      return gotoFlow(flujoPedidoHogar);
    }
    if (esComandoMenu(txt)) {
      return gotoFlow(flujoMenu);
    }

    return fallBack(
      "⚠️ Respuesta no válida. Escribe *pedir* para cotizar estos insumos o *menu* para volver al inicio."
    );
  }
);

const flujoCatalogo = addKeyword<Provider, Database>(
  utils.setEvent("FLUJO_CATALOGO")
).addAnswer(
  [
    "📦 *Catálogo de Productos OMKA*",
    "Selecciona la categoría de tu interés:",
    "",
    "1️⃣ *Bolsas y Empaques* (Plásticos)",
    "2️⃣ *Hogar y Papelería* (Servilletas, Papeles, Insumos)",
    "",
    "Responde enviando el número *1* o *2*.",
  ].join("\n"),
  { capture: true },
  async (ctx, { gotoFlow, fallBack }) => {
    const txt = ctx.body.trim();
    if (txt === "1") return gotoFlow(flujoCatalogoBolsas);
    if (txt === "2") return gotoFlow(flujoCatalogoHogar);
    if (esComandoMenu(txt)) return gotoFlow(flujoMenu);
    return fallBack("⚠️ Opción inválida. Por favor responde *1* para Bolsas o *2* para Hogar.");
  }
);

// --- FLUJO DE PEDIDOS Y COTIZACIONES ---

const flujoPedidoBolsas = addKeyword<Provider, Database>(
  utils.setEvent("PEDIDO_BOLSAS")
).addAnswer(
  [
    "🏭 *Atención de Pedidos - Fábrica (Americana del Plástico)*",
    "",
    "Para pedidos de bolsas al mayor o detalles de producción, comunícate con la fábrica:",
    "",
    `📞 *Contacto Americana del Plástico:* +58 ${NUMERO_AMERICANA}` + PIE_MENU,
  ].join("\n")
);

const flujoPedidoHogar = addKeyword<Provider, Database>(
  utils.setEvent("PEDIDO_HOGAR")
).addAnswer(
  [
    "🏪 *Atención de Pedidos - Distribuidora (Ekopack)*",
    "",
    "Para ventas al detal o mayor de papelería, servilletas e insumos para el hogar:",
    "",
    `📞 *Contacto Ekopack:* +58 ${NUMERO_EKOPACK}` + PIE_MENU,
  ].join("\n")
);

const flujoPedidoAmbos = addKeyword<Provider, Database>(
  utils.setEvent("PEDIDO_AMBOS")
).addAnswer(
  [
    "🏢 *Atención Múltiple OMKA*",
    "",
    `📞 Para *Bolsas (Americana del Plástico):* +58 ${NUMERO_AMERICANA}`,
    "",
    `📞 Para *Servilletas, papel e Insumos del Hogar (Ekopack):* +58 ${NUMERO_EKOPACK}` + PIE_MENU,
  ].join("\n")
);

const flujoPedido = addKeyword<Provider, Database>([
  "pedir",
  "comprar",
  "cotizar",
  utils.setEvent("FLUJO_PEDIDO")
]).addAnswer(
  [
    "🛒 *¿Qué productos deseas adquirir o cotizar?*",
    "",
    "1️⃣ Bolsas Plásticas",
    "2️⃣ Servilletas, Papel o Insumos para el Hogar",
    "3️⃣ Ambos tipos de productos",
    "",
    "Responde con *1*, *2* o *3* para canalizar tu solicitud.",
  ].join("\n"),
  { capture: true },
  async (ctx, { gotoFlow, fallBack }) => {
    const txt = ctx.body.trim();
    if (txt === "1") return gotoFlow(flujoPedidoBolsas);
    if (txt === "2") return gotoFlow(flujoPedidoHogar);
    if (txt === "3") return gotoFlow(flujoPedidoAmbos);
    if (esComandoMenu(txt)) return gotoFlow(flujoMenu);
    return fallBack("⚠️ Opción inválida. Por favor responde con *1*, *2* o *3*.");
  }
);

// --- FLUJOS INFORMATIVOS DIRECTOS ---

const flujoImpresion = addKeyword<Provider, Database>([
  "impresion",
  "impresión",
  "estampado",
  "personalizado",
  utils.setEvent("FLUJO_IMPRESION")
]).addAnswer(
  [
    "🎨 *Servicio de Impresión Personalizada*",
    "",
    "Ofrecemos impresión de marca únicamente para los siguientes tipos de bolsas:",
    "",
    "✅ " + tiposBolsas[0].nombre,
    "✅ " + tiposBolsas[1].nombre,
    "✅ " + tiposBolsas[2].nombre,
    "✅ " + tiposBolsas[5].nombre,
    "✅ " + tiposBolsas[11].nombre,
    "✅ " + tiposBolsas[12].nombre,
    "✅ " + tiposBolsas[13].nombre,
    "✅ " + tiposBolsas[14].nombre,
    "✅ " + tiposBolsas[15].nombre,
    "✅ " + tiposBolsas[16].nombre,
    "✅ " + tiposBolsas[17].nombre,
    "✅ " + tiposBolsas[18].nombre,
    "✅ " + tiposBolsas[19].nombre,
    "✅ " + tiposBolsas[20].nombre,
    "",
    "⚠️ *Condición:* Este servicio aplica exclusivamente para pedidos **al mayor / volumen industrial**.",
    "",
    `📞 *Atención directa en Americana del Plástico:* +58 ${NUMERO_AMERICANA}` + PIE_MENU,
  ].join("\n")
);

// --- FLUJO DE UBICACIÓN ---

const flujoUbicacion = addKeyword<Provider, Database>([
  "ubicacion",
  "ubicación",
  "donde estan",
  "dónde están",
  "direccion",
  "dirección",
  utils.setEvent("FLUJO_UBICACION")
]).addAnswer(
  [
    "📍 *Ubicaciones y Puntos de Atención*",
    "",
    "🏭 *Planta de Fabricación (Americana del Plástico):*",
    "Ureña, Estado Táchira.",
    "",
    "🏪 *Centro de Distribución y Ventas (Ekopack):*",
    "San Cristóbal, Estado Táchira.",
    "",
    "🌐 *Atención y Envíos:* Cobertura únicamente en Venezuela." + PIE_MENU,
  ].join("\n")
);

const flujoPrecios = addKeyword<Provider, Database>([
  "precio",
  "precios",
  "costo",
  "costos",
  utils.setEvent("FLUJO_PRECIOS")
]).addAnswer(
  [
    "💡 *Consulta de Precios y Cotizaciones*",
    "",
    "Nuestros costos varían según el volumen de compra y las fluctuaciones de la materia prima.",
    "",
    "Escribe *pedir* para ir directo a cotizaciones y obtener más información directamente con las fábricas." + PIE_MENU,
  ].join("\n")
);

const flujoDudaHumana = addKeyword<Provider, Database>(
  utils.setEvent("FLUJO_DUDA")
).addAnswer(
  [
    "💬 Entendido. Un miembro de nuestro equipo leerá tu mensaje y te responderá en breve por este canal." + PIE_MENU,
  ].join("\n")
);

// --- FLUJO PRINCIPAL / MENÚ --- //

const flujoMenu = addKeyword<Provider, Database>([
  "hola",
  "holaa",
  "holaaa",
  "holaa!",
  "hola!",
  "ola",
  "olaa",
  "hello",
  "hi",
  "hey",
  "heyy",
  "buenas",
  "buenass",
  "saludos",
  "epale",
  "epa",
  "qtal",
  "que tal",
  "qué tal",
  "buenos dias",
  "buenos días",
  "buenos dia",
  "buenos día",
  "buenas tardes",
  "buena tarde",
  "buenas noches",
  "buena noche",
  "menu",
  "menú",
  "inicio",
  "iniciar",
  "comenzar",
  "comienzo",
  "empezar",
  "empiezo",
  "reiniciar",
  "reset",
  "volver",
  "info",
  "informacion",
  "información",
  "mas info",
  "más información",
  "más informacion",
  "ayuda",
  "opciones",
  "catalogo",
  "catálogo",
  "interesado",
  "interesada",
  "me interesa",
  "quisiera saber",
  "quiero saber",
  "consulta",
  "atencion",
  "atención",
  "asesor",
  "contacto",
  "."
]).addAnswer(
  [
    "👋 ¡Hola! Bienvenido al servicio de atención al cliente *OMKA*.",
    "",
    "Selecciona la opción de tu interés enviando un número del 1 al 6:",
    "",
    "1️⃣ *Catálogo de Productos*",
    "2️⃣ *Realizar un Pedido / Cotización*",
    "3️⃣ *Impresión Personalizada de Bolsas*",
    "4️⃣ *Ubicaciones*",
    "5️⃣ *Consultar Precios*",
    "6️⃣ *Consultar otra duda con un asesor*",
  ].join("\n"),
  { capture: true },
  async (ctx, { gotoFlow, fallBack }) => {
    const opcion = ctx.body.trim();

    if (opcion === "1") return gotoFlow(flujoCatalogo);
    if (opcion === "2") return gotoFlow(flujoPedido);
    if (opcion === "3") return gotoFlow(flujoImpresion);
    if (opcion === "4") return gotoFlow(flujoUbicacion);
    if (opcion === "5") return gotoFlow(flujoPrecios);
    if (opcion === "6") return gotoFlow(flujoDudaHumana);

    return fallBack("⚠️ Por favor ingresa únicamente un número del 1 al 6 para seleccionar una opción.");
  }
);

// --- FLUJO DEFAULT / FALLBACK ---

const flujoDefault = addKeyword<Provider, Database>(EVENTS.ACTION).addAnswer(
  "💬 En breve te responderá un miembro del equipo de *OMKA* para atender tu consulta de forma personalizada." + PIE_MENU
);

// --- INICIALIZACIÓN ---

const main = async () => {
  const adapterFlow = createFlow([
    flujoMenu,
    flujoCatalogo,
    flujoCatalogoBolsas,
    flujoCatalogoHogar,
    flujoPedido,
    flujoPedidoBolsas,
    flujoPedidoHogar,
    flujoPedidoAmbos,
    flujoImpresion,
    flujoUbicacion,
    flujoPrecios,
    flujoDudaHumana,
    flujoDefault,
  ]);

  const adapterProvider = createProvider(Provider, {
    version: [2, 3000, 1035824857],
  });

  const adapterDB = new Database();

  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  httpServer(+PORT);
};

main();

// Puerto 3000
// fuser -k 3008/tcp
// bot_sessions