// ── RESPIRACIÓN Y PREPARACIÓN AL SUEÑO ──────────────────────────────
// La app ya explicaba POR QUÉ el sueño importa para la recuperación
// (ver la tarjeta "Por qué crece en el descanso" en Entreno), pero no
// daba ningún protocolo accionable para conseguirlo. Esto lo cierra:
// una técnica de respiración real por contexto, y una rutina de higiene
// de sueño real por arquetipo, ambas con fuente citable.

// ── RESPIRACIÓN ──────────────────────────────────────────────────────
// Tres técnicas, cada una con evidencia y un uso distinto — no es "respira
// hondo", es qué respiración exacta para qué momento.
export const BREATHING_PROTOCOLS = {
  // Para estrés agudo o fatiga alta — la más rápida de las tres.
  sigh: {
    label: "Suspiro fisiológico — calma en 60-90 segundos",
    protocol: "2 inhalaciones seguidas por la nariz (la segunda corta, justo cuando los pulmones parecen llenos) y después una exhalación larga y lenta por la boca. Repite 3-5 ciclos.",
    why: "En un ensayo de Stanford que comparó esta técnica con box breathing, respiración cíclica y meditación mindfulness, el suspiro fisiológico fue el que más bajó la frecuencia respiratoria y más mejoró el estado de ánimo tras una sola sesión de 5 minutos.",
    source: "Balban, Spiegel, Huberman et al., Cell Reports Medicine (2023).",
  },
  // Para uso diario, antes de una decisión con presión, o antes de entrenar.
  box: {
    label: "Respiración en caja (box breathing) — foco y control",
    protocol: "Inhala 4 segundos, mantén 4, exhala 4, mantén 4 con los pulmones vacíos. Repite 4-6 rondas.",
    why: "Técnica usada por unidades de operaciones especiales para mantener el control bajo presión; el patrón 4-4-4-4 está asociado a mejoras en la variabilidad de la frecuencia cardiaca y a una bajada medible de la activación simpática.",
    source: "Comparada directamente contra el suspiro fisiológico en el mismo estudio de Stanford (2023) — más lenta, pero muy útil cuando necesitas foco, no solo calma.",
  },
  // Para la preparación al sueño — exhalación más larga que la inhalación.
  wind: {
    label: "Respiración de exhalación larga — antes de dormir",
    protocol: "Inhala por la nariz contando 4, exhala por la nariz o la boca contando 6-8 (el doble de larga que la inhalación). Repite 6-10 rondas, a oscuras, ya en la cama.",
    why: "Alargar la exhalación activa el sistema nervioso parasimpático (el de \"descansar y digerir\") y baja la frecuencia cardiaca de forma medible — es la base fisiológica de casi todas las técnicas de respiración para dormir, incluida la popular 4-7-8.",
    source: "Mecanismo de coherencia cardiaca / respiración lenta, consenso en fisiología autonómica.",
  },
};

// ── PREPARACIÓN AL SUEÑO ─────────────────────────────────────────────
// Checklist real (no genérico) basado en guías de higiene de sueño de
// CDC / AASM, con la voz de cada arquetipo. Los números (temperatura,
// corte de cafeína, corte de pantallas) son los mismos para todos porque
// son fisiología, no personalidad — lo que cambia es el tono al pedirlo.
const SLEEP_HYGIENE_BASE = [
  "Corta la cafeína 6-8h antes de dormir — sigue bajando tu sueño profundo aunque ya no notes el efecto.",
  "Última pantalla (móvil, portátil, TV) al menos 30-60 min antes de apagar la luz.",
  "Habitación fresca, entre 17-19°C, y a oscuras — la temperatura baja es la señal que el cuerpo asocia con dormir.",
  "Hora de acostarte parecida cada noche, incluso el fin de semana — el reloj biológico premia la constancia más que la cantidad de horas sueltas.",
];

export const SLEEP_PREP = {
  ALPHA: {
    intro: "Construyes de noche, no solo en el gimnasio. Si el entreno rompe fibra, el sueño la reconstruye — saltarte esto es entrenar con un freno puesto.",
    checklist: SLEEP_HYGIENE_BASE,
    breathing: "wind",
  },
  HERA: {
    intro: "En déficit, dormir mal es la forma más rápida de perder el control del apetito al día siguiente. Esto no es opcional, es parte del plan.",
    checklist: SLEEP_HYGIENE_BASE,
    breathing: "wind",
  },
  ZEN: {
    intro: "El descanso no es la ausencia de entreno. Es la otra mitad del sistema. Dale al cuerpo el mismo cuidado que le das a la calma que buscas de día.",
    checklist: SLEEP_HYGIENE_BASE,
    breathing: "wind",
  },
  SHAPE: {
    intro: "La recomposición pasa tanto por la noche como por el gimnasio: sin sueño suficiente, se pierde músculo más rápido y se retiene grasa con más facilidad.",
    checklist: SLEEP_HYGIENE_BASE,
    breathing: "wind",
  },
  ATENEA: {
    intro: "Dormir bien es la palanca de eficiencia con más retorno que existe: cuesta cero minutos extra de gimnasio y mejora todo lo demás.",
    checklist: SLEEP_HYGIENE_BASE,
    breathing: "wind",
  },
  GAIA: {
    intro: "Escuchar el cuerpo también es esto: dejar que se apague cuando toca, sin exigirle rendir hasta el último minuto del día.",
    checklist: SLEEP_HYGIENE_BASE,
    breathing: "wind",
  },
};
