// ============================================================
// ItemCard — Tarjeta de un artículo (libro o dispositivo)
// ============================================================
// Imagen arriba (o un marcador si el artículo no tiene), datos debajo y acciones al pie:
//   todos los usuarios -> Reservar
//   solo el ADMIN      -> Editar y Eliminar
//
// Props:
//   articulo -> objeto normalizado (ver RentalContext)
//   posicion -> lugar en la lista (escalona la animación de entrada)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlquiler } from '../context/RentalContext';
import { useAuth } from '../context/AuthContext';
import { useAvisos } from '../context/AvisosContext';
import ReservaModal from './ReservaModal';
import Marca from './Marca';

export default function ItemCard({ articulo, posicion = 0 }) {
  const { eliminar_articulo } = useAlquiler();
  const { es_admin } = useAuth();
  const { avisar } = useAvisos();
  const navegar_a_otra_pagina = useNavigate();
  const [mostrar_reserva, establecer_mostrar_reserva] = useState(false);
  const [mensaje_error, establecer_mensaje_error] = useState('');
  // Si la imagen no carga (por ejemplo, el servidor dormido) se muestra el marcador
  const [imagen_fallida, establecer_imagen_fallida] = useState(false);

  const texto_estado = !articulo.activo ? 'Oculto' : articulo.disponible ? 'Disponible' : 'Agotado';
  const clase_etiqueta_estado = articulo.disponible ? 'etiqueta_disponible' : 'etiqueta_alquilado';

  // Barra de stock: color de acento normal, ámbar cuando queda poco, gris si no hay
  const proporcion_stock = articulo.total > 0 ? articulo.disponibles / articulo.total : 0;
  const clase_barra_stock = articulo.disponibles === 0 ? 'stock_agotado' : proporcion_stock <= 0.34 ? 'stock_bajo' : '';
  const indice_animacion = Math.min(posicion, 12);

  const manejar_clic_editar = () => navegar_a_otra_pagina(`/editar/${articulo.tipo}/${articulo.id}`);

  const manejar_clic_eliminar = async () => {
    if (!window.confirm(`¿Eliminar "${articulo.nombre}"?`)) return;
    try {
      await eliminar_articulo(articulo.tipo, articulo.id);
      avisar(`«${articulo.nombre}» eliminado`);
    } catch (error) {
      establecer_mensaje_error(error.message);
    }
  };

  return (
    <article className="tarjeta_articulo entrada_escalonada" style={{ '--i': indice_animacion }}>
      <div className="imagen_articulo">
        {articulo.imagen && !imagen_fallida ? (
          <img src={articulo.imagen} alt={articulo.nombre} loading="lazy" onError={() => establecer_imagen_fallida(true)} />
        ) : (
          <div className="sin_imagen" aria-hidden="true">
            <Marca tamano={40} />
          </div>
        )}
      </div>

      <div className="cuerpo_articulo">
        <div className="fila_superior_articulo">
          <span className="categoria_articulo">{articulo.tipo} · {articulo.categoria}</span>
          <span className={`etiqueta_estado ${clase_etiqueta_estado}`}>{texto_estado}</span>
        </div>
        <h3>{articulo.nombre}</h3>

        <div className="stock_articulo">
          <span>
            {articulo.disponibles} <small>de {articulo.total} disponibles</small>
          </span>
          <div className={`barra_stock ${clase_barra_stock}`} style={{ '--proporcion': proporcion_stock, '--i': indice_animacion }} aria-hidden="true">
            <span />
          </div>
        </div>

        {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}

        <div className="acciones_fila">
          <button
            className="boton boton_primario boton_pequeno"
            onClick={() => establecer_mostrar_reserva(true)}
            disabled={!articulo.disponible}
          >
            Reservar
          </button>
          {es_admin && (
            <>
              <button className="boton boton_secundario boton_pequeno" onClick={manejar_clic_editar}>Editar</button>
              <button className="boton boton_peligro boton_pequeno" onClick={manejar_clic_eliminar}>Eliminar</button>
            </>
          )}
        </div>
      </div>

      {mostrar_reserva && (
        <ReservaModal articulo={articulo} al_cerrar={() => establecer_mostrar_reserva(false)} />
      )}
    </article>
  );
}
