// ============================================================
// Columnas — Gráfica de columnas (simple o apilada) con detalle al pasar el cursor
// ============================================================
// Props:
//   datos  -> [{ etiqueta, valores: [n1, n2, ...], detalle?: ['línea 1', 'línea 2'] }]
//   series -> [{ etiqueta, color }]  una por cada valor de "valores" (color: 'acento' | 'neutro' | ...)
//   formato-> cómo se escribe un valor en el eje
//
// Cada pila se anima con scaleY desde la base: solo transform, así no hay reflow por cuadro.
// Dentro de la pila, cada segmento ocupa su parte proporcional (flex-grow), por eso al escalar
// la pila entera la altura total queda exacta.
import { useState } from 'react';

// Techo del eje con un valor "redondo" y par (así la línea de la mitad cae en un entero):
// hasta 10 sube de 2 en 2; después usa 20, 50, 100, 200, 500…
function techo_redondo(maximo) {
  if (maximo <= 10) return Math.max(2, Math.ceil(maximo / 2) * 2);
  const potencia = 10 ** Math.floor(Math.log10(maximo));
  const mantisa = maximo / potencia;
  const paso = mantisa <= 2 ? 2 : mantisa <= 5 ? 5 : 10;
  return paso * potencia;
}

export default function Columnas({ datos, series, formato = (valor) => valor, alto = 200, mensaje_vacio = 'Sin datos con estos filtros.' }) {
  const [activa, establecer_activa] = useState(null);

  if (!datos || datos.length === 0 || datos.every((dato) => dato.valores.every((valor) => valor === 0))) {
    return <p className="grafica_vacia">{mensaje_vacio}</p>;
  }

  const totales = datos.map((dato) => dato.valores.reduce((suma, valor) => suma + valor, 0));
  const techo_final = techo_redondo(Math.max(...totales, 1));
  const paso_etiquetas = Math.ceil(datos.length / 12);
  const lineas = [1, 0.5, 0];

  return (
    <div className="columnas">
      <div className="area_columnas" style={{ height: alto }}>
        {lineas.map((fraccion) => (
          <div key={fraccion} className="linea_guia" style={{ bottom: `${fraccion * 100}%` }}>
            <span>{formato(Math.round(techo_final * fraccion * 10) / 10)}</span>
          </div>
        ))}

        <div className="pistas_columnas" onMouseLeave={() => establecer_activa(null)}>
          {datos.map((dato, posicion) => {
            const total = totales[posicion];
            const lado = posicion < datos.length * 0.2 ? 'izquierda' : posicion > datos.length * 0.8 ? 'derecha' : '';
            return (
              <div
                key={dato.etiqueta}
                className={`pista_columna ${activa === posicion ? 'activa' : ''}`}
                onMouseEnter={() => establecer_activa(posicion)}
                onFocus={() => establecer_activa(posicion)}
                onBlur={() => establecer_activa(null)}
                tabIndex={0}
                role="img"
                aria-label={`${dato.etiqueta}: ${total}`}
              >
                <div
                  className="pila"
                  style={{ transform: `scaleY(${total / techo_final})`, '--i': Math.min(posicion, 20) }}
                >
                  {dato.valores.map((valor, indice) =>
                    valor > 0 ? (
                      <span key={indice} className={`segmento color_${series[indice].color}`} style={{ flexGrow: valor }} />
                    ) : null
                  )}
                </div>

                {activa === posicion && (
                  <div className={`globo ${lado}`} role="tooltip" style={{ bottom: `calc(${(total / techo_final) * 100}% + 8px)` }}>
                    <strong>{dato.etiqueta}</strong>
                    {dato.detalle
                      ? dato.detalle.map((linea) => <span key={linea}>{linea}</span>)
                      : series.map((serie, indice) => (
                          <span key={serie.etiqueta}>{serie.etiqueta}: {dato.valores[indice]}</span>
                        ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="etiquetas_columnas">
        {datos.map((dato, posicion) => (
          <span key={dato.etiqueta} className={posicion % paso_etiquetas === 0 ? '' : 'oculta'}>{dato.etiqueta}</span>
        ))}
      </div>

      {series.length > 1 && (
        <div className="leyenda">
          {series.map((serie) => (
            <span key={serie.etiqueta}><i className={`color_${serie.color}`} />{serie.etiqueta}</span>
          ))}
        </div>
      )}
    </div>
  );
}
