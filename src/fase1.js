// ── FASE 1 · FUNDAMENTOS (12 semanas) ────────────────────────
// Estructura prometida en el PDF HEXIS START (pág. 14 “FASE 1 · FUNDAMENTOS
// (12 semanas)”): el primer tramo de todo usuario, en 3 bloques de 4
// semanas cada uno. No sustituye al arquetipo ni a los Ciclos PRO (ver
// cycles.js) — es el marco temporal base disponible desde START, que
// antes existía solo como dato sin usar (profiles.js: week:12) y como
// promesa en el PDF, sin seguimiento real en la app.

export const FASE1_TOTAL_WEEKS = 12;

export const FASE1_STAGES = [
  { week:1,  block:1, blockName:"Cimentar",     name:"Activación",     focus:"Arranca el sistema: registra tus datos reales cada día, sin buscar hacerlo perfecto." },
  { week:2,  block:1, blockName:"Cimentar",     name:"Calibración",    focus:"Tu plan se ajusta con tus primeros datos reales, no con la estimación inicial del test." },
  { week:3,  block:1, blockName:"Cimentar",     name:"Adaptación",     focus:"El cuerpo empieza a responder. Prioriza técnica y constancia antes que subir intensidad." },
  { week:4,  block:1, blockName:"Cimentar",     name:"Verificación",   focus:"Revisa tu Score de Coherencia del primer mes: ¿tus acciones encajaron con tu arquetipo?" },
  { week:5,  block:2, blockName:"Sistematizar", name:"Resistencia",    focus:"Sostener ya cuesta menos esfuerzo consciente. Empieza a volverse automático." },
  { week:6,  block:2, blockName:"Sistematizar", name:"Ajuste",         focus:"Con más de un mes de datos reales, el sistema afina tu plan a tu progreso real." },
  { week:7,  block:2, blockName:"Sistematizar", name:"Automatización", focus:"El hábito ya no depende de la motivación del día. Se ejecuta solo." },
  { week:8,  block:2, blockName:"Sistematizar", name:"Contraste",      focus:"Compara tus datos de esta semana contra la semana 1: mide el cambio real, no la sensación." },
  { week:9,  block:3, blockName:"Sostener",     name:"Consolidación",  focus:"Lo construido se defiende solo. El objetivo ya no es empezar, es no soltar." },
  { week:10, block:3, blockName:"Sostener",     name:"Resiliencia",    focus:"Un mal día no rompe el sistema. Se ajusta y sigue, sin todo o nada." },
  { week:11, block:3, blockName:"Sostener",     name:"Síntesis",       focus:"Tus semanas de datos ya cuentan tu historia real de progreso, más allá de la báscula." },
  { week:12, block:3, blockName:"Sostener",     name:"Revelación",     focus:"Cierras tu Fase 1 · Fundamentos. Lo que sigue es profundizar con Ciclos (HEXIS PRO)." },
];

// startDate: 'YYYY-MM-DD' (ver storage.js → ensureFase1Start/loadFase1Start)
export function getFase1Progress(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  const daysElapsed = Math.max(0, Math.floor((now - start) / 86400000));
  const rawWeek = Math.floor(daysElapsed / 7) + 1;
  const weekNum = Math.min(FASE1_TOTAL_WEEKS, rawWeek);
  const stage = FASE1_STAGES[weekNum - 1];
  const pct = Math.min(100, Math.round((rawWeek / FASE1_TOTAL_WEEKS) * 100));
  const done = rawWeek > FASE1_TOTAL_WEEKS;
  return { weekNum, totalWeeks: FASE1_TOTAL_WEEKS, stage, pct, done };
}
