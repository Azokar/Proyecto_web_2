// ============================================================
// MainLayout — Estructura principal de las páginas
// ============================================================
// Arriba: Navbar | Centro: la página de la ruta actual | Abajo: Footer
import { Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="contenedor_pagina">
      <Navbar />
      <main className="contenedor_centrado contenido_principal">
        {/* Outlet = aquí se dibuja la página que corresponde a la ruta */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}