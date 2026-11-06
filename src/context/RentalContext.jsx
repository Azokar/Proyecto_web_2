// ============================================================
// RentalContext — Catálogo de artículos conectado a la API
// ============================================================
// Los "artículos" son los libros y los equipos tecnológicos de la API, unidos en una sola
// lista con la misma forma para que las tarjetas los traten igual:
//   { clave, id, tipo: 'Libro' | 'Dispositivo', nombre, categoria, total, disponibles,
//     disponible, activo, datos }      <- "datos" es el objeto original de la API
//
// Solo el ADMIN puede crear, editar y eliminar. Cualquier usuario puede reservar.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { llamar_api } from '../services/api';
import { API_URL } from '../config';
import { useAuth } from './AuthContext';

const ContextoAlquiler = createContext();

const normalizar_libro = (libro) => ({
  clave: `Libro-${libro.id}`,
  id: libro.id,
  tipo: 'Libro',
  nombre: libro.nomLibro,
  categoria: libro.categorias.map((categoria) => categoria.nombre).join(', ') || 'Sin categoría',
  total: libro.cantidadTotal,
  disponibles: libro.cantidadDisponible,
  disponible: libro.estadoActivo && libro.cantidadDisponible > 0,
  activo: libro.estadoActivo,
  imagen: libro.imagenUrl ? `${API_URL}${libro.imagenUrl}` : null,
  datos: libro,
});

const normalizar_equipo = (equipo) => ({
  clave: `Dispositivo-${equipo.id}`,
  id: equipo.id,
  tipo: 'Dispositivo',
  nombre: equipo.nomEquipo,
  categoria: equipo.tipoEquipo || 'Equipo',
  total: equipo.cantidadTotal,
  disponibles: equipo.cantidadDisponible,
  disponible: equipo.estadoActivo && equipo.cantidadDisponible > 0,
  activo: equipo.estadoActivo,
  imagen: equipo.imagenUrl ? `${API_URL}${equipo.imagenUrl}` : null,
  datos: equipo,
});

// Cada tipo de artículo vive en un recurso distinto de la API
const RUTA_POR_TIPO = { Libro: '/api/libros', Dispositivo: '/api/equipos' };
const RUTA_RESERVA_POR_TIPO = { Libro: '/api/reservas-libros', Dispositivo: '/api/reservas-equipos' };

export function RentalProvider({ children }) {
  const { esta_autenticado } = useAuth();
  const [lista_articulos, establecer_lista_articulos] = useState([]);
  const [cargando, establecer_cargando] = useState(false);
  const [error_carga, establecer_error_carga] = useState('');

  const recargar_articulos = useCallback(async () => {
    establecer_cargando(true);
    establecer_error_carga('');
    try {
      const [libros, equipos] = await Promise.all([
        llamar_api('/api/libros'),
        llamar_api('/api/equipos'),
      ]);
      establecer_lista_articulos([...libros.map(normalizar_libro), ...equipos.map(normalizar_equipo)]);
    } catch (error) {
      establecer_error_carga(error.message);
    } finally {
      establecer_cargando(false);
    }
  }, []);

  // El catálogo exige sesión: se carga al iniciar sesión y se vacía al cerrarla
  useEffect(() => {
    if (esta_autenticado) {
      recargar_articulos();
    } else {
      establecer_lista_articulos([]);
    }
  }, [esta_autenticado, recargar_articulos]);

  // LEER (uno): busca un artículo por tipo e id (los ids de libros y equipos pueden repetirse)
  const obtener_articulo = (tipo, id_articulo) =>
    lista_articulos.find((articulo) => articulo.tipo === tipo && articulo.id === Number(id_articulo));

  // La foto se sube en una petición aparte (multipart) cuando el artículo ya existe y tiene id
  const subir_imagen = (tipo, id_articulo, archivo) => {
    const formulario = new FormData();
    formulario.append('archivo', archivo);
    return llamar_api(`${RUTA_POR_TIPO[tipo]}/${id_articulo}/imagen`, { metodo: 'PUT', formulario });
  };

  // CREAR (ADMIN): "datos_api" ya viene con la forma que espera la API; "archivo_imagen" es opcional.
  // Si el artículo se crea pero la foto falla, el error se propaga y el artículo queda sin foto
  // (el admin puede subirla después editándolo).
  const crear_articulo = async (tipo, datos_api, archivo_imagen = null) => {
    const creado = await llamar_api(RUTA_POR_TIPO[tipo], { metodo: 'POST', cuerpo: datos_api });
    try {
      if (archivo_imagen) await subir_imagen(tipo, creado.id, archivo_imagen);
    } finally {
      await recargar_articulos();
    }
  };

  // ACTUALIZAR (ADMIN): imagen = { archivo, quitar } (ambos opcionales)
  const actualizar_articulo = async (tipo, id_articulo, datos_api, imagen = {}) => {
    await llamar_api(`${RUTA_POR_TIPO[tipo]}/${id_articulo}`, { metodo: 'PUT', cuerpo: datos_api });
    try {
      if (imagen.archivo) {
        await subir_imagen(tipo, id_articulo, imagen.archivo);
      } else if (imagen.quitar) {
        await llamar_api(`${RUTA_POR_TIPO[tipo]}/${id_articulo}/imagen`, { metodo: 'DELETE' });
      }
    } finally {
      await recargar_articulos();
    }
  };

  // ELIMINAR (ADMIN): la API lo rechaza si el artículo ya tiene préstamos registrados
  const eliminar_articulo = async (tipo, id_articulo) => {
    await llamar_api(`${RUTA_POR_TIPO[tipo]}/${id_articulo}`, { metodo: 'DELETE' });
    await recargar_articulos();
  };

  // RESERVAR: el usuario sale del token, no se envía en el cuerpo
  const reservar_articulo = async (tipo, datos_reserva) => {
    const reserva = await llamar_api(RUTA_RESERVA_POR_TIPO[tipo], { metodo: 'POST', cuerpo: datos_reserva });
    await recargar_articulos(); // el stock cambió
    return reserva;
  };

  return (
    <ContextoAlquiler.Provider
      value={{
        lista_articulos,
        cargando,
        error_carga,
        recargar_articulos,
        obtener_articulo,
        crear_articulo,
        actualizar_articulo,
        eliminar_articulo,
        reservar_articulo,
      }}
    >
      {children}
    </ContextoAlquiler.Provider>
  );
}

// Hook para usar la lista y las acciones desde cualquier componente
export const useAlquiler = () => useContext(ContextoAlquiler);
