// ============================================================
// AuthLayout — Estructura de tarjeta centrada (sin Navbar ni Footer)
// ============================================================
// Hoy la usa la página 404.
import { Outlet, Link } from 'react-router-dom';
import { useTema } from '../context/ThemeContext';

export default function AuthLayout() {
  const { tema_actual, alternar_tema } = useTema();

  const texto_boton_tema_oscuro_o_claro =
    tema_actual === 'claro' ? '🌙 Oscuro' : '☀️ Claro';

  return (
    <div className="pagina_centrada">
      <div className="cabecera_centrada">
        <Link to="/" className="marca_sitio">📚 EduLoan</Link>
        <button className="boton boton_secundario" onClick={alternar_tema}>
          {texto_boton_tema_oscuro_o_claro}
        </button>
      </div>
      <div className="tarjeta_centrada">
        <Outlet />
      </div>
    </div>
  );
}