// ============================================================
// AuthContext — Sesión del usuario (login, registro y rol)
// ============================================================
// Se consume con useAuth(): { usuario_actual, esta_autenticado, es_admin,
//                             iniciar_sesion, registrarse, actualizar_perfil, cerrar_sesion }
// Hay 2 roles: 'ADMIN' (publica artículos) y 'USER' (reserva artículos).
import { createContext, useContext, useEffect, useState } from 'react';
import { borrar_sesion, guardar_sesion, leer_sesion, llamar_api } from '../services/api';

const ContextoAuth = createContext();

export function AuthProvider({ children }) {
  const [sesion, establecer_sesion] = useState(leer_sesion);

  // Si la API responde 401 (token vencido), llamar_api avisa con este evento
  useEffect(() => {
    const al_expirar_sesion = () => establecer_sesion(null);
    window.addEventListener('sesion_expirada', al_expirar_sesion);
    return () => window.removeEventListener('sesion_expirada', al_expirar_sesion);
  }, []);

  // Tanto el login como el registro devuelven { token, usuario }
  const abrir_sesion = (respuesta) => {
    const nueva_sesion = { token: respuesta.token, usuario: respuesta.usuario };
    guardar_sesion(nueva_sesion);
    establecer_sesion(nueva_sesion);
    return respuesta.usuario;
  };

  const iniciar_sesion = async (usuario, contrasena) =>
    abrir_sesion(await llamar_api('/api/auth/login', { metodo: 'POST', cuerpo: { usuario, contrasena } }));

  // Registro: solo usuario y contraseña
  const registrarse = async (usuario, contrasena) =>
    abrir_sesion(await llamar_api('/api/auth/registro', { metodo: 'POST', cuerpo: { usuario, contrasena } }));

  // Perfil opcional (semestre y programa): la API devuelve el usuario actualizado y se guarda en la sesión
  const actualizar_perfil = async (semestre, programa) => {
    const usuario = await llamar_api('/api/auth/perfil', { metodo: 'PUT', cuerpo: { semestre, programa } });
    const nueva_sesion = { token: sesion.token, usuario };
    guardar_sesion(nueva_sesion);
    establecer_sesion(nueva_sesion);
  };

  const cerrar_sesion = () => {
    borrar_sesion();
    establecer_sesion(null);
  };

  const usuario_actual = sesion?.usuario ?? null;

  return (
    <ContextoAuth.Provider
      value={{
        usuario_actual,
        esta_autenticado: Boolean(sesion?.token),
        es_admin: usuario_actual?.rol === 'ADMIN',
        iniciar_sesion,
        registrarse,
        actualizar_perfil,
        cerrar_sesion,
      }}
    >
      {children}
    </ContextoAuth.Provider>
  );
}

export const useAuth = () => useContext(ContextoAuth);
