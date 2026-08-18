// ── ARQUITECTURA DE DOMINIO — ciclos reales ────────────────────────
// En vez de un único plan fijo para siempre, el usuario PRO elige un
// ciclo con un objetivo concreto y una duración. El ciclo ajusta sus
// macros (sobre su base de arquetipo) y le da un énfasis de entreno
// claro — sin reescribir los ejercicios del arquetipo, que siguen
// siendo la base real de cada sesión.

export const CYCLES = {
  hipertrofia: {
    id: "hipertrofia", label: "Hipertrofia", icon: "🏗",
    desc: "Construir músculo real. Superávit calórico controlado, volumen alto, progresión de peso constante.",
    weeks: 8,
    macroMult: { cal: 1.08, prot: 1.0, carbs: 1.15, fat: 1.0 },
    repRange: "8-15",
    emphasis: "Prioriza el rango medio-alto de repeticiones con técnica limpia. Sube peso cuando completes todas las reps con RIR≥2 — no antes.",
  },
  definicion: {
    id: "definicion", label: "Definición", icon: "✂️",
    desc: "Perder grasa preservando el músculo construido. Déficit moderado, cardio y fuerza siempre juntos.",
    weeks: 8,
    macroMult: { cal: 0.85, prot: 1.1, carbs: 0.8, fat: 0.9 },
    repRange: "10-15",
    emphasis: "Mantén el peso de fuerza — no lo bajes solo por estar en déficit. El déficit va en la comida, no en la barra.",
  },
  fuerza: {
    id: "fuerza", label: "Fuerza", icon: "🏋️",
    desc: "Maximizar la fuerza máxima. Mantenimiento calórico, pocas repeticiones, mucha intensidad.",
    weeks: 6,
    macroMult: { cal: 1.0, prot: 1.05, carbs: 1.0, fat: 1.0 },
    repRange: "3-6",
    emphasis: "Prioriza compuestos pesados (sentadilla, press, peso muerto). Descansos largos, técnica estricta, sin prisa entre series.",
  },
  salud: {
    id: "salud", label: "Salud", icon: "🌿",
    desc: "Sostenibilidad ante todo. Mantenimiento calórico, foco en hábitos, sueño y NEAT antes que en el número de la báscula.",
    weeks: 8,
    macroMult: { cal: 1.0, prot: 1.0, carbs: 1.0, fat: 1.0 },
    repRange: "10-15",
    emphasis: "La consistencia importa más que la intensidad este ciclo. Prioriza dormir 7-8h y tus pasos diarios sobre subir peso.",
  },
  rendimiento: {
    id: "rendimiento", label: "Rendimiento", icon: "⚡",
    desc: "Subir capacidad física real: fuerza, potencia y VO2 máx a la vez. Mantenimiento o superávit leve.",
    weeks: 8,
    macroMult: { cal: 1.05, prot: 1.05, carbs: 1.1, fat: 0.95 },
    repRange: "4-10 + cardio estructurado",
    emphasis: "Combina fuerza pesada con HIIT. Mide tu VO2 máx cada 4 semanas en Métricas para ver si el ciclo está funcionando.",
  },
  mantenimiento: {
    id: "mantenimiento", label: "Mantenimiento", icon: "⚖️",
    desc: "Sostener lo conseguido sin exigir más. Calorías de mantenimiento, entreno de sostenimiento.",
    weeks: 6,
    macroMult: { cal: 1.0, prot: 1.0, carbs: 1.0, fat: 1.0 },
    repRange: "8-12",
    emphasis: "No hace falta progresar cada semana en este ciclo. Sostener con constancia también es avanzar.",
  },
};

export function applyCycleMacros(baseMacros, cycleId) {
  const c = CYCLES[cycleId];
  if (!c) return baseMacros;
  return {
    cal: Math.round(baseMacros.cal * c.macroMult.cal),
    prot: Math.round(baseMacros.prot * c.macroMult.prot),
    carbs: Math.round(baseMacros.carbs * c.macroMult.carbs),
    fat: Math.round(baseMacros.fat * c.macroMult.fat),
  };
}

// cycleData = { id, startDate } — devuelve la semana actual del ciclo y su progreso
export function getCycleProgress(cycleData) {
  if (!cycleData || !CYCLES[cycleData.id]) return null;
  const cycle = CYCLES[cycleData.id];
  const start = new Date(cycleData.startDate);
  const now = new Date();
  const daysElapsed = Math.max(0, Math.floor((now - start) / 86400000));
  const weekNum = Math.floor(daysElapsed / 7) + 1;
  const pct = Math.min(100, Math.round((weekNum / cycle.weeks) * 100));
  return { weekNum: Math.min(weekNum, cycle.weeks), totalWeeks: cycle.weeks, pct, done: weekNum > cycle.weeks, cycle };
}
