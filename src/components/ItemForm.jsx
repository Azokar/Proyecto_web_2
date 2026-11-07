// ============================================================
// ItemForm — Formulario para crear y editar artículos (solo ADMIN)
// ============================================================
// Es un formulario CONTROLADO: el valor de cada campo vive en el estado
// de React (estado_formulario) y se actualiza con cada tecla.
// Un artículo puede ser un Libro o un Dispositivo, y cada tipo pide campos distintos.
//
// Props:
//   articulo_inicial     -> artículo normalizado al editar (null al crear)
//   al_enviar_formulario -> recibe (tipo, datos_api, { archivo, quitar }) cuando se guarda;
//                           'archivo' es la foto nueva (ya reducida) y 'quitar' pide borrar la actual
//   texto_boton_enviar   -> texto del botón ("Crear", "Guardar cambios")
import { useEffect, useRef, useState } from 'react';
import { llamar_api } from '../services/api';
import { reducir_imagen, TIPOS_ACEPTADOS_TEXTO } from '../services/imagenes';

const FORMULARIO_VACIO = {
  tipo: 'Libro',
  nombre: '',
  cantidadTotal: 1,
  activo: true,
  // Libro
  autor: '',
  editorial: '',
  isbn: '',
  diasPrestamoMax: 14,
  categoriaIds: [],
  // Dispositivo
  marca: '',
  modelo: '',
  tipoEquipo: '',
  duracionMaximaHrs: 4,
};

// Convierte un artículo de la API en el estado del formulario
function formulario_desde_articulo(articulo) {
  const datos = articulo.datos;
  if (articulo.tipo === 'Libro') {
    return {
      ...FORMULARIO_VACIO,
      tipo: 'Libro',
      nombre: datos.nomLibro,
      cantidadTotal: datos.cantidadTotal,
      activo: datos.estadoActivo,
      autor: datos.autor ?? '',
      editorial: datos.editorial ?? '',
      isbn: datos.isbn,
      diasPrestamoMax: datos.diasPrestamoMax,
      categoriaIds: datos.categorias.map((categoria) => categoria.id),
    };
  }
  return {
    ...FORMULARIO_VACIO,
    tipo: 'Dispositivo',
    nombre: datos.nomEquipo,
    cantidadTotal: datos.cantidadTotal,
    activo: datos.estadoActivo,
    marca: datos.marca ?? '',
    modelo: datos.modelo ?? '',
    tipoEquipo: datos.tipoEquipo ?? '',
    duracionMaximaHrs: datos.duracionMaximaHrs,
  };
}

export default function ItemForm({
  articulo_inicial = null,
  al_enviar_formulario,
  texto_boton_enviar = 'Guardar',
}) {
  const editando = Boolean(articulo_inicial);
  const [estado_formulario, establecer_estado_formulario] = useState(
    editando ? formulario_desde_articulo(articulo_inicial) : FORMULARIO_VACIO
  );
  const [mensaje_error, establecer_mensaje_error] = useState('');
  const [enviando, establecer_enviando] = useState(false);
  const [categorias, establecer_categorias] = useState([]);
  const [nombre_categoria_nueva, establecer_nombre_categoria_nueva] = useState('');

  // Foto: la actual del artículo (al editar), o la que el admin acaba de elegir
  const entrada_archivo = useRef(null);
  const [archivo_imagen, establecer_archivo_imagen] = useState(null);
  const [vista_previa, establecer_vista_previa] = useState(articulo_inicial?.imagen ?? null);
  const [quitar_imagen, establecer_quitar_imagen] = useState(false);
  const [procesando_imagen, establecer_procesando_imagen] = useState(false);

  const es_libro = estado_formulario.tipo === 'Libro';

  // Libera la vista previa local (blob) al cambiarla o al salir del formulario
  useEffect(() => {
    return () => {
      if (vista_previa?.startsWith('blob:')) URL.revokeObjectURL(vista_previa);
    };
  }, [vista_previa]);

  // Las categorías existentes se piden a la API (solo las usan los libros)
  useEffect(() => {
    llamar_api('/api/categorias').then(establecer_categorias).catch(() => {});
  }, []);

  // Se ejecuta cada vez que el usuario escribe o cambia un campo.
  // Usa el atributo "name" del campo para saber cuál valor actualizar.
  const manejar_cambio_campo = (evento) => {
    const { name: nombre_campo, value: valor_campo, type: tipo_campo, checked: casilla_marcada } = evento.target;
    establecer_estado_formulario({
      ...estado_formulario,
      [nombre_campo]: tipo_campo === 'checkbox' ? casilla_marcada : valor_campo,
    });
  };

  const alternar_categoria = (id_categoria) => {
    const ya_marcada = estado_formulario.categoriaIds.includes(id_categoria);
    establecer_estado_formulario({
      ...estado_formulario,
      categoriaIds: ya_marcada
        ? estado_formulario.categoriaIds.filter((id) => id !== id_categoria)
        : [...estado_formulario.categoriaIds, id_categoria],
    });
  };

  // Crea una categoría nueva en la API y la deja marcada
  const agregar_categoria_nueva = async () => {
    const nombre = nombre_categoria_nueva.trim();
    if (!nombre) return;
    try {
      const categoria_creada = await llamar_api('/api/categorias', { metodo: 'POST', cuerpo: { nombre } });
      establecer_categorias((anteriores) => [...anteriores, categoria_creada]);
      establecer_estado_formulario((anterior) => ({
        ...anterior,
        categoriaIds: [...anterior.categoriaIds, categoria_creada.id],
      }));
      establecer_nombre_categoria_nueva('');
    } catch (error) {
      establecer_mensaje_error(error.message);
    }
  };

  // El admin elige una foto: se reduce en el navegador y se muestra la vista previa
  const manejar_seleccion_imagen = async (evento) => {
    const archivo_elegido = evento.target.files?.[0];
    evento.target.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo_elegido) return;

    establecer_mensaje_error('');
    establecer_procesando_imagen(true);
    try {
      const archivo_reducido = await reducir_imagen(archivo_elegido);
      establecer_archivo_imagen(archivo_reducido);
      establecer_vista_previa(URL.createObjectURL(archivo_reducido));
      establecer_quitar_imagen(false);
    } catch (error) {
      establecer_mensaje_error(error.message);
    } finally {
      establecer_procesando_imagen(false);
    }
  };

  const manejar_quitar_imagen = () => {
    establecer_archivo_imagen(null);
    establecer_vista_previa(null);
    // Solo hay que borrar en la API si el artículo ya tenía una foto guardada
    establecer_quitar_imagen(Boolean(articulo_inicial?.imagen));
  };

  // Arma el cuerpo que espera la API. Al editar, las unidades disponibles se ajustan por la
  // diferencia del total, así se conserva la cuenta de lo que está prestado.
  const construir_datos_api = () => {
    const f = estado_formulario;
    const total = Number(f.cantidadTotal);
    const original = editando ? articulo_inicial.datos : null;
    const disponibles = editando
      ? Math.max(0, Math.min(total, original.cantidadDisponible + (total - original.cantidadTotal)))
      : total;

    if (es_libro) {
      return {
        nomLibro: f.nombre.trim(),
        autor: f.autor.trim() || null,
        editorial: f.editorial.trim() || null,
        isbn: f.isbn.trim(),
        cantidadTotal: total,
        cantidadDisponible: disponibles,
        diasPrestamoMax: Number(f.diasPrestamoMax),
        categoriaIds: f.categoriaIds,
        ubicacion: original?.ubicacion ?? null, // la API reemplaza la ubicación: se conserva la actual
        estadoActivo: f.activo,
      };
    }
    return {
      nomEquipo: f.nombre.trim(),
      marca: f.marca.trim() || null,
      modelo: f.modelo.trim() || null,
      tipoEquipo: f.tipoEquipo.trim() || null,
      cantidadTotal: total,
      cantidadDisponible: disponibles,
      duracionMaximaHrs: Number(f.duracionMaximaHrs),
      estadoEquipo: original?.estadoEquipo ?? 'Operativo',
      estadoActivo: f.activo,
    };
  };

  // Se ejecuta al presionar el botón de guardar
  const manejar_envio_formulario = async (evento) => {
    evento.preventDefault(); // evita que el navegador recargue la página

    // Validación básica: el resto (ISBN repetido, cantidades…) lo valida la API
    if (!estado_formulario.nombre.trim()) {
      establecer_mensaje_error('Escribe el nombre del artículo.');
      return;
    }
    if (es_libro && !estado_formulario.isbn.trim()) {
      establecer_mensaje_error('El ISBN es obligatorio para los libros.');
      return;
    }

    establecer_mensaje_error('');
    establecer_enviando(true);
    try {
      await al_enviar_formulario(estado_formulario.tipo, construir_datos_api(), {
        archivo: archivo_imagen,
        quitar: quitar_imagen,
      });
    } catch (error) {
      establecer_mensaje_error(error.message);
      establecer_enviando(false);
    }
  };

  return (
    <form className="formulario" onSubmit={manejar_envio_formulario}>
      <div className="campo_imagen">
        <span className="etiqueta_campo">Imagen</span>
        <div className="vista_previa_imagen">
          {vista_previa ? (
            <img src={vista_previa} alt="Vista previa del artículo" />
          ) : (
            <span className="texto_atenuado">Sin imagen</span>
          )}
        </div>
        <div className="acciones_imagen">
          <input ref={entrada_archivo} type="file" accept="image/jpeg,image/png,image/webp" onChange={manejar_seleccion_imagen} hidden />
          <button type="button" className="boton boton_secundario boton_pequeno" onClick={() => entrada_archivo.current?.click()} disabled={procesando_imagen}>
            {procesando_imagen ? 'Procesando…' : vista_previa ? 'Cambiar imagen' : 'Elegir imagen'}
          </button>
          {vista_previa && (
            <button type="button" className="boton boton_peligro boton_pequeno" onClick={manejar_quitar_imagen}>Quitar</button>
          )}
        </div>
        <small className="texto_atenuado">{TIPOS_ACEPTADOS_TEXTO}. Se ajusta automáticamente a un tamaño liviano.</small>
      </div>

      <label>
        Tipo
        {/* Al editar no se puede cambiar el tipo: un libro no se convierte en equipo */}
        <select name="tipo" value={estado_formulario.tipo} onChange={manejar_cambio_campo} disabled={editando}>
          <option value="Libro">Libro</option>
          <option value="Dispositivo">Dispositivo</option>
        </select>
      </label>

      <label>
        Nombre
        <input
          name="nombre"
          value={estado_formulario.nombre}
          onChange={manejar_cambio_campo}
          placeholder={es_libro ? 'Ej: Clean Code' : 'Ej: Portátil Lenovo'}
        />
      </label>

      {es_libro ? (
        <>
          <label>
            Autor
            <input name="autor" value={estado_formulario.autor} onChange={manejar_cambio_campo} />
          </label>
          <label>
            Editorial
            <input name="editorial" value={estado_formulario.editorial} onChange={manejar_cambio_campo} />
          </label>
          <label>
            ISBN
            <input name="isbn" value={estado_formulario.isbn} onChange={manejar_cambio_campo} placeholder="978-..." />
          </label>
          <label>
            Días máximos de préstamo
            <input name="diasPrestamoMax" type="number" min="1" value={estado_formulario.diasPrestamoMax} onChange={manejar_cambio_campo} />
          </label>

          <fieldset className="grupo_categorias">
            <legend>Categorías</legend>
            {categorias.map((categoria) => (
              <label key={categoria.id} className="campo_casilla">
                <input
                  type="checkbox"
                  checked={estado_formulario.categoriaIds.includes(categoria.id)}
                  onChange={() => alternar_categoria(categoria.id)}
                />
                {categoria.nombre}
              </label>
            ))}
            <div className="fila_categoria_nueva">
              <input
                value={nombre_categoria_nueva}
                onChange={(evento) => establecer_nombre_categoria_nueva(evento.target.value)}
                placeholder="Nueva categoría"
              />
              <button type="button" className="boton boton_secundario" onClick={agregar_categoria_nueva}>Agregar</button>
            </div>
          </fieldset>
        </>
      ) : (
        <>
          <label>
            Marca
            <input name="marca" value={estado_formulario.marca} onChange={manejar_cambio_campo} />
          </label>
          <label>
            Modelo
            <input name="modelo" value={estado_formulario.modelo} onChange={manejar_cambio_campo} />
          </label>
          <label>
            Tipo de equipo
            <input name="tipoEquipo" value={estado_formulario.tipoEquipo} onChange={manejar_cambio_campo} placeholder="Ej: Portátil, Tablet, Proyector" />
          </label>
          <label>
            Horas máximas de préstamo
            <input name="duracionMaximaHrs" type="number" min="0.5" step="0.5" value={estado_formulario.duracionMaximaHrs} onChange={manejar_cambio_campo} />
          </label>
        </>
      )}

      <label>
        Cantidad total
        <input name="cantidadTotal" type="number" min="1" value={estado_formulario.cantidadTotal} onChange={manejar_cambio_campo} />
      </label>

      <label className="campo_casilla">
        <input name="activo" type="checkbox" checked={estado_formulario.activo} onChange={manejar_cambio_campo} />
        Visible para los usuarios
      </label>

      {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}

      <button type="submit" className="boton boton_primario" disabled={enviando}>
        {enviando ? 'Guardando…' : texto_boton_enviar}
      </button>
    </form>
  );
}
