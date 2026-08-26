// ── HEXIS PERSISTENCE LAYER ──────────────────────────────────────
// Manages all localStorage operations for the app

import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  PROFILE:    'hexis_profile',
  PLAN:       'hexis_plan',
  USERDATA:   'hexis_userdata',
  HABITS:     'hexis_habits',      // { date: 'YYYY-MM-DD', done: [bool,...] }
  EXERCISES:  'hexis_exercises',   // { date: 'YYYY-MM-DD', done: [bool,...] }
  WATER:      'hexis_water',       // { date: 'YYYY-MM-DD', count: n }
  WEIGHT_LOG: 'hexis_weight_log',  // [ { date, value } ]
  STREAK:     'hexis_streak',      // { current, best, lastDate }
  HABIT_LOG:  'hexis_habit_log',   // { 'YYYY-MM-DD': bool } — did any habit that day?
  SET_LOGS:   'hexis_set_logs',    // [ { date, exercise, profile, weight, reps, sets, rir } ] — historial real
  VO2_LOG:    'hexis_vo2_log',     // [ { date, distance, vo2max } ] — test de Cooper
  STEPS_LOG:  'hexis_steps_log',   // [ { date, steps } ] — NEAT diario
  SLEEP_LOG:  'hexis_sleep_log',   // [ { date, hours } ] — sueño diario
  CYCLE:      'hexis_cycle',       // { id, startDate } — ciclo activo (Arquitectura de Dominio)
  MIRROR_LOG: 'hexis_mirror_log',  // [ { date, note, score, label } ] — Espejo de Coherencia
  FOOD_LOG:   'hexis_food_log',    // [ { id, date, category, name, kcal, prot, carbs, fat, qty, source } ] — registro real diario de alimentos
  MEASURE_LOG: 'hexis_measure_log', // [ { date, type, value } ] — medidas corporales (cintura, pecho, brazo, muslo, cadera) en cm
};

function today() {
  return new Date().toISOString().split('T')[0];
}

export function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, profile);
}
export function loadProfile() {
  return localStorage.getItem(STORAGE_KEYS.PROFILE);
}

export function savePlan(plan) {
  localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
}
export function loadPlan() {
  const p = localStorage.getItem(STORAGE_KEYS.PLAN);
  return p ? JSON.parse(p) : null;
}

export function saveUserData(ud) {
  localStorage.setItem(STORAGE_KEYS.USERDATA, JSON.stringify(ud));
}
export function loadUserData() {
  const u = localStorage.getItem(STORAGE_KEYS.USERDATA);
  return u ? JSON.parse(u) : null;
}

// ── HABITS ─────────────────────────────────────────────────────
export function saveHabits(done) {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify({ date: today(), done }));
}
export function loadHabits(count) {
  const h = localStorage.getItem(STORAGE_KEYS.HABITS);
  if (!h) return Array(count).fill(false);
  const { date, done } = JSON.parse(h);
  if (date !== today()) return Array(count).fill(false); // new day
  return done;
}

// ── EXERCISES ──────────────────────────────────────────────────
export function saveExercises(done) {
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify({ date: today(), done }));
}
export function loadExercises(count) {
  const e = localStorage.getItem(STORAGE_KEYS.EXERCISES);
  if (!e) return Array(count).fill(false);
  const { date, done } = JSON.parse(e);
  if (date !== today()) return Array(count).fill(false);
  return done;
}

// ── WATER ──────────────────────────────────────────────────────
export function saveWater(count) {
  localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify({ date: today(), count }));
}
export function loadWater() {
  const w = localStorage.getItem(STORAGE_KEYS.WATER);
  if (!w) return 0;
  const { date, count } = JSON.parse(w);
  return date === today() ? count : 0;
}

// ── WEIGHT LOG ─────────────────────────────────────────────────
export function saveWeight(value) {
  const log = loadWeightLog();
  const t = today();
  const existing = log.findIndex(e => e.date === t);
  if (existing >= 0) log[existing].value = value;
  else log.push({ date: t, value });
  // Keep last 30 days
  const sorted = log.sort((a,b) => a.date.localeCompare(b.date)).slice(-30);
  localStorage.setItem(STORAGE_KEYS.WEIGHT_LOG, JSON.stringify(sorted));
  return sorted;
}
export function loadWeightLog() {
  const w = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOG);
  return w ? JSON.parse(w) : [];
}

// Peso objetivo — se guarda dentro de los datos del usuario, no necesita
// su propia clave. null = sin meta definida.
export function saveGoalWeight(value) {
  const ud = loadUserData() || {};
  ud.goalWeight = value;
  saveUserData(ud);
  return value;
}
export function loadGoalWeight() {
  const ud = loadUserData();
  return ud && ud.goalWeight ? ud.goalWeight : null;
}

// ── PASOS DIARIOS (NEAT) ───────────────────────────────────────────
export function saveSteps(steps) {
  const log = loadStepsLog();
  const t = today();
  const existing = log.findIndex(e => e.date === t);
  if (existing >= 0) log[existing].steps = steps;
  else log.push({ date: t, steps });
  const sorted = log.sort((a,b) => a.date.localeCompare(b.date)).slice(-30);
  localStorage.setItem(STORAGE_KEYS.STEPS_LOG, JSON.stringify(sorted));
  return sorted;
}
export function loadStepsLog() {
  const s = localStorage.getItem(STORAGE_KEYS.STEPS_LOG);
  return s ? JSON.parse(s) : [];
}

// ── SUEÑO ──────────────────────────────────────────────────────────
export function saveSleep(hours) {
  const log = loadSleepLog();
  const t = today();
  const existing = log.findIndex(e => e.date === t);
  if (existing >= 0) log[existing].hours = hours;
  else log.push({ date: t, hours });
  const sorted = log.sort((a,b) => a.date.localeCompare(b.date)).slice(-30);
  localStorage.setItem(STORAGE_KEYS.SLEEP_LOG, JSON.stringify(sorted));
  return sorted;
}
export function loadSleepLog() {
  const s = localStorage.getItem(STORAGE_KEYS.SLEEP_LOG);
  return s ? JSON.parse(s) : [];
}
// ── CICLO ACTIVO (Arquitectura de Dominio) ──────────────────────────
export function saveCycle(cycleId) {
  const data = { id: cycleId, startDate: today() };
  localStorage.setItem(STORAGE_KEYS.CYCLE, JSON.stringify(data));
  return data;
}
export function loadCycle() {
  const c = localStorage.getItem(STORAGE_KEYS.CYCLE);
  return c ? JSON.parse(c) : null;
}
export function clearCycle() {
  localStorage.removeItem(STORAGE_KEYS.CYCLE);
}

// ── ESPEJO DE COHERENCIA — cierre diario opcional ───────────────────
// Nunca obligatorio: el usuario abre la pantalla si quiere, y puede
// guardar sin escribir nada (solo queda el score del día).
export function saveMirrorEntry(entry) {
  const log = loadMirrorLog();
  const idx = log.findIndex(e => e.date === entry.date);
  if (idx >= 0) log[idx] = entry; else log.push(entry);
  const sorted = log.sort((a, b) => a.date.localeCompare(b.date)).slice(-60);
  localStorage.setItem(STORAGE_KEYS.MIRROR_LOG, JSON.stringify(sorted));
  return sorted;
}
export function loadMirrorLog() {
  const m = localStorage.getItem(STORAGE_KEYS.MIRROR_LOG);
  return m ? JSON.parse(m) : [];
}
export function hasClosedToday() {
  return loadMirrorLog().some(e => e.date === today());
}

export async function logWellnessToCloud(userId, { steps, sleepHours }) {
  if (!userId) return;
  try {
    const row = { user_id: userId, log_date: today() };
    if (steps !== undefined && steps !== null) row.steps = Math.round(steps);
    if (sleepHours !== undefined && sleepHours !== null) row.sleep_hours = sleepHours;
    await supabase.from('wellness_logs').insert(row);
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo registrar el bienestar', e.message);
  }
}

// ── SET LOGS (rendimiento real por ejercicio) ─────────────────────
// Un registro por ejercicio y día. Es la base del motor adaptativo
// y de las gráficas de tensión mecánica y esfuerzo.
export function saveSetLog(entry) {
  const log = loadSetLogs();
  const idx = log.findIndex(e => e.date === entry.date && e.exercise === entry.exercise);
  if (idx >= 0) log[idx] = entry; else log.push(entry);
  const sorted = log.sort((a,b) => a.date.localeCompare(b.date)).slice(-500);
  localStorage.setItem(STORAGE_KEYS.SET_LOGS, JSON.stringify(sorted));
  return sorted;
}
export function loadSetLogs() {
  const l = localStorage.getItem(STORAGE_KEYS.SET_LOGS);
  return l ? JSON.parse(l) : [];
}
export function removeSetLog(exerciseName, date = today()) {
  const log = loadSetLogs().filter(e => !(e.date === date && e.exercise === exerciseName));
  localStorage.setItem(STORAGE_KEYS.SET_LOGS, JSON.stringify(log));
  return log;
}

// ── REGISTRO DIARIO DE ALIMENTOS (registro real, no el plan fijo) ─
// Cada vez que el usuario añade un alimento (manual o por código de
// barras) se guarda aquí, con fecha, categoría y macros reales.
export function saveFoodLogEntry(entry) {
  const log = loadFoodLog();
  const withId = { id: entry.id || (Date.now() + '_' + Math.random().toString(36).slice(2)), date: entry.date || today(), ...entry };
  log.push(withId);
  const sorted = log.sort((a,b) => a.date.localeCompare(b.date)).slice(-2000);
  localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify(sorted));
  return sorted;
}
export function loadFoodLog() {
  const l = localStorage.getItem(STORAGE_KEYS.FOOD_LOG);
  return l ? JSON.parse(l) : [];
}
export function removeFoodLogEntry(id) {
  const log = loadFoodLog().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify(log));
  return log;
}

// ── VO2 MÁX (test de Cooper) ──────────────────────────────────────
export function saveVo2Test(distanceMeters) {
  const vo2max = Math.round(((distanceMeters - 504.9) / 44.73) * 10) / 10;
  const log = loadVo2Log();
  log.push({ date: today(), distance: distanceMeters, vo2max });
  const sorted = log.sort((a,b) => a.date.localeCompare(b.date)).slice(-20);
  localStorage.setItem(STORAGE_KEYS.VO2_LOG, JSON.stringify(sorted));
  return sorted;
}
export function loadVo2Log() {
  const v = localStorage.getItem(STORAGE_KEYS.VO2_LOG);
  return v ? JSON.parse(v) : [];
}
export async function logVo2ToCloud(userId, vo2max) {
  if (!userId) return;
  try {
    await supabase.from('body_metrics').insert({ user_id: userId, log_date: today(), vo2max });
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo registrar el VO2max', e.message);
  }
}

// ── STREAK ─────────────────────────────────────────────────────
export function updateStreak(habitsDone) {
  const raw = localStorage.getItem(STORAGE_KEYS.HABIT_LOG);
  const log = raw ? JSON.parse(raw) : {};
  const t = today();
  
  // Mark today
  if (habitsDone > 0) log[t] = true;
  
  // Calculate streak
  let streak = 0;
  let d = new Date();
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (log[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // Allow today to be incomplete (don't break streak for today)
      if (key === t) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  
  const streakData = localStorage.getItem(STORAGE_KEYS.STREAK);
  const current = streakData ? JSON.parse(streakData) : { current: 0, best: 0 };
  const best = Math.max(streak, current.best);
  const result = { current: streak, best };
  
  localStorage.setItem(STORAGE_KEYS.HABIT_LOG, JSON.stringify(log));
  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(result));
  return result;
}

export function loadStreak() {
  const s = localStorage.getItem(STORAGE_KEYS.STREAK);
  return s ? JSON.parse(s) : { current: 0, best: 0 };
}

export function clearAll() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

// ── SINCRONIZACIÓN CON SUPABASE (NUBE) ────────────────────────────
// Todo esto es "best-effort": si no hay internet o algo falla, nunca
// rompe la app ni bloquea al usuario — localStorage sigue mandando
// para que la interfaz sea instantánea, esto solo respalda en la nube.

export async function ensureCloudSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    let uid = null;
    let email = null;
    if (session) {
      uid = session.user.id;
      email = session.user.email || null;
    } else {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) { console.warn('HEXIS cloud: no se pudo crear sesión', error.message); return null; }
      uid = data.user.id;
    }
    // Auto-relleno best-effort: si la sesión ya tiene un email verificado
    // (cuenta vinculada) pero el perfil en la nube todavía no lo tiene
    // guardado, lo escribe aquí. No bloquea nada si falla o la fila aún
    // no existe (se creará con el email la próxima vez que haya sesión).
    if (uid && email) {
      supabase.from('user_profiles').update({ email }).eq('id', uid).then(() => {}, () => {});
    }
    return uid;
  } catch (e) {
    console.warn('HEXIS cloud: sin conexión', e.message);
    return null;
  }
}

// ── IDENTIDAD PERSISTENTE POR EMAIL ────────────────────────────────
// signInAnonymously() crea una identidad nueva por dispositivo: si el
// usuario cambia de móvil, borra datos del navegador o reinstala, pierde
// el acceso a su user_id de siempre y todo lo que había en la nube queda
// huérfano. Esto lo resuelve vinculando esa sesión anónima a un email
// real (sin contraseña, sin fricción) para poder recuperarla desde
// cualquier dispositivo más adelante.

export async function getAccountStatus() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { linked: false, email: null };
    return { linked: !user.is_anonymous && !!user.email, email: user.email || null };
  } catch (e) {
    return { linked: false, email: null };
  }
}

// Vincula la sesión anónima actual (con todo su historial) a un email real.
// Supabase manda un enlace de confirmación; al pulsarlo desde cualquier
// navegador, esa misma sesión pasa a ser permanente — mismo user_id, no se
// pierde nada de lo ya guardado.
export async function linkEmailToAccount(email) {
  try {
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: window.location.origin }
    );
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'unknown' };
  }
}

// Para un móvil nuevo: manda un enlace de acceso a un email ya vinculado
// antes. Al pulsarlo entra en la MISMA cuenta permanente (mismo user_id
// que en el dispositivo original), no crea una anónima nueva.
export async function restoreAccountByEmail(email) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'unknown' };
  }
}

// Lee el perfil real guardado en Supabase para reconstruir localmente el
// arquetipo/plan de un usuario que acaba de restaurar sesión en un móvil
// nuevo (sin pasar otra vez por el test de onboarding).
export async function fetchCloudProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('full_name,archetype,gender,age,weight_kg,height_cm,activity_level')
      .eq('id', userId)
      .single();
    if (error) throw error;
    if (!data || !data.archetype) return null;
    return {
      archetype: data.archetype,
      userData: {
        name: data.full_name || '',
        age: data.age != null ? String(data.age) : '',
        weight: data.weight_kg != null ? String(data.weight_kg) : '',
        height: data.height_cm != null ? String(data.height_cm) : '',
        gender: data.gender || '',
        activity: data.activity_level != null ? String(data.activity_level) : '',
      },
    };
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo leer el perfil', e.message);
    return null;
  }
}

// Trae el historial real (peso, VO2max, pasos, sueño) para que las
// gráficas de Métricas no aparezcan vacías tras restaurar en un móvil
// nuevo. Best-effort: si algo falla, devuelve arrays vacíos y la app
// sigue funcionando con lo que haya localmente.
export async function fetchCloudHistory(userId) {
  const empty = { weightLog: [], vo2Log: [], stepsLog: [], sleepLog: [] };
  if (!userId) return empty;
  try {
    const [bodyRes, wellnessRes] = await Promise.all([
      supabase.from('body_metrics').select('log_date,weight_kg,vo2max').eq('user_id', userId).order('log_date', { ascending: true }),
      supabase.from('wellness_logs').select('log_date,steps,sleep_hours').eq('user_id', userId).order('log_date', { ascending: true }),
    ]);
    const weightLog = (bodyRes.data || []).filter(r => r.weight_kg != null).map(r => ({ date: r.log_date, value: r.weight_kg }));
    const vo2Log = (bodyRes.data || []).filter(r => r.vo2max != null).map(r => ({ date: r.log_date, distance: null, vo2max: r.vo2max }));
    const stepsLog = (wellnessRes.data || []).filter(r => r.steps != null).map(r => ({ date: r.log_date, steps: r.steps }));
    const sleepLog = (wellnessRes.data || []).filter(r => r.sleep_hours != null).map(r => ({ date: r.log_date, hours: r.sleep_hours }));
    return { weightLog, vo2Log, stepsLog, sleepLog };
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo leer el historial', e.message);
    return empty;
  }
}

// Escribe directamente en localStorage el historial recuperado de la nube
// (bypassa los setters normales de "un registro por día" porque aquí llega
// el array completo de golpe, no una entrada nueva).
export function restoreLocalLogs({ weightLog, vo2Log, stepsLog, sleepLog }) {
  if (weightLog && weightLog.length) localStorage.setItem(STORAGE_KEYS.WEIGHT_LOG, JSON.stringify(weightLog.slice(-30)));
  if (vo2Log && vo2Log.length) localStorage.setItem(STORAGE_KEYS.VO2_LOG, JSON.stringify(vo2Log.slice(-20)));
  if (stepsLog && stepsLog.length) localStorage.setItem(STORAGE_KEYS.STEPS_LOG, JSON.stringify(stepsLog.slice(-30)));
  if (sleepLog && sleepLog.length) localStorage.setItem(STORAGE_KEYS.SLEEP_LOG, JSON.stringify(sleepLog.slice(-30)));
}

export async function syncProfileToCloud(userId, { name, archetype, gender, age, weight, height, activity }) {
  if (!userId) return;
  try {
    await supabase.from('user_profiles').upsert({
      id: userId,
      full_name: name || null,
      archetype: archetype || null,
      gender: gender || null,
      age: age ? parseInt(age) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      height_cm: height ? parseFloat(height) : null,
      activity_level: activity ? parseFloat(activity) : null,
    });
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo sincronizar el perfil', e.message);
  }
}

export async function logExerciseToCloud(userId, { name, weight, reps, sets, rir }) {
  if (!userId) return;
  try {
    await supabase.from('exercise_logs').insert({
      user_id: userId,
      exercise_name: name,
      weight_kg: weight || 0,
      reps: parseInt(reps) || 0,
      sets: parseInt(sets) || 0,
      rir: rir !== undefined && rir !== null && rir !== '' ? parseInt(rir) : null,
    });
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo registrar el ejercicio', e.message);
  }
}

export async function logWeightToCloud(userId, weightKg) {
  if (!userId) return;
  try {
    await supabase.from('body_metrics').insert({
      user_id: userId,
      log_date: today(),
      weight_kg: weightKg,
    });
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo registrar el peso', e.message);
  }
}

// ── HEXIS PRO — nivel de suscripción y canje de código ────────────
export async function fetchSubscriptionTier(userId) {
  if (!userId) return 'start';
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return (data && data.subscription_tier) || 'start';
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo leer el nivel de suscripción', e.message);
    return 'start';
  }
}

// Devuelve { ok: true } o { ok: false, error: 'invalid_code' | 'already_used' | 'no_session' }
export async function redeemProCode(code) {
  try {
    const { data, error } = await supabase.rpc('redeem_pro_code', { code_input: code });
    if (error) throw error;
    return data || { ok: false, error: 'unknown' };
  } catch (e) {
    return { ok: false, error: e.message || 'unknown' };
  }
}

// ── FOTOS DE PROGRESO (Antes/Después) — HEXIS START ────────────────
// Bucket privado 'progress-photos' en Supabase Storage, ruta
// {user_id}/{timestamp}_{tipo}.{ext}. Nadie más puede leer las fotos
// de otro usuario (RLS a nivel de storage.objects, ver migración
// create_progress_photos_bucket). Metadatos (tipo, feedback, peso,
// fecha) van en la tabla progress_photos.

// type: 'antes' | 'despues'. Devuelve { ok, photo } o { ok:false, error }
export async function uploadProgressPhoto(userId, file, { type, feedback, weightKg } = {}) {
  if (!userId || !file) return { ok: false, error: 'missing_data' };
  try {
    const ext = (file.name && file.name.split('.').pop()) || 'jpg';
    const path = `${userId}/${Date.now()}_${type}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
    if (uploadError) throw uploadError;

    const row = {
      user_id: userId,
      photo_type: type === 'despues' ? 'despues' : 'antes',
      storage_path: path,
      feedback: feedback || null,
      weight_kg: weightKg || null,
    };
    const { data, error: insertError } = await supabase
      .from('progress_photos')
      .insert(row)
      .select()
      .single();
    if (insertError) throw insertError;

    return { ok: true, photo: data };
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo subir la foto de progreso', e.message);
    return { ok: false, error: e.message || 'unknown' };
  }
}

// Devuelve la lista de fotos del usuario, con una URL firmada (1h) por foto lista para <img>
export async function fetchProgressPhotos(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: true });
    if (error) throw error;
    if (!data || !data.length) return [];

    const withUrls = await Promise.all(data.map(async (row) => {
      const { data: signed } = await supabase.storage
        .from('progress-photos')
        .createSignedUrl(row.storage_path, 3600);
      return { ...row, url: signed ? signed.signedUrl : null };
    }));
    return withUrls;
  } catch (e) {
    console.warn('HEXIS cloud: no se pudieron cargar las fotos de progreso', e.message);
    return [];
  }
}

export async function deleteProgressPhoto(photoId, storagePath) {
  try {
    await supabase.storage.from('progress-photos').remove([storagePath]);
    const { error } = await supabase.from('progress_photos').delete().eq('id', photoId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.warn('HEXIS cloud: no se pudo borrar la foto de progreso', e.message);
    return { ok: false, error: e.message || 'unknown' };
  }
}


// ── MEDIDAS CORPORALES (evolución a largo plazo) ────────────────────
// Un registro por tipo de medida y fecha (cintura, pecho, brazo, muslo,
// cadera, en cm) — igual que el peso, pero para el resto del cuerpo.
export function saveMeasurement(entry) {
  const log = loadMeasurementLog();
  const idx = log.findIndex(e => e.date === entry.date && e.type === entry.type);
  if (idx >= 0) log[idx] = entry; else log.push(entry);
  const sorted = log.sort((a,b) => a.date.localeCompare(b.date)).slice(-2000);
  localStorage.setItem(STORAGE_KEYS.MEASURE_LOG, JSON.stringify(sorted));
  return sorted;
}
export function loadMeasurementLog() {
  const l = localStorage.getItem(STORAGE_KEYS.MEASURE_LOG);
  return l ? JSON.parse(l) : [];
}
