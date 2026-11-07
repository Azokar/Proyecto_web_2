// ============================================================
// Página: Registro
// ============================================================
// Solo pide usuario y contraseña. La cuenta nueva siempre es de rol USER
// y queda con la sesión iniciada.
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  useTituloPagina('Registrarse');
  const { esta_autenticado, registrarse } = useAuth();
  const navegar_a_otra_pagina = useNavigate();

  const [usuario, establecer_usuario] = useState('');
  const [contrasena, establecer_contrasena] = useState('');
  const [mensaje_error, establecer_mensaje_error] = useState('');
  const [enviando, establecer_enviando] = useState(false);

  if (esta_autenticado) return <Navigate to="/catalogo" replace />;

  const manejar_envio = async (evento) => {
    evento.preventDefault();
    establecer_mensaje_error('');
    establecer_enviando(true);
    try {
      await registrarse(usuario.trim(), contrasena);
      navegar_a_otra_pagina('/catalogo', { replace: true });
    } catch (error) {
      establecer_mensaje_error(error.message);
      establecer_enviando(false);
    }
  };

  return (
    <section>
      <h1>Crear cuenta</h1>
      <form className="formulario" onSubmit={manejar_envio}>
        <label>
          Usuario
          <input
            value={usuario}
            onChange={(e) => establecer_usuario(e.target.value)}
            autoComplete="username"
            minLength={3}
            maxLength={50}
            placeholder="Mínimo 3 caracteres"
            required
            autoFocus
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={contrasena}
            onChange={(e) => establecer_contrasena(e.target.value)}
            autoComplete="new-password"
            minLength={4}
            maxLength={100}
            placeholder="Mínimo 4 caracteres"
            required
          />
        </label>
        {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}
        <button type="submit" className="boton boton_primario" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>
      <p className="texto_atenuado">¿Ya tienes cuenta? <Link to="/entrar">Entra aquí</Link></p>
    </section>
  );
}
