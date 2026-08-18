// ── SCORE DE COHERENCIA ────────────────────────────────────────────
// Mide si las acciones diarias del usuario encajan con la identidad
// de su arquetipo. No es el mismo score para todos: cada arquetipo
// persigue algo distinto, así que cada uno pesa sus propios 3 pilares
// sobre datos que la app ya registra de verdad (nada inventado):
// hábitos, entrenos, esfuerzo real (RIR), sueño, pasos (NEAT), racha
// y si el peso avanza hacia la meta que el usuario definió.
//
// Nota: el backlog del proyecto (ESTADO_MAESTRO_HEXIS.md) menciona
// fórmulas ya diseñadas para esto en ARQUITECTURA_DOMINIO.md — ese
// archivo no existe en la carpeta conectada, así que esta es una
// formulación nueva, coherente con la filosofía Kalokagathia/Areté,
// pero no la versión original referenciada.

const TIERS = [
  [40, 'Disperso', '#7a4a4a'],
  [65, 'En construcción', '#A09060'],
  [85, 'Coherente', '#8BA4A0'],
  [101, 'Areté', '#C8AA50'],
];
export function coherenceTier(score) {
  const [, label, color] = TIERS.find(([max]) => score < max) || TIERS[TIERS.length - 1];
  return { label, color };
}

// stats = { habitsPct, exPct, avgSteps, stepsTarget, avgSleep, streakDay, effortLast, weightOnTrack }
// weightOnTrack: true/false/null (null = sin meta o sin datos suficientes)
export function computeCoherenceScore(archetype, stats) {
  const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
  const stepsPct = stats.stepsTarget ? clamp((stats.avgSteps / stats.stepsTarget) * 100) : 0;
  const sleepPct = clamp((stats.avgSleep / 7.5) * 100);
  const streakPct = clamp((stats.streakDay / 14) * 100); // 14 días seguidos = constancia plena
  const effortPct = stats.effortLast != null ? clamp(stats.effortLast * 10) : 0;
  const weightPct = stats.weightOnTrack === null ? 50 : (stats.weightOnTrack ? 100 : 30);
  const habitsPct = clamp(stats.habitsPct);
  const exPct = clamp(stats.exPct);

  const PILLARS = {
    ALPHA: [
      { label: 'Constancia de entreno', pct: exPct, w: 0.4 },
      { label: 'Esfuerzo real (RIR)', pct: effortPct, w: 0.3 },
      { label: 'Sueño y recuperación', pct: sleepPct, w: 0.3 },
    ],
    HERA: [
      { label: 'Hábitos diarios', pct: habitsPct, w: 0.35 },
      { label: 'NEAT — pasos diarios', pct: stepsPct, w: 0.35 },
      { label: 'Rumbo hacia tu meta', pct: weightPct, w: 0.3 },
    ],
    ZEN: [
      { label: 'Sueño estable', pct: sleepPct, w: 0.4 },
      { label: 'Hábitos de calma', pct: habitsPct, w: 0.35 },
      { label: 'Constancia (racha)', pct: streakPct, w: 0.25 },
    ],
    SHAPE: [
      { label: 'Entrenos completados', pct: exPct, w: 0.35 },
      { label: 'Rumbo hacia tu meta', pct: weightPct, w: 0.35 },
      { label: 'Esfuerzo real (RIR)', pct: effortPct, w: 0.3 },
    ],
    ATENEA: [
      { label: 'Entrenos completados', pct: exPct, w: 0.4 },
      { label: 'Constancia (racha)', pct: streakPct, w: 0.3 },
      { label: 'Hábitos de sistema', pct: habitsPct, w: 0.3 },
    ],
    GAIA: [
      { label: 'Sueño y descanso', pct: sleepPct, w: 0.35 },
      { label: 'Movimiento suave (NEAT)', pct: stepsPct, w: 0.35 },
      { label: 'Constancia sin presión', pct: streakPct, w: 0.3 },
    ],
  };
  const pillars = PILLARS[archetype] || PILLARS.ALPHA;
  const score = clamp(pillars.reduce((s, p) => s + p.pct * p.w, 0));
  const { label, color } = coherenceTier(score);
  return { score, label, color, pillars };
}

// ── ESPEJO DE COHERENCIA — pregunta de cierre diario ────────────────
// Una por arquetipo, coherente con su identidad y su manifiesto.
// Nunca es una evaluación — es una pregunta para mirar el día.
export const MIRROR_PROMPTS = {
  ALPHA: '¿Hoy construiste algo, aunque fuera pequeño?',
  HERA: '¿Hoy tus acciones reflejaron la claridad que buscas?',
  ZEN: '¿Hoy cuerpo y mente dejaron de luchar entre sí?',
  SHAPE: '¿Hoy fuiste paciente contigo mismo/a?',
  ATENEA: '¿Hoy el sistema rindió más que el caos?',
  GAIA: '¿Hoy escuchaste a tu cuerpo en vez de compararlo?',
};
