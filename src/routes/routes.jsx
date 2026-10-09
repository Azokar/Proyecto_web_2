// ============================================================
// routes.jsx — Definición de todas las rutas de la SPA
// ============================================================
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import HomePage from '../pages/HomePage';
import CatalogPage from '../pages/CatalogPage';
import CreateItemPage from '../pages/CreateItemPage';
import EditItemPage from '../pages/EditItemPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Páginas con barra de navegación y pie de página (MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/crear" element={<CreateItemPage />} />
        {/* ":id_articulo" es un parámetro dinámico de la URL, ej: /editar/3 */}
        <Route path="/editar/:id_articulo" element={<EditItemPage />} />
      </Route>

      {/* Páginas centradas en una tarjeta, sin barra de navegación (AuthLayout) */}
      <Route element={<AuthLayout />}>
        {/* "*" captura cualquier ruta que no exista */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
