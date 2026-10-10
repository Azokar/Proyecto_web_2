# EduLoan — Proyecto Web 2

Plataforma sin ánimo de lucro para el préstamo de **libros** y **dispositivos**. Es una SPA hecha con React que permite consultar un catálogo de artículos, crearlos, editarlos y eliminarlos, y cambiar entre tema claro y oscuro.

> Por ahora los datos viven en memoria (Context API). Al recargar la página se vuelve a los artículos de ejemplo; la conexión con un backend queda para una etapa posterior.

## Tabla de contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación y uso](#instalación-y-uso)
- [Rutas](#rutas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Estado global](#estado-global)
- [Estado del proyecto](#estado-del-proyecto)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
- [Autor](#autor)

## Características

- **CRUD de artículos**: crear, listar, editar y eliminar libros y dispositivos.
- **Catálogo con filtros** por tipo de artículo (Libro / Dispositivo).
- **Página de inicio** con estadísticas del inventario.
- **Formulario controlado** reutilizable para crear y editar, con validación de campos obligatorios.
- **Tema claro y oscuro** mediante un atributo `data-tema` en el `<html>` y variables CSS.
- **Navegación sin recargas** con React Router, incluyendo rutas dinámicas y página 404.
- **Título de pestaña dinámico** por página (`Catálogo | EduLoan`).

## Tecnologías

| Herramienta | Versión | Uso |
| --- | --- | --- |
| [React](https://react.dev/) | 19 | Interfaz de usuario |
| [React Router DOM](https://reactrouter.com/) | 7 | Enrutamiento de la SPA |
| [Vite](https://vite.dev/) | 8 | Servidor de desarrollo y build |

## Requisitos

- [Node.js](https://nodejs.org/) en una versión LTS reciente (20.19+ o 22.12+)
- npm (incluido con Node.js)

## Instalación y uso

```bash
git clone https://github.com/Azokar/Proyecto_web_2.git
cd Proyecto_web_2
npm install
npm run dev
```

Luego abre la URL que muestra Vite en la terminal (por defecto `http://localhost:5173`).

| Script | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente el contenido de `dist/` |

## Rutas

| Ruta | Página | Layout |
| --- | --- | --- |
| `/` | Inicio con estadísticas | `MainLayout` |
| `/catalogo` | Catálogo de artículos | `MainLayout` |
| `/crear` | Crear artículo | `MainLayout` |
| `/editar/:id_articulo` | Editar artículo | `MainLayout` |
| `*` | Página 404 | `AuthLayout` |

`MainLayout` incluye la barra de navegación y el pie de página; `AuthLayout` muestra el contenido centrado en una tarjeta.

## Estructura del proyecto

```
Proyecto_web_2/
├── index.html              # HTML base con el <div id="root">
├── vite.config.js          # Configuración de Vite
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # Punto de entrada: monta React y BrowserRouter
    ├── App.jsx             # Componente raíz con los providers globales
    ├── components/         # ItemForm, ItemCard, ItemList, NavBar, Footer
    ├── context/            # ThemeContext y RentalContext
    ├── hooks/              # useTituloPagina
    ├── layouts/            # MainLayout y AuthLayout
    ├── pages/              # Inicio, catálogo, crear, editar y 404
    ├── routes/             # routes.jsx con todas las rutas
    └── styles/             # index.css: estilos globales y variables de tema
```

## Estado global

La aplicación usa la Context API de React para evitar el paso de props entre niveles.

**`RentalContext`** — lista de artículos y operaciones CRUD. Se consume con `useAlquiler()`.

| Función | Operación |
| --- | --- |
| `lista_articulos` | Leer todos los artículos |
| `obtener_articulo_por_id(id)` | Leer un artículo |
| `agregar_articulo(datos)` | Crear |
| `actualizar_articulo(id, datos)` | Actualizar |
| `eliminar_articulo(id)` | Eliminar |

Cada artículo tiene esta forma:

```js
{ id: 1, nombre: 'Clean Code', tipo: 'Libro', categoria: 'Programación', disponible: true }
```

**`ThemeContext`** — tema activo (`'claro'` | `'oscuro'`). Se consume con `useTema()`, que expone `tema_actual` y `alternar_tema()`.

## Estado del proyecto

La aplicación completa está integrada en `main` y funciona de extremo a extremo.

| Funcionalidad | Estado |
| --- | --- |
| Configuración base (Vite, HTML, favicon) | ✅ Integrada |
| Estado global, formulario y páginas de crear/editar | ✅ Integrada |
| Catálogo con filtros y tarjetas de artículo | ✅ Integrada |
| Página de inicio con estadísticas | ✅ Integrada |
| Rutas, layouts, navbar, footer, estilos y página 404 | ✅ Integrada |
| Persistencia de datos y conexión con un backend | ⏳ Pendiente |

## Flujo de trabajo con Git

- `main`: versión estable.
- `develop`: rama de integración.
- `feature/<nombre>`: una rama por funcionalidad, que se une a `develop` mediante pull request.

Los commits siguen el formato [Conventional Commits](https://www.conventionalcommits.org/es/) en español, por ejemplo:

```
feat(paginas): agrega página del catálogo
style(css): agrega estilos globales y variables de tema claro y oscuro
```

## Autor

Carlos Azocar — [@Azokar](https://github.com/Azokar)
