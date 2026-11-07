// ============================================================
// FiltrosEstadisticas — Barra de filtros de la página de estadísticas
// ============================================================
// Cada cambio avisa a la página con al_cambiar({ campo: valor }); la página vuelve a pedir los
// datos al servicio de Python con los filtros aplicados y las gráficas se reajustan.
//
// Props:
//   filtros      -> estado actual { periodo, desde, hasta, tipo, semestre, programa, categoria, estado }
//   opciones     -> valores disponibles (vienen del servicio: semestres, programas, categorías, estados)
//   al_cambiar   -> recibe un objeto con los campos que cambian
//   al_limpiar   -> restablece todo
//   hay_filtros  -> habilita el botón "Limpiar"
import Segmentado from './graficas/Segmentado';

const PERIODOS = [
  { valor: 'todo', etiqueta: 'Todo' },
  { valor: '30', etiqueta: '30 días' },
  { valor: '90', etiqueta: '90 días' },
  { valor: 'anio', etiqueta: 'Este año' },
];

export default function FiltrosEstadisticas({ filtros, opciones, al_cambiar, al_limpiar, hay_filtros, actualizando }) {
  const campo = (nombre) => (evento) => al_cambiar({ [nombre]: evento.target.value });

  return (
    <div className="barra_filtros">
      <div className="grupo_filtros">
        <div className="campo_filtro">
          <span className="etiqueta_filtro">Periodo</span>
          <Segmentado opciones={PERIODOS} valor={filtros.periodo} al_cambiar={(periodo) => al_cambiar({ periodo })} etiqueta_accesible="Periodo" />
        </div>
        <label className="campo_filtro">
          <span className="etiqueta_filtro">Desde</span>
          <input type="date" value={filtros.desde} onChange={(e) => al_cambiar({ periodo: 'personalizado', desde: e.target.value })} />
        </label>
        <label className="campo_filtro">
          <span className="etiqueta_filtro">Hasta</span>
          <input type="date" value={filtros.hasta} onChange={(e) => al_cambiar({ periodo: 'personalizado', hasta: e.target.value })} />
        </label>
      </div>

      <div className="grupo_filtros">
        <label className="campo_filtro">
          <span className="etiqueta_filtro">Tipo</span>
          <select value={filtros.tipo} onChange={campo('tipo')}>
            <option value="">Todos</option>
            <option value="Libro">Libros</option>
            <option value="Equipo">Equipos</option>
          </select>
        </label>
        <label className="campo_filtro">
          <span className="etiqueta_filtro">Semestre</span>
          <select value={filtros.semestre} onChange={campo('semestre')}>
            <option value="">Todos</option>
            {(opciones?.semestres ?? []).map((s) => (
              <option key={s} value={s}>{s === 'sin-dato' ? 'Sin dato' : `Semestre ${s}`}</option>
            ))}
          </select>
        </label>
        <label className="campo_filtro">
          <span className="etiqueta_filtro">Programa</span>
          <select value={filtros.programa} onChange={campo('programa')}>
            <option value="">Todos</option>
            {(opciones?.programas ?? []).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="campo_filtro">
          <span className="etiqueta_filtro">Categoría</span>
          <select value={filtros.categoria} onChange={campo('categoria')}>
            <option value="">Todas</option>
            {(opciones?.categorias ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="campo_filtro">
          <span className="etiqueta_filtro">Estado</span>
          <select value={filtros.estado} onChange={campo('estado')}>
            <option value="">Todos</option>
            {(opciones?.estados ?? []).map((e) => <option key={e.clave} value={e.clave}>{e.etiqueta}</option>)}
          </select>
        </label>

        <div className="campo_filtro acciones_filtros">
          <button type="button" className="boton boton_secundario boton_pequeno" onClick={al_limpiar} disabled={!hay_filtros}>
            Limpiar filtros
          </button>
          <span className={`indicador_actualizando ${actualizando ? 'visible' : ''}`} aria-live="polite">Actualizando</span>
        </div>
      </div>
    </div>
  );
}
