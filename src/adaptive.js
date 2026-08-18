// ── MOTOR ADAPTATIVO Y MÉTRICAS DE RENDIMIENTO ────────────────────
// Toma el historial real registrado por el usuario (peso, reps, RIR)
// y calcula: el peso sugerido de la próxima sesión, y las métricas
// de tensión mecánica, esfuerzo y fatiga para las gráficas.

function isoWeek(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return d.getFullYear() + '-W' + (1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7));
}

// Peso sugerido para el próximo entreno de un ejercicio, calculado
// sobre lo que el usuario realmente registró — no sobre el dato fijo
// del plan. Si no hay historial de ese ejercicio, se usa el del plan.
export function getAdaptiveWeight(logs, exerciseName, planWeight, targetReps) {
  const history = logs.filter(l => l.exercise === exerciseName).sort((a, b) => b.date.localeCompare(a.date));
  if (history.length === 0) return { weight: planWeight, source: 'plan' };
  const last = history[0];
  const step = planWeight >= 20 ? 2.5 : 1;
  const repsTarget = parseInt(targetReps) || last.reps;
  const failedLast = last.reps < repsTarget || last.rir === 0;
  const failedPrev = history[1] && (history[1].reps < repsTarget || history[1].rir === 0);
  if (failedLast && failedPrev) {
    // Dos sesiones seguidas al fallo o sin margen — deload del 10%
    const deloaded = Math.max(0, Math.round((last.weight * 0.9) / step) * step);
    return { weight: deloaded, source: 'deload' };
  }
  if (last.reps >= repsTarget && last.rir >= 2) {
    return { weight: Math.round((last.weight + step) * 10) / 10, source: 'progression' };
  }
  return { weight: last.weight, source: 'hold' };
}

// Volumen semanal (tensión mecánica): suma de peso × reps × series.
export function weeklyVolume(logs, weeks = 8) {
  const byWeek = {};
  logs.forEach(l => {
    const wk = isoWeek(l.date);
    byWeek[wk] = (byWeek[wk] || 0) + (l.weight * l.reps * (l.sets || 1));
  });
  return Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0])).slice(-weeks)
    .map(([week, volume]) => ({ week, volume: Math.round(volume) }));
}

// Esfuerzo medio semanal (0-10), derivado del RIR registrado en cada serie.
export function weeklyEffort(logs, weeks = 8) {
  const byWeek = {};
  logs.forEach(l => {
    if (l.rir === null || l.rir === undefined) return;
    const wk = isoWeek(l.date);
    if (!byWeek[wk]) byWeek[wk] = [];
    byWeek[wk].push(((4 - l.rir) / 4) * 10);
  });
  return Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0])).slice(-weeks)
    .map(([week, vals]) => ({ week, effort: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 }));
}

// Fatiga: ratio de carga aguda (últimos 7 días) frente a la crónica
// (media semanal de las últimas 4 semanas). Es el ACWR (Acute:Chronic
// Workload Ratio), un indicador real de ciencia del deporte.
// >1.3 = fatiga alta · <0.8 = descarga · 0.8–1.3 = normal.
export function fatigueRatio(logs) {
  const now = new Date();
  const cutoffAcute = new Date(now); cutoffAcute.setDate(now.getDate() - 7);
  const cutoffChronic = new Date(now); cutoffChronic.setDate(now.getDate() - 28);
  const acute = logs.filter(l => new Date(l.date) >= cutoffAcute).reduce((s, l) => s + l.weight * l.reps * (l.sets || 1), 0);
  const chronicTotal = logs.filter(l => new Date(l.date) >= cutoffChronic).reduce((s, l) => s + l.weight * l.reps * (l.sets || 1), 0);
  const chronicWeekly = chronicTotal / 4;
  if (chronicWeekly === 0) return { ratio: null, label: 'Sin datos suficientes' };
  const ratio = Math.round((acute / chronicWeekly) * 100) / 100;
  let label = 'Normal';
  if (ratio > 1.3) label = 'Alta';
  else if (ratio < 0.8) label = 'Baja (descarga)';
  return { ratio, label };
}

// Clasificación orientativa del VO2max (ml/kg/min) — tablas generales
// de fitness cardiorrespiratorio para adultos, no ajustadas por edad.
export function vo2Category(vo2max, gender) {
  const table = gender === 'female'
    ? [[24, 'Baja'], [31, 'Regular'], [37, 'Buena'], [41, 'Muy buena'], [Infinity, 'Excelente']]
    : [[30, 'Baja'], [38, 'Regular'], [44, 'Buena'], [51, 'Muy buena'], [Infinity, 'Excelente']];
  return table.find(([max]) => vo2max <= max)[1];
}

// ── CALORÍAS QUEMADAS ──────────────────────────────────────────────
// Misma fórmula estándar que usan los relojes y apps de fitness:
// kcal/min = (MET × 3.5 × peso_kg) / 200. MET 6 para fuerza (estimando
// ~3 min por serie entre ejecución y descanso), más el NEAT de los
// pasos registrados (~0.04 kcal/paso, ajustado por peso corporal).
const STRENGTH_MET = 6;
export function estimateDailyCalories(daySetLogs, steps, bodyWeightKg = 75) {
  const totalSets = daySetLogs.reduce((s, l) => s + (l.sets || 1), 0);
  const trainMinutes = totalSets * 3;
  const trainKcal = (STRENGTH_MET * 3.5 * bodyWeightKg / 200) * trainMinutes;
  const stepsKcal = steps ? steps * 0.04 * (bodyWeightKg / 70) : 0;
  return Math.round(trainKcal + stepsKcal);
}

export function weeklyCaloriesBurned(setLogs, stepsLog, bodyWeightKg = 75, weeks = 8) {
  const days = {};
  setLogs.forEach(l => { (days[l.date] = days[l.date] || []).push(l); });
  const stepsByDate = {};
  stepsLog.forEach(s => { stepsByDate[s.date] = s.steps; });
  const allDates = new Set([...Object.keys(days), ...Object.keys(stepsByDate)]);
  const byWeek = {};
  allDates.forEach(date => {
    const kcal = estimateDailyCalories(days[date] || [], stepsByDate[date] || 0, bodyWeightKg);
    const wk = isoWeek(date);
    byWeek[wk] = (byWeek[wk] || 0) + kcal;
  });
  return Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0])).slice(-weeks)
    .map(([week, kcal]) => ({ week, kcal: Math.round(kcal) }));
}

// ── VOLUMEN POR GRUPO MUSCULAR ─────────────────────────────────────
// Agrupa los 21 grupos musculares reales de EXERCISES (esquema anatómico
// del 18 ago, ver exercises.js) en 6 bloques legibles para ver de un
// vistazo dónde se concentra el entreno real de los últimos N días.
// Nada simulado: solo lo que el usuario registró.
export const MUSCLE_BUCKETS = {
  pecho:   { label: 'Pecho',   color: '#C8AA50' },
  espalda: { label: 'Espalda', color: '#8BA4A0' },
  hombros: { label: 'Hombros', color: '#D4C5A9' },
  brazos:  { label: 'Brazos',  color: '#A09060' },
  piernas: { label: 'Piernas', color: '#C8AA50' },
  core:    { label: 'Core',    color: '#909090' },
};
const MUSCLE_TO_BUCKET = {
  pectoral: 'pecho',
  espalda_media: 'espalda', espalda_baja: 'espalda', dorsal: 'espalda', trapecio_alto: 'espalda', trapecio: 'espalda',
  deltoides: 'hombros',
  biceps: 'brazos', triceps: 'brazos',
  cuadriceps: 'piernas', isquiotibiales: 'piernas', gemelos: 'piernas', soleo: 'piernas', tibial_anterior: 'piernas',
  gluteo_mayor: 'piernas', gluteo_medio: 'piernas', gluteo_superior: 'piernas', gluteo_inferior: 'piernas',
  abdominales: 'core', serrato: 'core', otros: 'core',
};
export function volumeByMuscleGroup(setLogs, exercisesData, days = 30) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
  const nameToMuscle = {};
  exercisesData.forEach(e => { nameToMuscle[e.name] = e.muscle; });
  const totals = {};
  Object.keys(MUSCLE_BUCKETS).forEach(b => { totals[b] = 0; });
  setLogs.forEach(l => {
    if (new Date(l.date) < cutoff) return;
    const muscle = nameToMuscle[l.exercise];
    const bucket = muscle && MUSCLE_TO_BUCKET[muscle];
    if (!bucket) return;
    totals[bucket] += l.weight * l.reps * (l.sets || 1);
  });
  return Object.entries(totals).map(([key, volume]) => ({
    key, label: MUSCLE_BUCKETS[key].label, color: MUSCLE_BUCKETS[key].color,
    volume: Math.round(volume),
  }));
}

// ── TENDENCIA DE PESO POR PERIODO ──────────────────────────────────
// Variación real del peso registrado en distintas ventanas (3/7/14/30/90
// días) más una proyección simple a 30 días basada en la tendencia de
// los últimos 14. Todo calculado sobre datos reales, sin inventar nada.
export function weightTrend(weightLog) {
  if (!weightLog || weightLog.length < 2) return null;
  const sorted = [...weightLog].sort((a, b) => a.date.localeCompare(b.date));
  const lastEntry = sorted[sorted.length - 1];
  const lastDate = new Date(lastEntry.date);
  const valueNDaysAgo = (days) => {
    const target = new Date(lastDate); target.setDate(target.getDate() - days);
    let closest = null, closestDiff = Infinity;
    sorted.forEach(e => {
      const diff = Math.abs(new Date(e.date) - target);
      if (diff < closestDiff) { closestDiff = diff; closest = e; }
    });
    return closest ? closest.value : null;
  };
  const periods = [3, 7, 14, 30, 90].map(days => {
    const past = valueNDaysAgo(days);
    const diff = past !== null ? Math.round((lastEntry.value - past) * 10) / 10 : null;
    return { days, diff };
  });
  const last14 = valueNDaysAgo(14);
  const dailyRate = last14 !== null ? (lastEntry.value - last14) / 14 : 0;
  const projection30 = Math.round((lastEntry.value + dailyRate * 30) * 10) / 10;
  const sevenCutoff = new Date(lastDate); sevenCutoff.setDate(sevenCutoff.getDate() - 6);
  const last7 = sorted.filter(e => new Date(e.date) >= sevenCutoff);
  const lastTrend = last7.length ? Math.round((last7.reduce((s, e) => s + e.value, 0) / last7.length) * 10) / 10 : lastEntry.value;
  return { lastTrend, projection30, periods };
}

// ── EDAD HEXIS ──────────────────────────────────────────────────────
// Estimación motivacional que compara VO2 máx, sueño, pasos y esfuerzo
// real frente a tu edad real. NO es un dato médico ni un diagnóstico —
// es un índice de "edad funcional" pensado para motivar, calculado
// sobre tus propios datos ya trackeados en la app.
export function computeHexisAge({ age, gender, vo2max, avgSleep, avgSteps, stepsTarget, effortAvg }) {
  if (!age) return null;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  let delta = 0;
  if (vo2max) {
    const vo2Ref = gender === 'female' ? 31 : 38;
    delta += clamp(-(vo2max - vo2Ref) / 5, -6, 6);
  }
  if (avgSleep != null && avgSleep > 0) delta += clamp((7.5 - avgSleep) * 1.2, -2, 4);
  if (avgSteps != null && stepsTarget) delta += clamp((1 - avgSteps / stepsTarget) * 4, -2, 4);
  if (effortAvg != null) delta += clamp((5 - effortAvg) * 0.6, -2, 3);
  delta = Math.round(delta * 10) / 10;
  return { chronoAge: age, hexisAge: Math.round((age + delta) * 10) / 10, delta };
}

// ── SUEÑO ──────────────────────────────────────────────────────────
export function weeklySleep(sleepLog, weeks = 8) {
  const byWeek = {};
  sleepLog.forEach(s => {
    const wk = isoWeek(s.date);
    if (!byWeek[wk]) byWeek[wk] = [];
    byWeek[wk].push(s.hours);
  });
  return Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0])).slice(-weeks)
    .map(([week, vals]) => ({ week, hours: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 }));
}
