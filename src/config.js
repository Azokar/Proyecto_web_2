// ============================================================
// config.js — URLs de los servicios
// ============================================================
// En local se usan los puertos por defecto. En Vercel se definen las variables
// VITE_API_URL y VITE_GRAFICAS_URL (ver .env.example).
const quitar_barra_final = (url) => url.replace(/\/+$/, '');

// API de Java (Spring Boot)
export const API_URL = quitar_barra_final(import.meta.env.VITE_API_URL ?? 'http://localhost:8080');

// Microservicio de Python que dibuja las gráficas
export const GRAFICAS_URL = quitar_barra_final(import.meta.env.VITE_GRAFICAS_URL ?? 'http://localhost:8000');
