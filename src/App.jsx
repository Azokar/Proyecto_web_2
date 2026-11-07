// ============================================================
// App.jsx — Componente raíz
// ============================================================
// Envuelve toda la aplicación con los Providers (estado global).
// Todo lo que esté dentro puede usar el tema, la sesión y el catálogo
// sin pasarlos por props (evita el "props drilling").
// El orden importa: RentalProvider necesita la sesión, por eso va dentro de AuthProvider.
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { RentalProvider } from './context/RentalContext';
import { AvisosProvider } from './context/AvisosContext';
import AppRoutes from './routes/routes';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RentalProvider>
          <AvisosProvider>
            <AppRoutes />
          </AvisosProvider>
        </RentalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
