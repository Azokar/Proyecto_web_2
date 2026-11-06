// ============================================================
// Página: Inicio
// ============================================================
// Visitante: presentación (qué es, cómo funciona, acceso).
// Usuario con sesión: panel con indicadores, sus reservas activas y lo que hay disponible ahora.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAlquiler } from '../context/RentalContext';
import { useAuth } from '../context/AuthContext';
import { llamar_api } from '../services/api';
import NumeroAnimado from '../components/NumeroAnimado';
import Marca from '../components/Marca';

const PASOS = [
  { numero: '01', titulo: 'Crea tu cuenta', texto: 'Solo necesitas un usuario y una contraseña. Sin formularios largos.' },
  { numero: '02', titulo: 'Elige y reserva', texto: 'Mira el catálogo de libros y equipos y reserva lo que necesites, hasta 3 a la vez.' },
  { numero: '03', titulo: 'Devuelve en línea', texto: 'Registra la entrega o renueva el préstamo desde tu lista de reservas.' },
];

// Estantería dibujada con figuras planas (sin degradados): libros de distintas alturas y un equipo
function IlustracionEstanteria() {
  return (
    <svg className="ilustracion_portada" viewBox="0 0 360 280" role="img" aria-label="Estantería con libros y un portátil">
      <g className="trazo_ilustracion">
        <rect x="40" y="96" width="34" height="144" rx="3" className="lomo lomo_acento" />
        <rect x="80" y="60" width="38" height="180" rx="3" className="lomo lomo_tinta" />
        <rect x="124" y="112" width="30" height="128" rx="3" className="lomo lomo_suave" />
        <rect x="160" y="80" width="36" height="160" rx="3" className="lomo lomo_acento" />
        <rect x="202" y="124" width="28" height="116" rx="3" className="lomo lomo_tinta" />
        <path d="M252 240 L252 168 Q252 160 260 160 L322 160 Q330 160 330 168 L330 240 Z" className="lomo lomo_suave" />
        <rect x="244" y="240" width="94" height="6" rx="3" className="lomo lomo_tinta" />
        <rect x="262" y="172" width="56" height="34" rx="3" className="pantalla" />
      </g>
      <rect x="16" y="240" width="328" height="6" rx="3" className="lomo lomo_tinta" />
    </svg>
  );
}

function formatear_dia(texto) {
  return texto ? new Date(`${texto}T00:00:00`).toLocaleDateString('es-CO', { dateStyle: 'medium' }) : '';
}
function formatear_fecha_hora(texto) {
  return texto ? new Date(texto).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}

export default function HomePage() {
  useTituloPagina('Inicio');
  const { lista_articulos } = useAlquiler();
  const { esta_autenticado, es_admin, usuario_actual } = useAuth();
  // null = cargando; [] = sin reservas activas
  const [reservas_activas, establecer_reservas_activas] = useState(null);

  // Mis reservas activas (libros y equipos) para el panel
  useEffect(() => {
    if (!esta_autenticado) return undefined;
    let cancelado = false;
    Promise.all([llamar_api('/api/reservas-libros/mis-reservas'), llamar_api('/api/reservas-equipos/mis-reservas')])
      .then(([libros, equipos]) => {
        if (cancelado) return;
        const activas = [
          ...libros
            .filter((r) => r.estadoReserva === 'ACTIVA')
            .map((r) => ({ clave: `L${r.id}`, id: r.id, nombre: r.libro, tipo: 'Libro', cuando: `Entrega ${formatear_dia(r.fechaEntregaEsperada)}` })),
          ...equipos
            .filter((r) => r.estadoReserva === 'ACTIVA')
            .map((r) => ({ clave: `E${r.id}`, id: r.id, nombre: r.equipo, tipo: 'Dispositivo', cuando: `Hasta ${formatear_fecha_hora(r.horaFin)}` })),
        ].sort((a, b) => b.id - a.id);
        establecer_reservas_activas(activas);
      })
      .catch(() => !cancelado && establecer_reservas_activas([]));
    return () => { cancelado = true; };
  }, [esta_autenticado]);

  // ---------- Visitante ----------
  if (!esta_autenticado) {
    return (
      <section>
        <div className="portada_inicio">
          <div className="texto_portada">
            <div className="etiqueta_superior">Préstamo sin costo</div>
            <h1>Libros y equipos para quien los necesita.</h1>
            <p>
              EduLoan es una plataforma sin ánimo de lucro de la institución: consulta lo que hay disponible,
              reserva en un minuto y devuelve desde aquí.
            </p>
            <div className="acciones_portada">
              <Link to="/registro" className="boton boton_primario">Crear cuenta</Link>
              <Link to="/entrar" className="boton boton_secundario">Ya tengo cuenta</Link>
            </div>
          </div>
          <IlustracionEstanteria />
        </div>

        <div className="bloque_inicio">
          <h2 className="titulo_bloque">Cómo funciona</h2>
          <div className="pasos">
            {PASOS.map((paso) => (
              <div className="paso" key={paso.numero}>
                <span className="numero_paso">{paso.numero}</span>
                <strong>{paso.titulo}</strong>
                <span>{paso.texto}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="banda_cta">
          <div>
            <strong>Empieza hoy</strong>
            <span>Crear la cuenta toma menos de un minuto.</span>
          </div>
          <Link to="/registro" className="boton boton_primario">Crear cuenta</Link>
        </div>
      </section>
    );
  }

  // ---------- Usuario con sesión ----------
  const articulos_visibles = lista_articulos.filter((articulo) => es_admin || articulo.activo);
  const total_articulos = articulos_visibles.length;
  const disponibles_ahora = articulos_visibles.filter((articulo) => articulo.disponible);
  const cantidad_agotados = total_articulos - disponibles_ahora.length;

  return (
    <section>
      <div className="encabezado_pagina">
        <div>
          <h1>Hola, {usuario_actual.usuario}</h1>
          <p className="subtitulo_pagina">Así está la biblioteca hoy.</p>
        </div>
        <div className="acciones_portada" style={{ marginTop: 0 }}>
          <Link to="/catalogo" className="boton boton_primario">Ver catálogo</Link>
          {es_admin && <Link to="/crear" className="boton boton_secundario">Publicar artículo</Link>}
        </div>
      </div>

      {!es_admin && !usuario_actual.semestre && (
        <div className="nota_perfil">
          <div>
            <strong>Completa tu perfil</strong>
            <span>Indica tu semestre y programa para que la biblioteca sepa qué necesitas. Es opcional.</span>
          </div>
          <Link to="/perfil" className="boton boton_secundario boton_pequeno">Completar</Link>
        </div>
      )}

      <div className="estadisticas">
        <div className="estadistica"><strong><NumeroAnimado valor={total_articulos} /></strong><span>Artículos</span></div>
        <div className="estadistica"><strong><NumeroAnimado valor={disponibles_ahora.length} /></strong><span>Disponibles</span></div>
        <div className="estadistica"><strong><NumeroAnimado valor={cantidad_agotados} /></strong><span>Agotados</span></div>
        <div className="estadistica">
          <strong><NumeroAnimado valor={reservas_activas?.length ?? 0} /></strong>
          <span>Mis reservas activas</span>
        </div>
      </div>

      <div className="dos_columnas">
        <div className="bloque_inicio">
          <div className="cabecera_bloque">
            <h2 className="titulo_bloque">Mis reservas activas</h2>
            <Link to="/mis-reservas" className="enlace_discreto">Ver todas</Link>
          </div>
          {reservas_activas === null ? (
            <p className="texto_atenuado">Cargando…</p>
          ) : reservas_activas.length === 0 ? (
            <p className="texto_atenuado">No tienes reservas activas. <Link to="/catalogo" className="enlace_subrayado">Explora el catálogo</Link>.</p>
          ) : (
            <ul className="lista_simple">
              {reservas_activas.slice(0, 4).map((reserva) => (
                <li key={reserva.clave}>
                  <div>
                    <strong>{reserva.nombre}</strong>
                    <span>{reserva.tipo}</span>
                  </div>
                  <span className="cifra">{reserva.cuando}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bloque_inicio">
          <div className="cabecera_bloque">
            <h2 className="titulo_bloque">Disponible ahora</h2>
            <Link to="/catalogo" className="enlace_discreto">Ver catálogo</Link>
          </div>
          {disponibles_ahora.length === 0 ? (
            <p className="texto_atenuado">Por ahora no hay artículos disponibles.</p>
          ) : (
            <ul className="lista_simple">
              {disponibles_ahora.slice(0, 5).map((articulo) => (
                <li key={articulo.clave}>
                  <div className="miniatura_articulo">
                    {articulo.imagen ? <img src={articulo.imagen} alt="" loading="lazy" /> : <Marca tamano={16} />}
                  </div>
                  <div className="texto_miniatura">
                    <strong>{articulo.nombre}</strong>
                    <span>{articulo.tipo}</span>
                  </div>
                  <span className="cifra">{articulo.disponibles}/{articulo.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
