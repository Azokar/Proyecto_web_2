// ============================================================
// BarrasHorizontales — Ranking con barras
// ============================================================
// Cada fila: etiqueta y valor arriba, barra debajo y un detalle opcional.
// La barra se anima con transform (compositor): crece al aparecer y se reajusta cuando cambian los filtros.
//
// Props:
//   datos   -> [{ etiqueta, valor, detalle?, color? }]  (ya ordenados; 'color' de una fila reemplaza al general)
//   color   -> 'acento' | 'aviso' | 'peligro' | 'neutro'
//   formato -> función para mostrar el valor (por defecto, el número tal cual)
export default function BarrasHorizontales({ datos, color = 'acento', formato = (valor) => valor, mensaje_vacio = 'Sin datos con estos filtros.' }) {
  if (!datos || datos.length === 0) {
    return <p className="grafica_vacia">{mensaje_vacio}</p>;
  }
  const maximo = Math.max(...datos.map((dato) => dato.valor), 1);

  return (
    <ul className="barras_h">
      {datos.map((dato, posicion) => (
        <li key={dato.etiqueta} style={{ '--i': posicion }}>
          <div className="fila_texto">
            <span className="etiqueta_barra" title={dato.etiqueta}>{dato.etiqueta}</span>
            <span className="valor_barra cifra">{formato(dato.valor)}</span>
          </div>
          <div className="pista_barra" aria-hidden="true">
            <span className={`barra_relleno color_${dato.color ?? color}`} style={{ transform: `scaleX(${dato.valor / maximo})` }} />
          </div>
          {dato.detalle && <small className="detalle_barra">{dato.detalle}</small>}
        </li>
      ))}
    </ul>
  );
}
