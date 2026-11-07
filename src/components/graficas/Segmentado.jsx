// ============================================================
// Segmentado — Grupo de botones excluyentes (como pestañas pequeñas)
// ============================================================
// opciones: [{ valor, etiqueta }]   valor: opción activa   al_cambiar(valor)
export default function Segmentado({ opciones, valor, al_cambiar, etiqueta_accesible }) {
  return (
    <div className="segmentado" role="group" aria-label={etiqueta_accesible}>
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          className={opcion.valor === valor ? 'activo' : ''}
          aria-pressed={opcion.valor === valor}
          onClick={() => al_cambiar(opcion.valor)}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}
