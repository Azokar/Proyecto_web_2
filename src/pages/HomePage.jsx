// ============================================================
// Página: Inicio
// ============================================================
import { Link } from 'react-router-dom';
import useTituloPagina from '../hooks/useTituloPagina';
import { useAlquiler } from '../context/RentalContext';

export default function HomePage() {
  useTituloPagina('Inicio');
  const { lista_articulos } = useAlquiler();

  // Estadísticas calculadas a partir de la lista global
  const total_articulos = lista_articulos.length;
  const cantidad_disponibles = lista_articulos.filter((articulo) => articulo.disponible).length;
  const cantidad_alquilados = total_articulos - cantidad_disponibles;

  return (
    <section>
      <div className="portada_inicio">
        <h1>Préstamo gratuito de libros y dispositivos</h1>
        <p>EduLoan es una plataforma sin ánimo de lucro para estudiantes y docentes.</p>
        <div className="acciones_portada">
          <Link to="/catalogo" className="boton boton_primario">Ver catálogo</Link>
          <Link to="/crear" className="boton boton_secundario">Publicar artículo</Link>
        </div>
      </div>

      <div className="estadisticas">
        <div className="estadistica"><strong>{total_articulos}</strong><span>Artículos</span></div>
        <div className="estadistica"><strong>{cantidad_disponibles}</strong><span>Disponibles</span></div>
        <div className="estadistica"><strong>{cantidad_alquilados}</strong><span>Alquilados</span></div>
      </div>
    </section>
  );
}
