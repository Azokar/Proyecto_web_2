// ============================================================
// RentalContext — Estado global del CRUD de artículos
// ============================================================
// Simulación del "Nivel 3": los datos viven aquí, en memoria, hasta
// que se conecte el Backend. Al crear un artículo en el formulario,
// se guarda en esta lista y aparece al instante en el catálogo.
//
// CRUD:  Crear -> agregar_articulo        Leer -> lista_articulos / obtener_articulo_por_id
//        Actualizar -> actualizar_articulo   Eliminar -> eliminar_articulo
import { createContext, useContext, useState } from 'react';

const ContextoAlquiler = createContext();

// Datos de ejemplo con los que arranca la aplicación.
// tipo: 'Libro' | 'Dispositivo'      disponible: true = se puede alquilar
const ARTICULOS_INICIALES = [
  { id: 1, nombre: 'Clean Code', tipo: 'Libro', categoria: 'Programación', disponible: true },
  { id: 2, nombre: 'Laptop Dell XPS 13', tipo: 'Dispositivo', categoria: 'Laptops', disponible: true },
  { id: 3, nombre: 'Cálculo de Stewart', tipo: 'Libro', categoria: 'Ciencias Básicas', disponible: false },
  { id: 4, nombre: 'iPad 10ª generación', tipo: 'Dispositivo', categoria: 'Tablets', disponible: true },
];

export function RentalProvider({ children }) {
  const [lista_articulos, establecer_lista_articulos] = useState(ARTICULOS_INICIALES);

  // CREAR: agrega un artículo nuevo al final de la lista.
  // El id se genera con la hora actual para que sea único.
  const agregar_articulo = (datos_articulo_nuevo) => {
    const articulo_con_id = { ...datos_articulo_nuevo, id: Date.now() };
    establecer_lista_articulos((lista_anterior) => [...lista_anterior, articulo_con_id]);
  };

  // LEER (uno): busca un artículo por su id (el id de la URL llega como texto)
  const obtener_articulo_por_id = (id_articulo) =>
    lista_articulos.find((articulo) => articulo.id === Number(id_articulo));

  // ACTUALIZAR: reemplaza solo los campos que cambiaron
  const actualizar_articulo = (id_articulo, datos_modificados) => {
    establecer_lista_articulos((lista_anterior) =>
      lista_anterior.map((articulo) =>
        articulo.id === Number(id_articulo)
          ? { ...articulo, ...datos_modificados }
          : articulo
      )
    );
  };

  // ELIMINAR: deja en la lista todos los artículos menos el indicado
  const eliminar_articulo = (id_articulo) => {
    establecer_lista_articulos((lista_anterior) =>
      lista_anterior.filter((articulo) => articulo.id !== id_articulo)
    );
  };

  // ALQUILAR / DEVOLVER: invierte el valor de "disponible"
  const alternar_disponibilidad = (id_articulo) => {
    establecer_lista_articulos((lista_anterior) =>
      lista_anterior.map((articulo) =>
        articulo.id === id_articulo
          ? { ...articulo, disponible: !articulo.disponible }
          : articulo
      )
    );
  };

  return (
    <ContextoAlquiler.Provider
      value={{
        lista_articulos,
        agregar_articulo,
        obtener_articulo_por_id,
        actualizar_articulo,
        eliminar_articulo,
        alternar_disponibilidad,
      }}
    >
      {children}
    </ContextoAlquiler.Provider>
  );
}

// Hook para usar la lista y las acciones desde cualquier componente
export const useAlquiler = () => useContext(ContextoAlquiler);
