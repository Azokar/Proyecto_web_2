// ============================================================
// Página: Reservas de todos los usuarios (ADMIN)
// ============================================================
import useTituloPagina from '../hooks/useTituloPagina';
import ReservationTable from '../components/ReservationTable';

export default function AdminReservationsPage() {
  useTituloPagina('Reservas');

  return (
    <section>
      <h1>Reservas</h1>
      <p className="subtitulo_pagina">Todas las reservas de libros y equipos, de todos los usuarios.</p>
      <ReservationTable ruta_libros="/api/reservas-libros" ruta_equipos="/api/reservas-equipos" mostrar_usuario />
    </section>
  );
}
