// ============================================================
// Página: Publicar artículo (ADMIN)
// ============================================================
import { useNavigate } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAlquiler } from '../context/RentalContext';
import ItemForm from '../components/ItemForm';
import { useAvisos } from '../context/AvisosContext';

export default function CreateItemPage() {
  useTituloPagina('Publicar artículo');
  const { crear_articulo } = useAlquiler();
  const navegar_a_otra_pagina = useNavigate();
  const { avisar } = useAvisos();

  // Cuando el formulario se envía: se guarda en la API y se lleva al usuario al catálogo,
  // donde ya verá el artículo nuevo. Si la API rechaza los datos, el formulario muestra el error.
  const manejar_creacion_articulo = async (tipo, datos_api, imagen) => {
    await crear_articulo(tipo, datos_api, imagen.archivo);
    avisar('Artículo publicado');
    navegar_a_otra_pagina('/catalogo');
  };

  return (
    <section className="contenedor_estrecho">
      <h1>Publicar artículo</h1>
      <p className="subtitulo_pagina">Lo que publiques aparece al instante en el catálogo.</p>
      <ItemForm al_enviar_formulario={manejar_creacion_articulo} texto_boton_enviar="Publicar" />
    </section>
  );
}
