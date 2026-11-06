// ============================================================
// Página: Editar artículo (ADMIN)
// ============================================================
import { useParams, useNavigate, Link } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAlquiler } from '../context/RentalContext';
import ItemForm from '../components/ItemForm';
import { useAvisos } from '../context/AvisosContext';

export default function EditItemPage() {
  useTituloPagina('Editar artículo');

  // Lee el tipo y el id de la URL (ruta: /editar/:tipo/:id_articulo). El tipo hace falta
  // porque un libro y un equipo pueden tener el mismo id.
  const { tipo, id_articulo } = useParams();
  const { obtener_articulo, actualizar_articulo, cargando } = useAlquiler();
  const navegar_a_otra_pagina = useNavigate();
  const { avisar } = useAvisos();

  const articulo_a_editar = obtener_articulo(tipo, id_articulo);

  if (cargando) return <p className="texto_atenuado">Cargando…</p>;

  // Si no existe (por ejemplo, ya fue eliminado), avisamos al usuario
  if (!articulo_a_editar) {
    return (
      <section>
        <h1>Artículo no encontrado</h1>
        <Link to="/catalogo">Volver al catálogo</Link>
      </section>
    );
  }

  const manejar_actualizacion_articulo = async (tipo_articulo, datos_api, imagen) => {
    await actualizar_articulo(tipo_articulo, id_articulo, datos_api, imagen);
    avisar('Cambios guardados');
    navegar_a_otra_pagina('/catalogo');
  };

  return (
    <section className="contenedor_estrecho">
      <h1>Editar artículo</h1>
      <p className="subtitulo_pagina">{articulo_a_editar.nombre}</p>
      <ItemForm
        articulo_inicial={articulo_a_editar}
        al_enviar_formulario={manejar_actualizacion_articulo}
        texto_boton_enviar="Guardar cambios"
      />
    </section>
  );
}
