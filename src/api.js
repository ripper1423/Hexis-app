// ── LLAMADAS AL BACKEND DE HEXIS (hexis-pipeline en Render) ────────
// De momento solo se usa para el análisis de fotos con IA. El resto
// de la app habla directo con Supabase (ver storage.js) — esto es
// distinto porque la clave de la API de visión no puede vivir en el
// cliente, así que pasa por el servidor.

const PIPELINE_URL = 'https://hexis-pipeline.onrender.com';

// Convierte un File de <input type="file"> a base64 puro (sin el prefijo data:...;base64,)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || '';
      const base64 = String(result).split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// type: 'plato' | 'fisico'
// Devuelve { ok, analysis } o { ok:false, error, message }
export async function analyzePhotoRemote(file, type) {
  try {
    const imageBase64 = await fileToBase64(file);
    const mediaType = file.type || 'image/jpeg';
    const res = await fetch(`${PIPELINE_URL}/api/analyze-photo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageBase64, mediaType, type }),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { ok: false, error: 'network_error', message: 'No se pudo conectar con el servidor de análisis. Revisa tu conexión.' };
  }
}
