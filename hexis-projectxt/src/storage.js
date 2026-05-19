// ── HEXIS PERSISTENCE LAYER ──────────────────────────────────────
// Manages all localStorage operations for the app

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
