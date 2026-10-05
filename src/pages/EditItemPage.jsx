// ============================================================
// Página: Editar artículo
// ============================================================
import { useParams, useNavigate, Link } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAlquiler } from '../context/RentalContext';
import ItemForm from '../components/ItemForm';

export default function EditItemPage() {
  useTituloPagina('Editar artículo');

  // Lee el id de la URL (ruta: /editar/:id_articulo)
  const { id_articulo } = useParams();
  const { obtener_articulo_por_id, actualizar_articulo } = useAlquiler();
  const navegar_a_otra_pagina = useNavigate();

  const articulo_a_editar = obtener_articulo_por_id(id_articulo);

  // Si el id no existe (por ejemplo, ya fue eliminado), avisamos al usuario
  if (!articulo_a_editar) {
    return (
      <section>
        <h1>Artículo no encontrado</h1>
        <Link to="/catalogo">Volver al catálogo</Link>
      </section>
    );
  }

  const manejar_actualizacion_articulo = (datos_modificados) => {
    actualizar_articulo(id_articulo, datos_modificados);
    navegar_a_otra_pagina('/catalogo');
  };

  return (
    <section className="contenedor_estrecho">
      <h1>Editar artículo</h1>
      <ItemForm
        datos_iniciales={articulo_a_editar}
        al_enviar_formulario={manejar_actualizacion_articulo}
        texto_boton_enviar="Guardar cambios"
      />
    </section>
  );
}
