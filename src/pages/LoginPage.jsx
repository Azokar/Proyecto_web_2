// ============================================================
// Página: Iniciar sesión
// ============================================================
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  useTituloPagina('Entrar');
  const { esta_autenticado, iniciar_sesion } = useAuth();
  const navegar_a_otra_pagina = useNavigate();
  const ubicacion_actual = useLocation();

  const [usuario, establecer_usuario] = useState('');
  const [contrasena, establecer_contrasena] = useState('');
  const [mensaje_error, establecer_mensaje_error] = useState('');
  const [enviando, establecer_enviando] = useState(false);

  // Si el usuario venía de una ruta protegida, vuelve a ella; si no, va al catálogo
  const destino = ubicacion_actual.state?.desde ?? '/catalogo';

  if (esta_autenticado) return <Navigate to={destino} replace />;

  const manejar_envio = async (evento) => {
    evento.preventDefault();
    establecer_mensaje_error('');
    establecer_enviando(true);
    try {
      await iniciar_sesion(usuario.trim(), contrasena);
      navegar_a_otra_pagina(destino, { replace: true });
    } catch (error) {
      establecer_mensaje_error(error.message);
      establecer_enviando(false);
    }
  };

  return (
    <section>
      <h1>Entrar</h1>
      <form className="formulario" onSubmit={manejar_envio}>
        <label>
          Usuario
          <input value={usuario} onChange={(e) => establecer_usuario(e.target.value)} autoComplete="username" required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={contrasena} onChange={(e) => establecer_contrasena(e.target.value)} autoComplete="current-password" required />
        </label>
        {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}
        <button type="submit" className="boton boton_primario" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="texto_atenuado">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </section>
  );
}
