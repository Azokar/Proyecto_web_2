// ============================================================
// ItemList — Catálogo en tarjetas, con filtros y búsqueda
// ============================================================
// Lee los artículos directamente del Contexto global (sin props drilling)
// y muestra una tarjeta (ItemCard) por cada artículo que pase el filtro.
// Los artículos ocultos (activo = false) solo los ve el ADMIN.
import { useState } from 'react';
import { useAlquiler } from '../context/RentalContext';
import { useAuth } from '../context/AuthContext';
import ItemCard from './ItemCard';

// Opciones del filtro: 'Todos' muestra todo, las demás filtran por tipo
const OPCIONES_FILTRO = ['Todos', 'Libro', 'Dispositivo'];

export default function ItemList() {
  const { lista_articulos, cargando, error_carga, recargar_articulos } = useAlquiler();
  const { es_admin } = useAuth();
  const [filtro_seleccionado, establecer_filtro_seleccionado] = useState('Todos');
  const [texto_busqueda, establecer_texto_busqueda] = useState('');

  const articulos_visibles = lista_articulos
    .filter((articulo) => es_admin || articulo.activo)
    .filter((articulo) => filtro_seleccionado === 'Todos' || articulo.tipo === filtro_seleccionado)
    .filter((articulo) => articulo.nombre.toLowerCase().includes(texto_busqueda.trim().toLowerCase()));

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
        <input
          className="campo_busqueda"
          type="search"
          placeholder="Buscar por nombre"
          value={texto_busqueda}
          onChange={(evento) => establecer_texto_busqueda(evento.target.value)}
        />
      </div>

      {error_carga && (
        <p className="mensaje_error">
          {error_carga} <button className="boton boton_secundario boton_pequeno" onClick={recargar_articulos}>Reintentar</button>
        </p>
      )}

      <div className="cuadricula_articulos">
        {cargando && articulos_visibles.length === 0 &&
          [0, 1, 2, 3, 4, 5].map((n) => <div key={n} className="esqueleto_tarjeta" style={{ '--i': n }} aria-hidden="true" />)}

        {articulos_visibles.map((articulo, posicion) => (
          <ItemCard key={articulo.clave} articulo={articulo} posicion={posicion} />
        ))}
      </div>

      {cargando && articulos_visibles.length === 0 && (
        <p className="texto_atenuado">Cargando artículos. Si el servidor estaba inactivo puede tardar un poco.</p>
      )}
      {!cargando && !error_carga && articulos_visibles.length === 0 && (
        <p className="texto_atenuado">No hay artículos que coincidan.</p>
      )}
    </>
  );
}
