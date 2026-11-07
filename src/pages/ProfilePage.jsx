// ============================================================
// Página: Mi perfil
// ============================================================
// El registro solo pide usuario y contraseña. Aquí cada persona puede indicar, si quiere, su
// semestre y su programa: la biblioteca los usa (sin nombres) para las estadísticas de uso.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAuth } from '../context/AuthContext';
import { useAvisos } from '../context/AvisosContext';

const SEMESTRES = Array.from({ length: 12 }, (_, indice) => indice + 1);

export default function ProfilePage() {
  useTituloPagina('Mi perfil');
  const { usuario_actual, actualizar_perfil } = useAuth();
  const { avisar } = useAvisos();
  const navegar_a_otra_pagina = useNavigate();

  const [semestre, establecer_semestre] = useState(usuario_actual.semestre ? String(usuario_actual.semestre) : '');
  const [programa, establecer_programa] = useState(usuario_actual.programa ?? '');
  const [mensaje_error, establecer_mensaje_error] = useState('');
  const [guardando, establecer_guardando] = useState(false);

  const manejar_envio = async (evento) => {
    evento.preventDefault();
    establecer_mensaje_error('');
    establecer_guardando(true);
    try {
      await actualizar_perfil(semestre ? Number(semestre) : null, programa.trim() || null);
      avisar('Perfil actualizado');
      navegar_a_otra_pagina('/');
    } catch (error) {
      establecer_mensaje_error(error.message);
      establecer_guardando(false);
    }
  };

  return (
    <section className="contenedor_estrecho">
      <h1>Mi perfil</h1>
      <p className="subtitulo_pagina">
        Usuario: <strong>{usuario_actual.usuario}</strong>. Completar estos datos es opcional y ayuda a la
        biblioteca a saber qué necesita cada semestre y programa.
      </p>

      <form className="formulario" onSubmit={manejar_envio}>
        <label>
          Semestre
          <select value={semestre} onChange={(e) => establecer_semestre(e.target.value)}>
            <option value="">Prefiero no indicarlo</option>
            {SEMESTRES.map((numero) => <option key={numero} value={numero}>Semestre {numero}</option>)}
          </select>
        </label>
        <label>
          Programa académico
          <input value={programa} maxLength={100} onChange={(e) => establecer_programa(e.target.value)} placeholder="Ej: Desarrollo de Software" />
        </label>
        {mensaje_error && <p className="mensaje_error">{mensaje_error}</p>}
        <button type="submit" className="boton boton_primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </section>
  );
}
