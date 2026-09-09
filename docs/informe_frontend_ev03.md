# INFORME TÉCNICO: COMPONENTE FRONT-END DEL PROYECTO (DENTAL BLANC)
## EVALUACIÓN Y CUMPLIMIENTO DEL DISEÑO, NAVEGACIÓN Y REQUISITOS DEL FRONT-END

**CÓDIGO DE EVIDENCIA:** GA7-220501096-AA4-EV03  
**PROGRAMA DE FORMACIÓN:** Análisis y desarrollo de software (ADSO)  
**PROYECTO FORMATIVO:** Construcción de software integrador de tecnologías orientadas a servicios  
**FASE DEL PROYECTO:** Ejecución  
**RESULTADO DE APRENDIZAJE:** 220501096-04 - Codificar el software de acuerdo con el diseño establecido.  
**ACTIVIDAD DE APRENDIZAJE:** GA7-220501096-AA4 - Codificar el front-end utilizando framework, de acuerdo con el diseño.  



## 1. DATOS GENERALES
*   **Nombre del Proyecto:** Dental Blanc - Sistema Clínico Odontológico (Fullstack)
*   **Aprendiz:** Andrei (ADSO)
*   **Fecha de Elaboración:** 21 de Agosto de 2026
*   **Tecnología Front-end:** React (Vite, JSX, Tailwind CSS v4, JavaScript)
*   **Repositorio Remoto:** https://github.com/Andrei-GJ/senatecnologo.git



## 2. LISTA DE CHEQUEO DE EVALUACIÓN

* **1. El diseño front-end del proyecto cumple con los prototipos realizados en el ciclo del desarrollo del software.**
  * **Cumple:** SÍ (X)
  * **Observaciones:** La interfaz fue desarrollada a partir de los mockups definidos. Incorpora una paleta de colores limpia (gama de celestes y pizarra), tipografía moderna (Outfit) y una distribución intuitiva de elementos.

* **2. Entrega todos los archivos del proyecto y enlace de repositorio.**
  * **Cumple:** SÍ (X)
  * **Observaciones:** Se incluye la estructura completa del código fuente de React (Vite) en el directorio `/frontend` y la URL del repositorio remoto público en GitHub para su respectiva descarga e inspección.

* **3. La navegación del front-end entregado funciona correctamente.**
  * **Cumple:** SÍ (X)
  * **Observaciones:** Se implementó una navegación interactiva en una sola página (SPA - Single Page Application) controlando el estado global (`vistaActual`). Permite cambiar de sección fluidamente sin recargar la página.

* **4. Cumple con los requisitos especificados inicialmente.**
  * **Cumple:** SÍ (X)
  * **Observaciones:** La aplicación cumple con todos los requisitos funcionales: catálogo de servicios dinámico, sistema de registro e inicio de sesión de pacientes, agendamiento de citas autenticado con JWT y panel adaptivo.




## 3. DETALLE Y EVIDENCIA DE CUMPLIMIENTO

### 3.1. Cumplimiento del Diseño (Variable 1)
La interfaz de usuario del frontend está construida con componentes React modulares y estilizada mediante **Tailwind CSS v4** para asegurar un acabado moderno, profesional y adaptativo (Responsive Design) para dispositivos móviles, tablets y ordenadores.
* **Componente Hero / Presentación:** Mensaje de bienvenida enfocado en odontología, con elementos dinámicos interactivos y botones de llamada a la acción (*Call to Action*).
* **Catálogo de Servicios:** Tarjetas de presentación de especialidades ([TarjetasServicios.jsx](file:///home/andrei/repositorios/odontologia/frontend/src/components/TarjetasServicios.jsx)) que muestran el título, la descripción y el costo del servicio en tiempo real.
* **Interfaz de Formularios:** Formularios modernos y estilizados con enfoque interactivo de entrada de datos para la autenticación y el agendamiento.

### 3.2. Estructura de Archivos y Repositorio (Variable 2)
El código del cliente se encuentra organizado de acuerdo con las mejores prácticas de modularidad de React en la carpeta `/frontend`:
*   [package.json](file:///home/andrei/repositorios/odontologia/frontend/package.json) - Gestión de scripts de ejecución (`npm run dev`) y dependencias.
*   [src/App.jsx](file:///home/andrei/repositorios/odontologia/frontend/src/App.jsx) - Punto de control del estado global, manejo de peticiones fetch y renderizado condicional.
*   [src/components/](file:///home/andrei/repositorios/odontologia/frontend/src/components) - Módulos de componentes UI aislados:
    *   `Encabezado.jsx` - Menú de navegación interactivo y botones de control de sesión.
    *   `FormularioLogin.jsx` - Modal para el registro y login.
    *   `FormularioCita.jsx` - Formulario para agendar nuevas citas.
    *   `TarjetasServicios.jsx` - Listado visual del catálogo.
    *   `PaginaNosotros.jsx`, `PaginaBlog.jsx`, `PaginaArticulo.jsx` - Secciones adicionales de contenido informativo.

### 3.3. Sistema de Navegación Interactivo (Variable 3)
En lugar de forzar recargas completas del navegador, la navegación se gestiona como una SPA mediante el hook de estado `useState` de React:
```jsx
// src/App.jsx
const [vistaActual, setVistaActual] = useState('inicio');

// Renderizado dinámico en la sección principal
{vistaActual === 'inicio' && <InicioComponent />}
{vistaActual === 'servicios' && <PaginaServicios />}
{vistaActual === 'nosotros' && <PaginaNosotros />}
{vistaActual === 'blog' && <PaginaBlog />}
```
Este enfoque asegura transiciones inmediatas y un rendimiento de navegación sumamente fluido para el usuario final.

### 3.4. Requisitos Iniciales Satisfechos (Variable 4)
* **Autenticación en LocalStorage:** El token de seguridad JWT devuelto por el backend de FastAPI se almacena en el navegador (`localStorage`), permitiendo mantener activa la sesión del paciente tras recargar la página.
* **Agendamiento Seguro:** El formulario de citas médicas (`FormularioCita.jsx`) se desbloquea dinámicamente solo si el token existe en el estado del frontend, inyectando de forma automática el header de autorización en la petición POST.
* **Integración Fullstack:** Todas las peticiones asíncronas apuntan a la URL dinámica de la API (`import.meta.env.VITE_API_URL`), permitiendo un desarrollo local simple y un despliegue en producción estable.
