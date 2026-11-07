// ============================================================
// routes.jsx — Definición de todas las rutas de la SPA
// ============================================================
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import RutaProtegida from '../components/RutaProtegida';

import HomePage from '../pages/HomePage';
import CatalogPage from '../pages/CatalogPage';
import CreateItemPage from '../pages/CreateItemPage';
import EditItemPage from '../pages/EditItemPage';
import MyReservationsPage from '../pages/MyReservationsPage';
import AdminReservationsPage from '../pages/AdminReservationsPage';
import StatsPage from '../pages/StatsPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Páginas con barra de navegación y pie de página (MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        {/* Requieren sesión (cualquier rol) */}
        <Route element={<RutaProtegida />}>
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/mis-reservas" element={<MyReservationsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>

        {/* Solo ADMIN */}
        <Route element={<RutaProtegida solo_admin />}>
          <Route path="/crear" element={<CreateItemPage />} />
          {/* ":tipo" e ":id_articulo" son parámetros dinámicos, ej: /editar/Libro/3 */}
          <Route path="/editar/:tipo/:id_articulo" element={<EditItemPage />} />
          <Route path="/admin/reservas" element={<AdminReservationsPage />} />
          <Route path="/admin/estadisticas" element={<StatsPage />} />
        </Route>
      </Route>

      {/* Páginas centradas en una tarjeta, sin barra de navegación (AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        {/* "*" captura cualquier ruta que no exista */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
