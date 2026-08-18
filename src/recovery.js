// ── RECOVERY INTEGRADO ─────────────────────────────────────────────
// Cruza fatiga real (ACWR: carga aguda vs. crónica, de adaptive.js)
// y sueño real para recomendar si hoy toca entrenar a tope, moderar
// la sesión, o priorizar descanso. No es un mensaje genérico: cada
// arquetipo tiene su propia regla y su propio tono, coherente con su
// identidad (ALPHA no habla como ZEN, aunque el dato sea el mismo).

const TONE = {
  ALPHA: {
    high: "Tu cuerpo está construyendo bajo mucha carga acumulada. Hoy prioriza dormir 8h y la proteína — no bajes el peso, baja el volumen si hace falta.",
    ok:   "Recuperación en rango. Sigue construyendo con la misma constancia, sin prisa ni pausa.",
    low:  "Estás descargado, tienes margen real. Buen momento para empujar un poco más fuerte esta semana.",
  },
  HERA: {
    high: "En déficit, la fatiga acumulada pesa más de lo normal. Hoy toca cardio suave o descanso, no forzar — el músculo se preserva descansando, no solo entrenando.",
    ok:   "Recuperación en rango pese al déficit. Tu cuerpo está gestionando bien la carga.",
    low:  "Tienes margen de sobra. Es un buen día para un entreno algo más exigente.",
  },
  ZEN: {
    high: "Tu cuerpo te está pidiendo parar, no negociar. Hoy mejor movilidad suave o descanso total — el equilibrio no es debilidad.",
    ok:   "Cuerpo y mente en equilibrio. Sigue con tu ritmo, sin buscar más de lo que hoy toca.",
    low:  "Tienes energía de sobra. Puedes permitirte un entreno algo más intenso si te apetece.",
  },
  SHAPE: {
    high: "Recomposición + fatiga alta es la combinación que más rompe la constancia. Hoy modera: menos series, misma técnica, y prioriza dormir.",
    ok:   "Fuerza y cardio en equilibrio. La recomposición avanza porque el sistema es constante, no porque fuerces hoy.",
    low:  "Tienes margen. Es buen momento para el día de potencia o el cardio más exigente de la semana.",
  },
  ATENEA: {
    high: "La eficiencia también significa saber cuándo no entrenar. Hoy un bloque de 30 min suave rinde más que forzar uno pesado sin recuperar.",
    ok:   "Recuperación en rango. Tu sistema está funcionando como debe — sigue con los bloques planeados.",
    low:  "Margen de sobra. Aprovecha hoy para el bloque más pesado de la semana.",
  },
  GAIA: {
    high: "Tu cuerpo pide sostén, no exigencia. Hoy mejor caminar sin prisa o descanso real — escucharlo es el sistema, no una excepción a él.",
    ok:   "Cuerpo y ritmo en calma. Sigue como hoy toca, sin comparar con nada ni nadie.",
    low:  "Tienes energía disponible. Puedes moverte un poco más hoy si el cuerpo lo pide.",
  },
};

const LABEL = { high: "Prioriza recuperación", ok: "Recuperación en rango", low: "Margen para más carga" };
const COLOR = { high: "#c86a6a", ok: "#C8AA50", low: "#8BA4A0" };

// fatigueRatioValue: número del ACWR (o null si no hay datos suficientes)
// avgSleep: media de horas de sueño de los últimos días (o 0 si no hay datos)
export function getRecoveryStatus(archetype, fatigueRatioValue, avgSleep) {
  let level = 'ok';
  if (fatigueRatioValue != null && fatigueRatioValue > 1.3) level = 'high';
  else if (fatigueRatioValue != null && fatigueRatioValue < 0.8) level = 'low';
  // El sueño pobre puede disparar el aviso de recuperación aunque la fatiga
  // de entreno esté en rango — la recuperación no es solo carga de trabajo.
  if (avgSleep && avgSleep > 0 && avgSleep < 6 && level !== 'high') level = 'high';

  const tones = TONE[archetype] || TONE.ALPHA;
  return {
    level,
    label: LABEL[level],
    color: COLOR[level],
    message: tones[level],
    hasData: fatigueRatioValue != null || (avgSleep && avgSleep > 0),
  };
}
