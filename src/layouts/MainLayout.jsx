// ============================================================
// MainLayout — Estructura principal de las páginas
// ============================================================
// Con sesión: barra lateral a la izquierda y la página a la derecha.
// Sin sesión: una cabecera simple con el acceso (entrar / registrarse) y la página debajo.
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTema } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Marca from '../components/Marca';
import Footer from '../components/Footer';

export default function MainLayout() {
  const ubicacion_actual = useLocation();
  const { esta_autenticado } = useAuth();
  const { tema_actual, alternar_tema } = useTema();

  // key = ruta: al cambiar de página el contenedor se remonta y repite la animación de entrada
  const pagina = (
    <main className="contenido_principal">
      <div key={ubicacion_actual.pathname} className="pagina_animada">
        <Outlet />
      </div>
    </main>
  );

  if (esta_autenticado) {
    return (
      <div className="aplicacion">
        <Sidebar />
        <div className="columna_contenido">
          {pagina}
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="aplicacion publica">
      <div className="columna_contenido">
        <header className="cabecera_publica">
          <Link to="/" className="marca_sitio">
            <Marca />
            EduLoan
          </Link>
          <div className="acciones_sesion">
            <button className="boton boton_secundario boton_pequeno" onClick={alternar_tema}>
              {tema_actual === 'claro' ? 'Tema oscuro' : 'Tema claro'}
            </button>
            <Link to="/entrar" className="boton boton_secundario">Entrar</Link>
            <Link to="/registro" className="boton boton_primario">Registrarse</Link>
          </div>
        </header>
        {pagina}
        <Footer />
      </div>
    </div>
  );
}
