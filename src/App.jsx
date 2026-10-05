// ============================================================
// App.jsx — Componente raíz
// ============================================================
// Envuelve toda la aplicación con los Providers (estado global).
// Todo lo que esté dentro puede usar el tema y la lista de artículos
// sin pasarlos por props (evita el "props drilling").
import { ThemeProvider } from './context/ThemeContext';
import { RentalProvider } from './context/RentalContext';
import AppRoutes from './routes/routes';

export default function App() {
  return (
    <ThemeProvider>
      <RentalProvider>
        <AppRoutes />
      </RentalProvider>
    </ThemeProvider>
  );
}
