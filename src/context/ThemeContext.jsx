// ============================================================
// ThemeContext — Provider del tema claro / oscuro
// ============================================================
// Guarda cuál tema está activo y ofrece una función para cambiarlo.
// Cualquier componente puede leerlo con: const { tema_actual } = useTema();
import { createContext, useContext, useEffect, useState } from 'react';

const ContextoTema = createContext();

export function ThemeProvider({ children }) {
  // Valores posibles: 'claro' | 'oscuro'
  const [tema_actual, establecer_tema_actual] = useState('claro');

  // Cada vez que cambia el tema, lo escribimos en el <html>.
  // El CSS usa ese atributo (data-tema) para cambiar los colores.
  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema_actual);
  }, [tema_actual]);

  // Cambia de claro a oscuro y viceversa
  const alternar_tema = () => {
    establecer_tema_actual((tema_anterior) =>
      tema_anterior === 'claro' ? 'oscuro' : 'claro'
    );
  };

  return (
    <ContextoTema.Provider value={{ tema_actual, alternar_tema }}>
      {children}
    </ContextoTema.Provider>
  );
}

// Hook para usar el tema desde cualquier componente
export const useTema = () => useContext(ContextoTema);
