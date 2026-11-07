
export default function Footer() {
  const anio_actual = new Date().getFullYear();

  return (
    <footer className="pie_de_pagina">
      <div className="contenedor_centrado">
        <p>© {anio_actual} EduLoan · Préstamo gratuito de libros y dispositivos · Sin ánimo de lucro</p>
      </div>
    </footer>
  );
}