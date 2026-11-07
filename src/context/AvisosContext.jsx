// ============================================================
// AvisosContext — Avisos emergentes (toasts)
// ============================================================
// Uso:  const { avisar } = useAvisos();   avisar('Reserva creada');   avisar('Algo falló', 'error');
// Entran desde abajo y desaparecen solos a los ~4 segundos (el estilo está en index.css).
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ContextoAvisos = createContext({ avisar: () => {} });

const MS_VISIBLE = 3800;
const MS_SALIDA = 200; // un poco más que la transición de salida (180 ms)
const MAXIMO_AVISOS = 4;

export function AvisosProvider({ children }) {
  const [avisos, establecer_avisos] = useState([]);
  const contador_ids = useRef(0);

  // Primero se marca como "saliendo" (dispara la transición) y luego se quita del DOM
  const quitar_aviso = useCallback((id_aviso) => {
    establecer_avisos((lista) => lista.map((aviso) => (aviso.id === id_aviso ? { ...aviso, saliendo: true } : aviso)));
    setTimeout(() => establecer_avisos((lista) => lista.filter((aviso) => aviso.id !== id_aviso)), MS_SALIDA);
  }, []);

  const avisar = useCallback(
    (texto, tipo = 'exito') => {
      contador_ids.current += 1;
      const id_aviso = contador_ids.current;
      establecer_avisos((lista) => [...lista.slice(-(MAXIMO_AVISOS - 1)), { id: id_aviso, texto, tipo }]);
      setTimeout(() => quitar_aviso(id_aviso), MS_VISIBLE);
    },
    [quitar_aviso]
  );

  return (
    <ContextoAvisos.Provider value={{ avisar }}>
      {children}
      <div className="contenedor_avisos" aria-live="polite">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`aviso ${aviso.tipo === 'error' ? 'aviso_error' : ''} ${aviso.saliendo ? 'saliendo' : ''}`}
            role="status"
          >
            <span>{aviso.texto}</span>
            <button onClick={() => quitar_aviso(aviso.id)} aria-label="Cerrar aviso">Cerrar</button>
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  );
}

export const useAvisos = () => useContext(ContextoAvisos);
