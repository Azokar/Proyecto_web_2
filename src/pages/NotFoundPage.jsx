// ============================================================
// Página: 404 — No encontrada
// ============================================================
import { Link } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';

export default function NotFoundPage() {
  useTituloPagina('Página no encontrada');

  return (
    <>
      <h1>404</h1>
      <p>La página que buscas no existe.</p>
      <Link to="/" className="boton boton_primario">Ir al inicio</Link>
    </>
  );
}