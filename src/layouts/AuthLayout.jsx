// ============================================================
// AuthLayout — Columna centrada y sin barra de navegación
// ============================================================
// La usan el inicio de sesión, el registro y la página 404.
import { Outlet, Link } from 'react-router-dom';
import { useTema } from '../context/ThemeContext';
import Marca from '../components/Marca';

export default function AuthLayout() {
  const { tema_actual, alternar_tema } = useTema();

  return (
    <div className="pagina_centrada">
      <div className="cabecera_centrada">
        <Link to="/" className="marca_sitio">
          <Marca />
          EduLoan
        </Link>
        <button className="boton boton_secundario boton_pequeno" onClick={alternar_tema}>
          {tema_actual === 'claro' ? 'Tema oscuro' : 'Tema claro'}
        </button>
      </div>
      <div className="tarjeta_centrada">
        <Outlet />
      </div>
    </div>
  );
}
