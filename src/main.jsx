// ============================================================
// main.jsx — Punto de entrada de la aplicación
// ============================================================
// Aquí React "se monta" dentro del <div id="root"> de index.html.
// BrowserRouter activa la navegación sin recargar la página (React Router DOM).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

const elemento_raiz_html = document.getElementById('root');

createRoot(elemento_raiz_html).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
