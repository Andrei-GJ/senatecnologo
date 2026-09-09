# 🎨 Documentación del Frontend - Dental Blanc

Esta documentación detalla la arquitectura, tecnologías y componentes del **Frontend** del proyecto Dental Blanc.

## 🛠️ Tecnologías Principales

- **Framework:** [React](https://react.dev/) (18+)
- **Build Tool:** [Vite](https://vitejs.dev/) - Proporciona tiempos de carga ultrarrápidos durante el desarrollo (HMR).
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) - Utilizado para un diseño rápido, responsivo y orientado a un enfoque "mobile-first".
- **Diseño & UX:** Inspirado en estéticas premium (Clean Design, Glassmorphism). Se hace uso intensivo de desenfoques (`backdrop-blur`), paletas neutras con contrastes (slate-900 y sky-500) y micro-animaciones (transformaciones `scale` en botones).

---

## 📁 Estructura de Componentes (`/src/components`)

El proyecto sigue una arquitectura basada en componentes funcionales de React, donde las responsabilidades están separadas modularmente:

### 1. Navegación y Layout
- **`Encabezado.jsx`**
  - **Propósito:** Es la barra de navegación superior (Navbar) persistente.
  - **Características:** Posee un diseño pegajoso (`sticky top-0`) con efecto cristal (backdrop-blur-md).
  - **Responsabilidades:** 
    - Renderizar el logo de la marca.
    - Contener los enlaces de navegación principales (Inicio, Servicios, Nosotros, Blog).
    - Gestionar el botón de "Ingresar" que dispara el modal de Login o mostrar los controles de "Mi Cuenta" si hay una `sesionActiva`.
    - Recibe como props: `sesionActiva`, `alCerrarSesion`, `alAbrirLogin`, `vistaActual`, `alCambiarVista`.

### 2. Formularios e Interacción
- **`FormularioLogin.jsx`**
  - **Propósito:** Modal de autenticación superpuesto a la interfaz principal.
  - **Características:** Utiliza un fondo semitransparente que bloquea el resto de la interfaz. Maneja la captura de credenciales y provee transiciones de entrada para una mejor experiencia de usuario.
- **`FormularioCita.jsx`**
  - **Propósito:** Permite a los usuarios solicitar una consulta odontológica interactuando con los servicios expuestos y eligiendo horarios disponibles.

### 3. Vistas Principales (Páginas)
- **`PaginaNosotros.jsx`**
  - **Propósito:** Presenta la historia, misión, visión y posiblemente el equipo de especialistas (Dr. Equipo Dental Blanc).
- **`PaginaServicios.jsx`**
  - **Propósito:** Vista dedicada a listar y detallar a profundidad todos los tratamientos disponibles en la clínica.
- **`PaginaBlog.jsx`**
  - **Propósito:** Funciona como el feed o muro principal donde se muestran tarjetas de noticias, consejos dentales y artículos de interés para los pacientes.
- **`PaginaArticulo.jsx`**
  - **Propósito:** Vista de lectura enfocada. Toma el id o la información de un artículo específico del blog y lo presenta en formato de lectura larga, con tipografía adaptada, botón de regreso y un diseño de "autor" al final (Especialistas en sonrisas).

### 4. Componentes UI Reutilizables
- **`TarjetasServicios.jsx`**
  - **Propósito:** Muestra un servicio particular (ej: Blanqueamiento, Ortodoncia) en un formato de tarjeta condensada, ideal para colocar en la vista de Inicio o en el listado de servicios. 

---

## 🔄 Manejo del Estado (State Management)

El estado en la capa de vista se orquesta desde un componente padre (posiblemente `App.jsx` o similar), inyectando el estado a los hijos a través de **Props** (Prop Drilling).
 
Los estados más críticos detectados en los componentes son:
- **`vistaActual`**: Un string (`'inicio'`, `'servicios'`, `'blog'`, etc.) que dicta qué componente/página renderizar. Es una forma de "Enrutamiento Manual" sin depender de bibliotecas externas complejas como React Router, manteniendo la Single Page Application (SPA) ultra-ligera y con transiciones rápidas.
- **`sesionActiva`**: Un booleano o estado que determina el acceso a ciertas áreas y qué botones se muestran en el `Encabezado`.

---

## ✨ Prácticas Destacadas (Best Practices Implementadas)

1. **Uso de SVGs en línea:** La iconografía no depende de librerías pesadas externas, se usan trazos SVG directamente en el código de los componentes, aligerando la carga de red.
2. **Componentes Puros y Funcionales:** El uso extendido de desestructuración de props (`{ prop1, prop2 }`) mejora la legibilidad.
3. **Nomenclatura de Eventos Clara:** Las funciones pasadas por props como *callbacks* inician con el prefijo `al` (ej. `alAbrirLogin`, `alCerrarSesion`, `alCambiarVista`), que es una excelente convención para distinguir manejadores de eventos.
4. **Diseño Responsivo (Mobile-First):** Los componentes mezclan utilidades como `hidden sm:block` o `md:flex` garantizando una experiencia adaptada de forma nativa tanto para dispositivos móviles como para pantallas de escritorio.
