// ============================================================
// ItemCard — Tarjeta de un artículo (libro o dispositivo)
// Responsable: Persona 3
// ============================================================
// Muestra los datos del artículo y sus acciones:
// alquilar/devolver, editar y eliminar.
//
// Props:
//   articulo -> objeto { id, nombre, tipo, categoria, disponible }
import { useNavigate } from 'react-router-dom';
import { useAlquiler } from '../context/RentalContext';

export default function ItemCard({ articulo }) {
  const { eliminar_articulo, alternar_disponibilidad } = useAlquiler();
  const navegar_a_otra_pagina = useNavigate();

  const icono_segun_tipo = articulo.tipo === 'Libro' ? '📖' : '💻';
  const texto_estado = articulo.disponible ? 'Disponible' : 'Alquilado';
  const clase_etiqueta_estado = articulo.disponible ? 'etiqueta_disponible' : 'etiqueta_alquilado';
  const texto_boton_alquilar_o_devolver = articulo.disponible ? 'Alquilar' : 'Devolver';

  const manejar_clic_alquilar_o_devolver = () => alternar_disponibilidad(articulo.id);
  const manejar_clic_editar = () => navegar_a_otra_pagina(`/editar/${articulo.id}`);
  const manejar_clic_eliminar = () => eliminar_articulo(articulo.id);

  return (
    <article className="tarjeta_articulo">
      <span className="icono_articulo">{icono_segun_tipo}</span>
      <h3>{articulo.nombre}</h3>
      <p className="texto_atenuado">{articulo.tipo} · {articulo.categoria}</p>
      <span className={`etiqueta_estado ${clase_etiqueta_estado}`}>{texto_estado}</span>

      <div className="acciones_tarjeta">
        <button className="boton boton_primario" onClick={manejar_clic_alquilar_o_devolver}>
          {texto_boton_alquilar_o_devolver}
        </button>
        <button className="boton boton_secundario" onClick={manejar_clic_editar}>Editar</button>
        <button className="boton boton_peligro" onClick={manejar_clic_eliminar}>Eliminar</button>
      </div>
    </article>
  );
}
