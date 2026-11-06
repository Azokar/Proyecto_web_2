// ============================================================
// Sidebar — Navegación lateral (usuarios con sesión)
// ============================================================
// Grupos: general, biblioteca y administración (este último solo para el rol ADMIN).
// Abajo: quién está conectado, cambio de tema y cierre de sesión.
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTema } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Marca from './Marca';

// NavLink nos dice si el enlace corresponde a la página actual (esta_activo)
const clase_enlace = ({ isActive: esta_activo }) => `enlace_nav ${esta_activo ? 'enlace_activo' : ''}`;

export default function Sidebar() {
  const { tema_actual, alternar_tema } = useTema();
  const { usuario_actual, es_admin, cerrar_sesion } = useAuth();
  const navegar_a_otra_pagina = useNavigate();

  const manejar_cierre_sesion = () => {
    cerrar_sesion();
    navegar_a_otra_pagina('/');
  };

  return (
    <aside className="barra_lateral">
      <Link to="/" className="marca_sitio">
        <Marca />
        EduLoan
      </Link>

      <nav>
        <div className="grupo_navegacion">
          {/* "end" evita que "Inicio" quede activo en todas las rutas */}
          <NavLink to="/" end className={clase_enlace}>Inicio</NavLink>
          <NavLink to="/perfil" className={clase_enlace}>Mi perfil</NavLink>
        </div>

        <div className="grupo_navegacion">
          <span className="titulo_grupo">Biblioteca</span>
          <NavLink to="/catalogo" className={clase_enlace}>Catálogo</NavLink>
          <NavLink to="/mis-reservas" className={clase_enlace}>Mis reservas</NavLink>
        </div>

        {es_admin && (
          <div className="grupo_navegacion">
            <span className="titulo_grupo">Administración</span>
            <NavLink to="/crear" className={clase_enlace}>Publicar artículo</NavLink>
            <NavLink to="/admin/reservas" className={clase_enlace}>Reservas</NavLink>
            <NavLink to="/admin/estadisticas" className={clase_enlace}>Estadísticas</NavLink>
          </div>
        )}
      </nav>

      <div className="pie_lateral">
        <div className="datos_sesion">
          <strong>{usuario_actual.usuario}</strong>
          <span>{es_admin ? 'Administrador' : 'Usuario'}</span>
        </div>
        <div className="acciones_sesion">
          <button className="boton boton_secundario boton_pequeno" onClick={alternar_tema}>
            {tema_actual === 'claro' ? 'Tema oscuro' : 'Tema claro'}
          </button>
          <button className="boton boton_secundario boton_pequeno" onClick={manejar_cierre_sesion}>Salir</button>
        </div>
      </div>
    </aside>
  );
}
