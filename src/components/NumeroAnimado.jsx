// ============================================================
// NumeroAnimado — Cuenta de 0 (o del valor anterior) hasta el valor nuevo
// ============================================================
// Se usa en las tarjetas de indicadores. Dura 700 ms con ease-out (arranca rápido y frena)
// y se salta la animación si el usuario pidió "reducir movimiento".
// "decimales" permite mostrar valores como 2.4 o 50.0.
import { useEffect, useRef, useState } from 'react';

const DURACION_MS = 700;

export default function NumeroAnimado({ valor, decimales = 0 }) {
  const [numero_mostrado, establecer_numero_mostrado] = useState(0);
  const ultimo_mostrado = useRef(0);

  useEffect(() => {
    const factor = 10 ** decimales;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ultimo_mostrado.current = valor;
      establecer_numero_mostrado(valor);
      return undefined;
    }

    const desde = ultimo_mostrado.current;
    const inicio = performance.now();
    let id_cuadro;

    const dar_paso = (ahora) => {
      const avance = Math.min(1, (ahora - inicio) / DURACION_MS);
      const suavizado = 1 - Math.pow(1 - avance, 4); // ease-out
      const actual = Math.round((desde + (valor - desde) * suavizado) * factor) / factor;
      ultimo_mostrado.current = actual;
      establecer_numero_mostrado(actual);
      if (avance < 1) id_cuadro = requestAnimationFrame(dar_paso);
    };
    id_cuadro = requestAnimationFrame(dar_paso);

    return () => cancelAnimationFrame(id_cuadro);
  }, [valor, decimales]);

  return <>{decimales > 0 ? numero_mostrado.toFixed(decimales) : numero_mostrado}</>;
}
