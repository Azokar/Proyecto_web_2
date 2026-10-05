// ============================================================
// Página: Crear artículo
// ============================================================
import { useNavigate } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAlquiler } from '../context/RentalContext';
import ItemForm from '../components/ItemForm';

export default function CreateItemPage() {
  useTituloPagina('Crear artículo');
  const { agregar_articulo } = useAlquiler();
  const navegar_a_otra_pagina = useNavigate();

  // Cuando el formulario se envía: guardamos en el Contexto Global
  // y llevamos al usuario al catálogo, donde ya verá el artículo nuevo.
  const manejar_creacion_articulo = (datos_articulo_nuevo) => {
    agregar_articulo(datos_articulo_nuevo);
    navegar_a_otra_pagina('/catalogo');
  };

  return (
    <section className="contenedor_estrecho">
      <h1>Crear artículo</h1>
      <ItemForm al_enviar_formulario={manejar_creacion_articulo} texto_boton_enviar="Crear" />
    </section>
  );
}
