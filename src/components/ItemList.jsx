// ============================================================
// ItemList — Lista del catálogo con filtros
// Responsable: Persona 3
// ============================================================
// Lee los artículos directamente del Contexto global (sin props drilling)
// y muestra una ItemCard por cada artículo que pase el filtro.
import { useState } from 'react';
import { useAlquiler } from '../context/RentalContext';
import ItemCard from './ItemCard';

// Opciones del filtro: 'Todos' muestra todo, las demás filtran por tipo
const OPCIONES_FILTRO = ['Todos', 'Libro', 'Dispositivo'];

export default function ItemList() {
  const { lista_articulos } = useAlquiler();
  const [filtro_seleccionado, establecer_filtro_seleccionado] = useState('Todos');

  const articulos_visibles =
    filtro_seleccionado === 'Todos'
      ? lista_articulos
      : lista_articulos.filter((articulo) => articulo.tipo === filtro_seleccionado);

  return (
    <>
      <div className="filtros_catalogo">
        {OPCIONES_FILTRO.map((opcion_filtro) => (
          <button
            key={opcion_filtro}
            className={`boton ${filtro_seleccionado === opcion_filtro ? 'boton_primario' : 'boton_secundario'}`}
            onClick={() => establecer_filtro_seleccionado(opcion_filtro)}
          >
            {opcion_filtro}
          </button>
        ))}
      </div>

      {articulos_visibles.length === 0 ? (
        <p className="texto_atenuado">No hay artículos.</p>
      ) : (
        <div className="cuadricula_articulos">
          {articulos_visibles.map((articulo) => (
            <ItemCard key={articulo.id} articulo={articulo} />
          ))}
        </div>
      )}
    </>
  );
}
