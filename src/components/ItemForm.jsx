// ============================================================
// ItemForm — Formulario para crear y editar artículos
// Responsable: Persona 1
// ============================================================
// Es un formulario CONTROLADO: el valor de cada campo vive en el estado
// de React (estado_formulario) y se actualiza con cada tecla.
//
// Props:
//   datos_iniciales     -> valores con los que arranca (vacío al crear, el artículo al editar)
//   al_enviar_formulario -> función que recibe los datos cuando se guarda
//   texto_boton_enviar  -> texto del botón ("Crear", "Guardar cambios")
import { useState } from 'react';

const FORMULARIO_VACIO = {
  nombre: '',
  tipo: 'Libro',
  categoria: '',
  disponible: true,
};

export default function ItemForm({
  datos_iniciales = FORMULARIO_VACIO,
  al_enviar_formulario,
  texto_boton_enviar = 'Guardar',
}) {
  const [estado_formulario, establecer_estado_formulario] = useState(datos_iniciales);
  const [mensaje_error, establecer_mensaje_error] = useState('');

  // Se ejecuta cada vez que el usuario escribe o cambia un campo.
  // Usa el atributo "name" del campo para saber cuál valor actualizar.
  const manejar_cambio_campo = (evento) => {
    const { name: nombre_campo, value: valor_campo, type: tipo_campo, checked: casilla_marcada } = evento.target;
    establecer_estado_formulario({
      ...estado_formulario,
      [nombre_campo]: tipo_campo === 'checkbox' ? casilla_marcada : valor_campo,
    });
  };

  // Se ejecuta al presionar el botón de guardar
  const manejar_envio_formulario = (evento) => {
    evento.preventDefault(); // evita que el navegador recargue la página

    // Validación: nombre y categoría son obligatorios
    if (!estado_formulario.nombre.trim() || !estado_formulario.categoria.trim()) {
      establecer_mensaje_error('Completa el nombre y la categoría.');
      return;
    }

    establecer_mensaje_error('');
    al_enviar_formulario(estado_formulario);
  };

  return (
    <form className="formulario" onSubmit={manejar_envio_formulario}>
      <label>
        Nombre
        <input
          name="nombre"
          value={estado_formulario.nombre}
          onChange={manejar_cambio_campo}
          placeholder="Ej: Clean Code"
        />
      </label>

      <label>
        Tipo
        <select name="tipo" value={estado_formulario.tipo} onChange={manejar_cambio_campo}>
          <option value="Libro">Libro</option>
          <option value="Dispositivo">Dispositivo</option>
        </select>
      </label>

      <label>
        Categoría
        <input
          name="categoria"
          value={estado_formulario.categoria}
          onChange={manejar_cambio_campo}
          placeholder="Ej: Programación"
        />
      </label>

      <label className="campo_casilla">
        <input
          name="disponible"
          type="checkbox"
          checked={estado_formulario.disponible}
          onChange={manejar_cambio_campo}
        />
        Disponible
      </label>

      {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}

      <button type="submit" className="boton boton_primario">{texto_boton_enviar}</button>
    </form>
  );
}
