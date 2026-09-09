# INFORME TÉCNICO: PLAN DE TRABAJO PARA CONSTRUCCIÓN DE SOFTWARE
## CONTROL DE VERSIONES Y HERRAMIENTAS DE DESARROLLO

**CÓDIGO DE EVIDENCIA:** GA7-220501096-AA1-EV01  
**PROGRAMA DE FORMACIÓN:** Análisis y desarrollo de software (ADSO)  
**PROYECTO FORMATIVO:** Construcción de software integrador de tecnologías orientadas a servicios  
**FASE DEL PROYECTO:** Ejecución  
**RESULTADO DE APRENDIZAJE:** 220501096-01 - Planear actividades de construcción del software de acuerdo con el diseño establecido.  
**ACTIVIDAD DE APRENDIZAJE:** GA7-220501096-AA1 - Configurar herramientas de versionamiento para control de código, de acuerdo con las metodologías de desarrollo.  



## 1. DATOS GENERALES
*   **Nombre del Proyecto:** Dental Blanc - Sistema Clínico Odontológico (Fullstack)
*   **Aprendiz:** Andrei (ADSO)
*   **Fecha de Elaboración:** 10 de Agosto de 2026
*   **Tecnologías Principales:** Python (FastAPI), React (Vite), Supabase (PostgreSQL), Git, GitHub.



## 2. INTRODUCCIÓN
El presente informe técnico describe el plan de trabajo y la configuración del entorno tecnológico para la construcción del sistema clínico odontológico **Dental Blanc**. Este sistema responde a la necesidad de gestionar de manera óptima las citas, el historial clínico, los registros de pacientes y la administración interna de una clínica odontológica moderna.

En este documento se detallan las herramientas de desarrollo y de control de versiones seleccionadas, justificando su elección de acuerdo con las necesidades de escalabilidad, rendimiento y colaboración del proyecto. Asimismo, se establecen los estándares de codificación que regirán el desarrollo del código fuente para garantizar su mantenibilidad y calidad a largo plazo.



## 3. OBJETIVOS
*   Establecer la estructura conceptual del sistema de control de versiones distinguiendo entre repositorios locales y remotos.
*   Definir y justificar el conjunto de herramientas de desarrollo (IDE, frameworks, bases de datos y lenguajes) seleccionadas para el proyecto.
*   Presentar un plan de trabajo detallado y configurar el flujo de versionamiento con Git y GitHub.
*   Establecer estándares de codificación que aseguren la legibilidad y cohesión en el desarrollo colaborativo del software.



## 4. CONTROL DE VERSIONES: LOCAL VS. REMOTO
El control de versiones es el pilar de la ingeniería de software moderna, permitiendo rastrear el historial de cambios, experimentar en ramas paralelas y colaborar sin interferencias. Para Dental Blanc, se adopta un sistema distribuido fundamentado en dos capas esenciales:

| Característica | Versionamiento Local (Git Local) | Versionamiento Remoto (GitHub) |
| :--- | :--- | :--- |
| **Definición** | Base de datos de control de versiones que reside exclusivamente en el almacenamiento físico del desarrollador. | Copia del repositorio alojada en un servidor o plataforma en la nube accesible a través de Internet. |
| **Operación Principal** | Operaciones rápidas sin necesidad de red: `git commit`, `git checkout`, `git branch`, `git status`. | Sincronización y colaboración mediante red: `git push`, `git pull`, `git fetch`, `git clone`. |
| **Propósito Principal** | Registrar el historial detallado de cambios individuales durante el desarrollo cotidiano. | Centralizar el código para el equipo, facilitar revisiones, implementar Integración Continua (CI/CD) y respaldar la información. |
| **Seguridad / Respaldo** | Vulnerable ante fallos del hardware local o pérdida del equipo de desarrollo. | Funciona como copia de seguridad redundante e indestructible ante pérdidas de equipos locales. |
| **Colaboración** | Limitada al entorno del propio desarrollador; no permite integración directa con otros programadores. | Permite a múltiples desarrolladores integrar cambios mediante *Pull Requests*, revisiones de código y resolución de conflictos. |



## 5. HERRAMIENTAS DE DESARROLLO SELECCIONADAS
Para la codificación de **Dental Blanc**, se ha configurado un stack moderno que asegura alto rendimiento, facilidad de depuración y excelente experiencia de usuario.

### 5.1. Entorno de Desarrollo Integrado (IDE)
*   **Visual Studio Code (VS Code):** Elegido por su ligereza, soporte nativo de extensiones para Python y Javascript (React), integración con terminales Bash, y herramientas visuales para la gestión de Git.

### 5.2. Componente Backend
*   **Python 3.10+:** Lenguaje robusto, tipado dinámico con soporte de anotaciones de tipo, y amplio ecosistema para desarrollo ágil.
*   **FastAPI:** Framework web moderno y rápido para construir APIs con Python basado en anotaciones de tipo estándar. Permite la autogeneración interactiva de documentación (OpenAPI/Swagger) y destaca por su altísima velocidad de ejecución (a la par con NodeJS y Go).
*   **Uvicorn:** Servidor ASGI ultrarrápido para ejecutar la aplicación FastAPI.
*   **Entornos Virtuales (`venv`):** Aislamiento de dependencias para evitar conflictos entre librerías globales del sistema operativo y los requerimientos del proyecto.

### 5.3. Componente Frontend
*   **Node.js (versión 20+) & npm:** Entorno de ejecución de JavaScript en el lado del servidor y gestor de paquetes para administrar librerías frontend.
*   **React:** Biblioteca de JavaScript enfocada en la creación de interfaces de usuario interactivas basadas en componentes reutilizables.
*   **Vite:** Herramienta de compilación ultrarrápida que reemplaza a Create React App, ofreciendo recarga en caliente (HMR) casi instantánea y compilaciones de producción optimizadas.
*   **Tailwind CSS v4:** Motor de diseño CSS moderno, minimalista y rápido, que permite aplicar estilos directamente en el HTML/JSX con clases de utilidad y un rendimiento de compilación excepcional.

### 5.4. Base de Datos y Backend-as-a-Service (BaaS)
*   **Supabase (PostgreSQL):** Base de datos relacional de nivel empresarial en la nube. Proporciona persistencia distribuida, autenticación integrada, y mecanismos de optimización de conexiones como pooling de base de datos (`pool_pre_ping`), mitigando interrupciones de red.



## 6. HERRAMIENTAS Y CONFIGURACIÓN DE VERSIONAMIENTO

El flujo de control de versiones de **Dental Blanc** se administra a través de las siguientes herramientas y configuraciones específicas:

### 6.1. Inicialización del Repositorio Git (Local)
Para inicializar el control de versiones en la raíz del proyecto, se ejecuta:
```bash
git init
```

### 6.2. Configuración de Exclusiones (`.gitignore`)
Para evitar que se suban archivos innecesarios, temporales o credenciales de seguridad (claves de base de datos), se configura el archivo `.gitignore` en la raíz del proyecto con la siguiente estructura básica:
```gitignore
# Python virtual environment
venv/
__pycache__/
*.pyc

# Node dependencies
node_modules/
dist/
dist-ssr/
*.local

# Environment variables & secrets (CRUCIAL)
.env
.env*.local

# OS generated files
.DS_Store
Thumbs.db
```

### 6.3. Conexión con el Repositorio Remoto (GitHub)
Se asocia el repositorio local con la plataforma en la nube GitHub ejecutando:
```bash
git remote add origin https://github.com/Andrei-GJ/senatecnologo.git
```
La sincronización se realiza mediante ramas de trabajo seguras utilizando:
*   `git push -u origin main` (para subir cambios a la rama principal).
*   `git pull origin main` (para integrar los cambios del repositorio remoto).



## 7. ESTÁNDARES DE CODIFICACIÓN (CONVENCIONES)
Con el fin de mantener un código legible, limpio y mantenible, el equipo de desarrollo de **Dental Blanc** adopta las siguientes reglas:

### 7.1. Estándares para Python (Backend)
*   **Guía de Estilo PEP 8:** Respetar el uso de 4 espacios por nivel de sangría, nombres en `snake_case` para variables y funciones (`registrar_paciente`), y `PascalCase` para nombres de clases (`PacienteService`).
*   **Tipado Estático Sugerido:** Definir tipos en los parámetros y retornos de funciones (ej. `def obtener_usuario(id: int) -> User:`) para potenciar el autocompletado del editor y reducir errores en tiempo de ejecución.

### 7.2. Estándares para React/JavaScript (Frontend)
*   **Nombres de Componentes:** Deben usar `PascalCase` y coincidir con el nombre de su archivo (ej. `BotonGuardar.jsx`).
*   **Nombres de Funciones y Hooks:** Deben usar `camelCase` (ej. `const [pacientes, setPacientes] = useState([])`).
*   **Modularidad:** Crear componentes pequeños con una única responsabilidad. Evitar archivos monolíticos de JSX.

### 7.3. Mensajes de Commit Semánticos (Conventional Commits)
Los mensajes de confirmación de Git deben seguir un formato claro para facilitar la generación automática de historiales de cambio:
*   `feat: <descripción>` - Incorporación de una nueva funcionalidad (ej. `feat: agregar formulario de registro de pacientes`).
*   `fix: <descripción>` - Resolución de un error (ej. `fix: corregir validación de fecha de nacimiento`).
*   `docs: <descripción>` - Modificaciones en la documentación (ej. `docs: crear informe técnico de plan de trabajo`).
*   `style: <descripción>` - Ajustes visuales de formato, espaciados o CSS sin alterar la lógica de programación.
*   `refactor: <descripción>` - Reestructuración de código que no corrige errores ni añade características.



## 8. PROPUESTA DE PLAN DE TRABAJO (ROADMAP ESTIMADO)
Para la ejecución del proyecto formativo, se plantea una organización del trabajo basada en metodologías ágiles (Marcos de trabajo como Scrum/Kanban). El desarrollo se estructura en **Sprints de duración sugerida de 1 a 2 semanas**, los cuales permitirán una integración incremental del código. 

A continuación, se detalla el backlog de actividades estimadas para la construcción del sistema **Dental Blanc**, el cual servirá como guía para la posterior priorización y asignación de tareas con el equipo de trabajo:

| Sprint / Fase | Objetivo Principal | Actividades / Tareas Clave | Entregable Técnico |
| :--- | :--- | :--- | :--- |
| **Sprint 1: Cimiento e Infraestructura** | Configurar el espacio de trabajo colaborativo y la base del proyecto. | - Inicialización del repositorio Git local.<br>- Creación y subida del repositorio a GitHub.<br>- Configuración de archivos `.gitignore` y políticas de ramas.<br>- Configuración inicial de entornos virtuales (`venv` en backend y `node_modules` en frontend). | Entorno de desarrollo unificado y repositorio inicializado en la nube. |
| **Sprint 2: Persistencia y Datos** | Diseñar y poblar la base de datos distribuida. | - Creación del proyecto en Supabase (PostgreSQL).<br>- Diseño del modelo relacional (Tablas de usuarios, citas, historial).<br>- Creación de scripts de migración y archivo de semilla (`seed.py`). | Base de datos activa y estructurada en la nube. |
| **Sprint 3: Backend API (Lógica)** | Desarrollar el núcleo de servicios y endpoints del sistema. | - Configuración del framework FastAPI.<br>- Desarrollo de endpoints de autenticación y CRUD (Pacientes, Citas).<br>- Integración de variables de entorno para seguridad de credenciales. | API REST funcional y documentada automáticamente (Swagger). |
| **Sprint 4: Frontend UI/UX (Interfaz)** | Crear las interfaces de usuario interactivas y dinámicas. | - Configuración inicial de React + Vite con Tailwind CSS v4.<br>- Diseño de componentes reutilizables (Modales, Botones, Tablas).<br>- Implementación del consumo de API REST del backend en el cliente frontend. | Interfaz web funcional, responsiva y conectada al backend. |
| **Sprint 5: Integración y QA** | Garantizar el correcto funcionamiento general y desplegar. | - Pruebas de integración de flujos completos (Creación de citas y registro).<br>- Depuración de errores del sistema.<br>- Configuración de archivos de despliegue (`render.yaml`) y hosting de producción. | Software desplegado y listo para su uso. |

### 8.1. Gestión y Coordinación del Backlog
Este listado representa una propuesta inicial orientada a organizar el trabajo técnico. Para evitar conflictos o desfases con el equipo de desarrollo, la asignación final y estimación de tiempos se realizará dinámicamente en reuniones de planificación de Sprint (*Sprint Planning*), permitiendo adaptar el alcance según la velocidad real del equipo.





## 9. CONCLUSIONES Y RECOMENDACIONES
*   La combinación de **Git** como versionador local y **GitHub** como plataforma remota garantiza la seguridad del código fuente, facilita el desarrollo estructurado por ramas y asegura la trazabilidad del proyecto.
*   El stack compuesto por **FastAPI**, **React (Vite)** y **Supabase** permite construir un software modular con tiempos mínimos de respuesta y un diseño visual de alta calidad adaptado a dispositivos móviles.
*   Adoptar de forma rigurosa estándares de codificación (PEP 8, camelCase y commits semánticos) reduce la deuda técnica del proyecto, permitiendo integraciones ágiles y mantenimiento simplificado a futuro.
