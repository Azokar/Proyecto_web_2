// ============================================================
// Página: Mis reservas (usuario)
// ============================================================
import useTituloPagina from '../hooks/useTituloPagina';
import ReservationTable from '../components/ReservationTable';

export default function MyReservationsPage() {
  useTituloPagina('Mis reservas');

  return (
    <section>
      <h1>Mis reservas</h1>
      <p className="subtitulo_pagina">Puedes tener hasta 3 reservas activas a la vez. Devuelve a tiempo para que otras personas puedan usarlos.</p>
      <ReservationTable ruta_libros="/api/reservas-libros/mis-reservas" ruta_equipos="/api/reservas-equipos/mis-reservas" />
    </section>
  );
}
