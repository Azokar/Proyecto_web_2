// ============================================================
// PanelGrafica — Marco común de cada gráfica
// ============================================================
// Título, descripción corta, un espacio opcional a la derecha (por ejemplo un selector)
// y el contenido de la gráfica debajo.
export default function PanelGrafica({ titulo, descripcion, acciones = null, ancho_completo = false, children }) {
  return (
    <section className={`panel_grafica ${ancho_completo ? 'panel_ancho' : ''}`}>
      <header className="cabecera_panel">
        <div>
          <h2>{titulo}</h2>
          {descripcion && <p>{descripcion}</p>}
        </div>
        {acciones}
      </header>
      {children}
    </section>
  );
}
