// ============================================================
// ReservaModal — Ventana para reservar un libro o un dispositivo
// ============================================================
// Libro        -> se elige por cuántos días se presta (máximo según el libro)
// Dispositivo  -> se elige fecha/hora de inicio y por cuántas horas (máximo según el equipo)
// Las reglas de fondo (stock, máximo de 3 reservas activas…) las valida la API.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAlquiler } from '../context/RentalContext';
import { useAvisos } from '../context/AvisosContext';

const dos_digitos = (numero) => String(numero).padStart(2, '0');

// Fecha local en el formato "AAAA-MM-DDTHH:mm" (el de <input type="datetime-local"> y el de la API).
// No se usa toISOString() porque convierte a UTC y correría la hora.
const a_texto_local = (fecha) =>
  `${fecha.getFullYear()}-${dos_digitos(fecha.getMonth() + 1)}-${dos_digitos(fecha.getDate())}` +
  `T${dos_digitos(fecha.getHours())}:${dos_digitos(fecha.getMinutes())}`;

// Por defecto: la próxima hora en punto
const proxima_hora = () => {
  const fecha = new Date();
  fecha.setHours(fecha.getHours() + 1, 0, 0, 0);
  return a_texto_local(fecha);
};

export default function ReservaModal({ articulo, al_cerrar: cerrar_ahora }) {
  const { reservar_articulo } = useAlquiler();
  const { avisar } = useAvisos();
  const navegar_a_otra_pagina = useNavigate();
  const es_libro = articulo.tipo === 'Libro';

  const maximo = es_libro ? articulo.datos.diasPrestamoMax : articulo.datos.duracionMaximaHrs;
  const [cantidad, establecer_cantidad] = useState(es_libro ? Math.min(7, maximo) : Math.min(1, maximo));
  const [inicio, establecer_inicio] = useState(proxima_hora);
  const [proposito, establecer_proposito] = useState('');
  const [mensaje_error, establecer_mensaje_error] = useState('');
  const [enviando, establecer_enviando] = useState(false);
  const [cerrando, establecer_cerrando] = useState(false);

  // Mientras la ventana está abierta, la página de atrás no se desplaza
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = anterior; };
  }, []);

  // La salida dura 140 ms (más rápida que la entrada) y después se desmonta
  const al_cerrar = () => {
    establecer_cerrando(true);
    setTimeout(cerrar_ahora, 140);
  };

  const manejar_envio = async (evento) => {
    evento.preventDefault();
    establecer_mensaje_error('');
    establecer_enviando(true);
    try {
      if (es_libro) {
        await reservar_articulo('Libro', {
          libroId: articulo.id,
          diasPrestamo: Number(cantidad),
          tipoPrestamo: 'Domicilio',
          proposito: proposito.trim() || null,
        });
      } else {
        const hora_inicio = new Date(inicio);
        const hora_fin = new Date(hora_inicio.getTime() + Number(cantidad) * 3600 * 1000);
        await reservar_articulo('Dispositivo', {
          equipoId: articulo.id,
          horaInicio: `${a_texto_local(hora_inicio)}:00`,
          horaFin: `${a_texto_local(hora_fin)}:00`,
          proposito: proposito.trim() || null,
        });
      }
      avisar(`Reservaste «${articulo.nombre}»`);
      cerrar_ahora();
      navegar_a_otra_pagina('/mis-reservas');
    } catch (error) {
      establecer_mensaje_error(error.message);
      establecer_enviando(false);
    }
  };

  // Se dibuja en <body> (portal): dentro de la tarjeta, su efecto al pasar el cursor (transform)
  // cambiaba el bloque de referencia del modal (position: fixed) y la ventana parpadeaba al hacer scroll.
  return createPortal(
    <div className={`fondo_modal ${cerrando ? 'cerrando' : ''}`} onClick={al_cerrar}>
      {/* stopPropagation evita que un clic dentro de la ventana la cierre */}
      <div className="ventana_modal" onClick={(evento) => evento.stopPropagation()}>
        <h2>Reservar</h2>
        <p className="texto_atenuado">{articulo.nombre}</p>

        <form className="formulario" onSubmit={manejar_envio}>
          {!es_libro && (
            <label>
              Inicio
              <input
                type="datetime-local"
                value={inicio}
                min={a_texto_local(new Date())}
                onChange={(evento) => establecer_inicio(evento.target.value)}
                required
              />
            </label>
          )}

          <label>
            {es_libro ? `Días de préstamo (máximo ${maximo})` : `Horas de uso (máximo ${maximo})`}
            <input
              type="number"
              min={es_libro ? 1 : 0.5}
              max={maximo}
              step={es_libro ? 1 : 0.5}
              value={cantidad}
              onChange={(evento) => establecer_cantidad(evento.target.value)}
              required
            />
          </label>

          <label>
            Propósito (opcional)
            <input
              value={proposito}
              maxLength={150}
              onChange={(evento) => establecer_proposito(evento.target.value)}
              placeholder="Ej: Proyecto de clase"
            />
          </label>

          {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}

          <div className="acciones_tarjeta">
            <button type="submit" className="boton boton_primario" disabled={enviando}>
              {enviando ? 'Reservando…' : 'Confirmar reserva'}
            </button>
            <button type="button" className="boton boton_secundario" onClick={al_cerrar}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
