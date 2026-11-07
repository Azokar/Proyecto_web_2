// ============================================================
// RutaProtegida — Guarda de rutas
// ============================================================
// Se usa como "element" de una ruta padre: si el usuario cumple, dibuja las rutas hijas (Outlet);
// si no, lo redirige. Con solo_admin también exige rol ADMIN.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ solo_admin = false }) {
  const { esta_autenticado, es_admin } = useAuth();
  const ubicacion_actual = useLocation();

  // Sin sesión: al login, recordando a dónde quería ir
  if (!esta_autenticado) {
    return <Navigate to="/entrar" replace state={{ desde: ubicacion_actual.pathname }} />;
  }
  // Con sesión pero sin permiso de administrador: al inicio
  if (solo_admin && !es_admin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
