// ============================================================
// Navbar — Barra de navegación superior
// ============================================================
// Contiene: logo, enlaces a las páginas y el botón de tema claro/oscuro.
import { NavLink, Link } from 'react-router-dom';
import { useTema } from '../context/ThemeContext';

// NavLink nos dice si el enlace corresponde a la página actual (esta_activo)
const clase_enlace_navegacion = ({ isActive: esta_activo }) =>
  esta_activo ? 'enlace_activo' : '';

export default function Navbar() {
  const { tema_actual, alternar_tema } = useTema();

  // Si el tema es claro, el botón ofrece pasar a oscuro, y viceversa
  const texto_boton_tema_oscuro_o_claro =
    tema_actual === 'claro' ? '🌙 Oscuro' : '☀️ Claro';

  return (
    <header className="barra_navegacion">
      <div className="contenedor_centrado barra_navegacion_interior">
        <Link to="/" className="marca_sitio">📚 EduLoan</Link>

        <nav className="enlaces_navegacion">
          {/* "end" evita que "Inicio" quede activo en todas las rutas */}
          <NavLink to="/" end className={clase_enlace_navegacion}>Inicio</NavLink>
          <NavLink to="/catalogo" className={clase_enlace_navegacion}>Catálogo</NavLink>
          <NavLink to="/crear" className={clase_enlace_navegacion}>Crear artículo</NavLink>
        </nav>

        <button className="boton boton_secundario" onClick={alternar_tema}>
          {texto_boton_tema_oscuro_o_claro}
        </button>
      </div>
    </header>
  );
}