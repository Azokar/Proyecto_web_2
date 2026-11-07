// ============================================================
// api.js — Cliente HTTP para la API de NEXOU
// ============================================================
// Agrega el token de la sesión a cada petición y convierte los errores de la API
// ({"mensaje": "..."}) en un Error normal de JavaScript para mostrarlo al usuario.
import { API_URL } from '../config';

const CLAVE_SESION = 'eduloan_sesion';

// La sesión ({ token, usuario }) se guarda en localStorage para que sobreviva a recargar la página
export function leer_sesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}

export function guardar_sesion(sesion) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    /* sin almacenamiento disponible: la sesión dura solo mientras la pestaña esté abierta */
  }
}

export function borrar_sesion() {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    /* nada que borrar */
  }
}

// cuerpo     -> objeto que se envía como JSON
// formulario -> FormData (para subir archivos). No se fija Content-Type: el navegador agrega
//               el "boundary" del multipart y, si lo pusiéramos nosotros, la subida fallaría.
export async function llamar_api(ruta, { metodo = 'GET', cuerpo, formulario } = {}) {
  const sesion = leer_sesion();
  const cabeceras = {};
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';
  if (sesion?.token) cabeceras.Authorization = `Bearer ${sesion.token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: formulario ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Si estaba inactivo puede tardar hasta un minuto en despertar; intenta de nuevo.');
  }

  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // Token vencido o inválido: se cierra la sesión (AuthContext escucha este evento)
    if (respuesta.status === 401 && sesion) {
      borrar_sesion();
      window.dispatchEvent(new Event('sesion_expirada'));
    }
    throw new Error(datos?.mensaje ?? `Error ${respuesta.status}`);
  }
  return datos;
}
