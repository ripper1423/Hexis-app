import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Conectando con Supabase...');
  const [rows, setRows] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function run() {
      const { data, error, count } = await supabase
        .from('hexispedia_fichas')
        .select('*', { count: 'exact' })
        .limit(3);

      if (error) {
        setIsError(true);
        setStatus(`Error al leer 'hexispedia_fichas': ${error.message}`);
        return;
      }

      setStatus(`Conectado. hexispedia_fichas tiene ${count ?? data.length} fila(s). Mostrando hasta 3:`);
      setRows(data);
    }
    run();
  }, []);

  return (
    <div
      style={{
        background: isError ? '#3a1414' : '#0f1f14',
        color: isError ? '#ff8080' : '#8fffb0',
        border: `1px solid ${isError ? '#ff8080' : '#8fffb0'}`,
        padding: '10px 14px',
        fontFamily: 'monospace',
        fontSize: 13,
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        whiteSpace: 'pre-wrap',
      }}
    >
      [HEXIS · TEST SUPABASE] {status}
      {rows && (
        <pre style={{ margin: '6px 0 0', fontSize: 11 }}>
          {JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </div>
  );
}
