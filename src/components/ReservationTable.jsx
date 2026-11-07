// ============================================================
// ReservationTable — Tabla de reservas (libros y dispositivos)
// ============================================================
// La usan "Mis reservas" (usuario) y "Reservas" (admin, con la columna Usuario).
// Carga las reservas desde la API y permite devolver y, en libros, renovar.
//
// Props:
//   ruta_libros / ruta_equipos -> endpoints que se consultan
//   mostrar_usuario            -> agrega la columna del usuario (vista de admin)
import { useCallback, useEffect, useState } from 'react';
import { llamar_api } from '../services/api';
import { useAlquiler } from '../context/RentalContext';
import { useAvisos } from '../context/AvisosContext';

const formatear_fecha = (texto) =>
  texto ? new Date(texto).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '';
const formatear_dia = (texto) =>
  texto ? new Date(`${texto}T00:00:00`).toLocaleDateString('es-CO', { dateStyle: 'medium' }) : '';

const ETIQUETA_ESTADO = { ACTIVA: 'Activa', DEVUELTO: 'Devuelto', VENCIDO: 'Vencido', CANCELADA: 'Cancelada' };
const DIAS_RENOVACION = 5;

export default function ReservationTable({ ruta_libros, ruta_equipos, mostrar_usuario = false }) {
  const { recargar_articulos } = useAlquiler();
  const { avisar } = useAvisos();
  const [reservas, establecer_reservas] = useState([]);
  const [cargando, establecer_cargando] = useState(true);
  const [mensaje_error, establecer_mensaje_error] = useState('');

  const cargar_reservas = useCallback(async () => {
    establecer_cargando(true);
    try {
      const [libros, equipos] = await Promise.all([llamar_api(ruta_libros), llamar_api(ruta_equipos)]);
      const filas = [
        ...libros.map((r) => ({ ...r, tipo: 'Libro', articulo: r.libro, cuando: `Entrega: ${formatear_dia(r.fechaEntregaEsperada)}` })),
        ...equipos.map((r) => ({
          ...r,
          tipo: 'Dispositivo',
          articulo: r.equipo,
          cuando: `${formatear_fecha(r.horaInicio)} a ${formatear_fecha(r.horaFin)}`,
        })),
      ].sort((a, b) => b.id - a.id);
      establecer_reservas(filas);
      establecer_mensaje_error('');
    } catch (error) {
      establecer_mensaje_error(error.message);
    } finally {
      establecer_cargando(false);
    }
  }, [ruta_libros, ruta_equipos]);

  useEffect(() => {
    cargar_reservas();
  }, [cargar_reservas]);

  // Devolver o renovar y luego refrescar la tabla y el stock del catálogo
  const ejecutar_accion = async (peticion, texto_exito) => {
    try {
      await peticion();
      avisar(texto_exito);
      establecer_mensaje_error('');
      await Promise.all([cargar_reservas(), recargar_articulos()]);
    } catch (error) {
      establecer_mensaje_error(error.message);
    }
  };

  const devolver = (reserva) => {
    const ruta = reserva.tipo === 'Libro' ? '/api/reservas-libros' : '/api/reservas-equipos';
    return ejecutar_accion(() => llamar_api(`${ruta}/${reserva.id}/devolucion`, { metodo: 'PATCH' }), 'Devolución registrada');
  };

  const renovar = (reserva) =>
    ejecutar_accion(() =>
      llamar_api(`/api/reservas-libros/${reserva.id}/renovacion?diasExtra=${DIAS_RENOVACION}`, { metodo: 'PATCH' }),
      `Reserva renovada ${DIAS_RENOVACION} días`
    );

  if (cargando) return <p className="texto_atenuado">Cargando reservas…</p>;

  return (
    <>
      {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}
      {reservas.length === 0 ? (
        <p className="texto_atenuado">Todavía no hay reservas.</p>
      ) : (
        <div className="contenedor_tabla">
          <table className="tabla">
            <thead>
              <tr>
                {mostrar_usuario && <th>Usuario</th>}
                <th>Artículo</th>
                <th>Cuándo</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva, posicion) => (
                <tr key={`${reserva.tipo}-${reserva.id}`} style={{ '--i': Math.min(posicion, 14) }}>
                  {mostrar_usuario && <td>{reserva.usuario}</td>}
                  <td>
                    {reserva.articulo}
                    <span className="tipo_en_tabla">{reserva.tipo}</span>
                  </td>
                  <td className="cifra">{reserva.cuando}</td>
                  <td>
                    <span className={`etiqueta_estado etiqueta_reserva_${reserva.estadoReserva.toLowerCase()}`}>
                      {ETIQUETA_ESTADO[reserva.estadoReserva] ?? reserva.estadoReserva}
                    </span>
                  </td>
                  <td className="acciones_tabla">
                    {reserva.estadoReserva === 'ACTIVA' && (
                      <>
                        <button className="boton boton_primario boton_pequeno" onClick={() => devolver(reserva)}>Devolver</button>
                        {reserva.tipo === 'Libro' && (
                          <button className="boton boton_secundario boton_pequeno" onClick={() => renovar(reserva)}>
                            Renovar +{DIAS_RENOVACION} días
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
