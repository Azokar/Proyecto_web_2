// ============================================================
// Página: Estadísticas (ADMIN)
// ============================================================
// Los datos los calcula el microservicio de Python (pandas) con las reservas reales de la API;
// aquí solo se dibujan. Cada vez que cambia un filtro se vuelve a pedir /analitica con ese filtro,
// así las gráficas siempre responden a lo que el administrador quiere mirar.
import { useEffect, useState } from 'react';
import useTituloPagina from '../hooks/useTituloPagina';
import { GRAFICAS_URL } from '../config';
import { leer_sesion } from '../services/api';
import NumeroAnimado from '../components/NumeroAnimado';
import FiltrosEstadisticas from '../components/FiltrosEstadisticas';
import PanelGrafica from '../components/graficas/PanelGrafica';
import BarrasHorizontales from '../components/graficas/BarrasHorizontales';
import Columnas from '../components/graficas/Columnas';
import Segmentado from '../components/graficas/Segmentado';

const FILTROS_INICIALES = { periodo: 'todo', desde: '', hasta: '', tipo: '', semestre: '', programa: '', categoria: '', estado: '' };

const dos = (n) => String(n).padStart(2, '0');
// Fecha local AAAA-MM-DD (toISOString usaría UTC y podría correrse un día)
const a_texto_fecha = (fecha) => `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;

// Un periodo rápido se traduce a una fecha "desde"; "hasta" queda libre
function desde_del_periodo(periodo) {
  const hoy = new Date();
  if (periodo === '30' || periodo === '90') {
    hoy.setDate(hoy.getDate() - (Number(periodo) - 1));
    return a_texto_fecha(hoy);
  }
  if (periodo === 'anio') return `${hoy.getFullYear()}-01-01`;
  return '';
}

// Retrasos de menos de un día se muestran en horas (un equipo se presta por horas)
function formatear_retraso(dias) {
  if (dias === null || dias === undefined) return '—';
  return dias < 1 ? `${Math.max(1, Math.round(dias * 24))} h` : `${dias} d`;
}

const COLOR_ESTADO = { ACTIVA: 'acento', DEVUELTO: 'neutro', VENCIDO: 'peligro', CANCELADA: 'suave' };

export default function StatsPage() {
  useTituloPagina('Estadísticas');
  const [filtros, establecer_filtros] = useState(FILTROS_INICIALES);
  const [granularidad, establecer_granularidad] = useState('mes');
  const [metrica_semestre, establecer_metrica_semestre] = useState('total');
  const [datos, establecer_datos] = useState(null);
  const [actualizando, establecer_actualizando] = useState(true);
  const [mensaje_error, establecer_mensaje_error] = useState('');
  const [version, establecer_version] = useState(0); // el botón "Actualizar" la incrementa

  const hay_filtros = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES);

  const cambiar_filtros = (cambios) => {
    establecer_filtros((anteriores) => {
      const nuevos = { ...anteriores, ...cambios };
      // Elegir un periodo rápido reescribe las fechas
      if (cambios.periodo && cambios.periodo !== 'personalizado') {
        nuevos.desde = desde_del_periodo(cambios.periodo);
        nuevos.hasta = '';
      }
      return nuevos;
    });
  };

  // Pide los datos con los filtros actuales. Se espera un instante (por si el usuario sigue
  // cambiando filtros) y se cancela la petición anterior si llega una nueva.
  useEffect(() => {
    const controlador = new AbortController();
    const parametros = new URLSearchParams({ granularidad });
    ['desde', 'hasta', 'tipo', 'semestre', 'programa', 'categoria', 'estado'].forEach((campo) => {
      if (filtros[campo]) parametros.set(campo, filtros[campo]);
    });

    establecer_actualizando(true);
    const temporizador = setTimeout(async () => {
      try {
        const respuesta = await fetch(`${GRAFICAS_URL}/analitica?${parametros}`, {
          headers: { Authorization: `Bearer ${leer_sesion()?.token}` },
          signal: controlador.signal,
        });
        if (!respuesta.ok) {
          const cuerpo = await respuesta.json().catch(() => null);
          throw new Error(cuerpo?.detail ?? `Error ${respuesta.status}`);
        }
        establecer_datos(await respuesta.json());
        establecer_mensaje_error('');
        establecer_actualizando(false);
      } catch (error) {
        if (error.name === 'AbortError') return;
        establecer_mensaje_error(
          error instanceof TypeError
            ? 'No se pudo conectar con el servicio de estadísticas. Si estaba inactivo puede tardar hasta un minuto en despertar.'
            : error.message
        );
        establecer_actualizando(false);
      }
    }, 220);

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [filtros, granularidad, version]);

  const resumen = datos?.resumen;

  return (
    <section>
      <div className="encabezado_pagina">
        <div>
          <h1>Estadísticas</h1>
          <p className="subtitulo_pagina">Calculadas con los préstamos reales. Cambia los filtros y todo se actualiza.</p>
        </div>
        <button className="boton boton_secundario" onClick={() => establecer_version((v) => v + 1)}>Actualizar</button>
      </div>

      <FiltrosEstadisticas
        filtros={filtros}
        opciones={datos?.filtros_disponibles}
        al_cambiar={cambiar_filtros}
        al_limpiar={() => establecer_filtros(FILTROS_INICIALES)}
        hay_filtros={hay_filtros}
        actualizando={actualizando}
      />

      {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}

      {!datos && !mensaje_error && <p className="texto_atenuado">Calculando estadísticas…</p>}

      {datos && (
        <div className={`panel_analitica ${actualizando ? 'actualizando' : ''}`}>
          <div className="estadisticas indicadores_analitica">
            <div className="estadistica">
              <strong><NumeroAnimado valor={resumen.total} /></strong>
              <span>Préstamos</span>
            </div>
            <div className="estadistica">
              <strong><NumeroAnimado valor={resumen.activos} /></strong>
              <span>Activos</span>
              <small>{resumen.en_mora} en mora ahora</small>
            </div>
            <div className="estadistica">
              <strong>
                {resumen.porcentaje_tardios === null ? '—' : <><NumeroAnimado valor={resumen.porcentaje_tardios} decimales={1} />%</>}
              </strong>
              <span>Con retraso</span>
              <small>{resumen.tardios} préstamos</small>
            </div>
            <div className="estadistica">
              <strong>{formatear_retraso(resumen.dias_promedio_retraso)}</strong>
              <span>Retraso promedio</span>
              <small>solo los atrasados</small>
            </div>
            <div className="estadistica">
              <strong>{resumen.duracion_promedio_dias === null ? '—' : `${resumen.duracion_promedio_dias} d`}</strong>
              <span>Duración promedio</span>
              <small>de los devueltos</small>
            </div>
            <div className="estadistica">
              <strong><NumeroAnimado valor={resumen.usuarios} /></strong>
              <span>Personas</span>
              <small>con préstamos</small>
            </div>
          </div>

          {resumen.total === 0 && <p className="texto_atenuado">No hay préstamos con estos filtros. Prueba ampliando el periodo.</p>}

          {datos.hallazgos.length > 0 && (
            <div className="hallazgos">
              <h2>Lo más importante</h2>
              <div className="lista_hallazgos">
                {datos.hallazgos.map((hallazgo) => (
                  <div key={hallazgo.titulo} className="hallazgo">
                    <span>{hallazgo.titulo}</span>
                    <p>{hallazgo.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="cuadricula_paneles">
            <PanelGrafica titulo="Artículos más alquilados" descripcion="Los que más se prestan en el periodo.">
              <BarrasHorizontales
                datos={datos.ranking_articulos.map((a) => ({ etiqueta: a.etiqueta, valor: a.valor, detalle: a.tipo === 'Equipo' ? 'Dispositivo' : a.tipo }))}
              />
            </PanelGrafica>

            <PanelGrafica titulo="Más devueltos con retraso" descripcion="Artículos con más devoluciones fuera de plazo (incluye los que siguen en mora).">
              <BarrasHorizontales
                color="aviso"
                datos={datos.retrasos_por_articulo.map((a) => ({
                  etiqueta: a.etiqueta,
                  valor: a.valor,
                  detalle: `${a.valor} de ${a.total} préstamos · retraso promedio ${formatear_retraso(a.promedio_dias)}`,
                }))}
                mensaje_vacio="No hay devoluciones con retraso con estos filtros."
              />
            </PanelGrafica>

            <PanelGrafica
              titulo="Préstamos por semestre"
              descripcion="¿Qué semestre alquila más? Pasa el cursor para ver el detalle."
              acciones={
                <Segmentado
                  etiqueta_accesible="Métrica por semestre"
                  valor={metrica_semestre}
                  al_cambiar={establecer_metrica_semestre}
                  opciones={[{ valor: 'total', etiqueta: 'Total' }, { valor: 'persona', etiqueta: 'Por persona' }]}
                />
              }
            >
              <Columnas
                series={[{ etiqueta: metrica_semestre === 'total' ? 'Préstamos' : 'Préstamos por persona', color: 'acento' }]}
                datos={datos.por_semestre.map((s) => ({
                  etiqueta: s.etiqueta === 'Sin dato' ? 'Sin dato' : `Sem. ${s.etiqueta}`,
                  valores: [metrica_semestre === 'total' ? s.prestamos : s.promedio_por_persona],
                  detalle: [`${s.prestamos} préstamos`, `${s.personas} ${s.personas === 1 ? 'persona' : 'personas'}`, `${s.promedio_por_persona} por persona`, `${s.tardios} con retraso`],
                }))}
              />
            </PanelGrafica>

            <PanelGrafica titulo="Personas con más retrasos" descripcion="Para hacer seguimiento, no para sancionar.">
              <BarrasHorizontales
                color="aviso"
                datos={datos.usuarios_retrasos.map((u) => ({
                  etiqueta: u.etiqueta,
                  valor: u.valor,
                  detalle: u.semestre === 'Sin dato' ? 'Semestre sin indicar' : `Semestre ${u.semestre}`,
                }))}
                mensaje_vacio="Nadie tiene retrasos con estos filtros."
              />
            </PanelGrafica>

            <PanelGrafica
              ancho_completo
              titulo="Préstamos en el tiempo"
              descripcion="Cuándo se hacen los préstamos, separados por libros y equipos."
              acciones={
                <Segmentado
                  etiqueta_accesible="Agrupar por"
                  valor={granularidad}
                  al_cambiar={establecer_granularidad}
                  opciones={[{ valor: 'dia', etiqueta: 'Día' }, { valor: 'semana', etiqueta: 'Semana' }, { valor: 'mes', etiqueta: 'Mes' }]}
                />
              }
            >
              <Columnas
                alto={220}
                series={[{ etiqueta: 'Libros', color: 'acento' }, { etiqueta: 'Equipos', color: 'neutro' }]}
                datos={datos.serie_tiempo.map((p) => ({ etiqueta: p.etiqueta, valores: [p.libros, p.equipos] }))}
              />
            </PanelGrafica>

            <PanelGrafica titulo="Puntualidad" descripcion="Devueltos a tiempo frente a los que se pasaron del plazo.">
              <BarrasHorizontales
                datos={datos.puntualidad.map((p) => ({ ...p, color: p.etiqueta === 'A tiempo' ? 'acento' : 'aviso' }))}
              />
            </PanelGrafica>

            <PanelGrafica titulo="Estado de las reservas">
              <BarrasHorizontales
                datos={datos.estados.map((e) => ({ etiqueta: e.etiqueta, valor: e.valor, color: COLOR_ESTADO[e.clave] }))}
              />
            </PanelGrafica>

            <PanelGrafica titulo="Por categoría" descripcion="Qué temas y tipos de equipo se piden más.">
              <BarrasHorizontales datos={datos.por_categoria.map((c) => ({ etiqueta: c.etiqueta, valor: c.valor }))} />
            </PanelGrafica>

            <PanelGrafica titulo="Por programa académico">
              <BarrasHorizontales
                datos={datos.por_programa.map((p) => ({
                  etiqueta: p.etiqueta,
                  valor: p.valor,
                  detalle: `${p.personas} ${p.personas === 1 ? 'persona' : 'personas'}`,
                }))}
              />
            </PanelGrafica>

            <PanelGrafica titulo="Día de la semana" descripcion="Qué días se hacen más préstamos.">
              <Columnas
                series={[{ etiqueta: 'Préstamos', color: 'acento' }]}
                datos={datos.dia_semana.map((d) => ({ etiqueta: d.etiqueta.slice(0, 3), valores: [d.valor], detalle: [`${d.etiqueta}: ${d.valor} préstamos`] }))}
              />
            </PanelGrafica>

            <PanelGrafica titulo="Sin movimiento" descripcion="Artículos que no se prestaron en el periodo: candidatos a difundir o revisar.">
              {datos.sin_movimiento.length === 0 ? (
                <p className="grafica_vacia">Todos los artículos tuvieron movimiento.</p>
              ) : (
                <ul className="lista_simple">
                  {datos.sin_movimiento.map((a) => (
                    <li key={`${a.tipo}-${a.etiqueta}`}>
                      <div>
                        <strong>{a.etiqueta}</strong>
                        <span>{a.tipo === 'Equipo' ? 'Dispositivo' : a.tipo}</span>
                      </div>
                      <span className="cifra">{a.disponibles}/{a.total}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PanelGrafica>
          </div>
        </div>
      )}
    </section>
  );
}
