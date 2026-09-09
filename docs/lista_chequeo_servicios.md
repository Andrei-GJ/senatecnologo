# INFORME TÉCNICO: LISTA DE CHEQUEO DE SERVICIOS Y API REST (DENTAL BLANC)
## EVALUACIÓN DE SERVICIOS, API REST, VALIDACIONES Y CONTROL DE VERSIONES

**PROGRAMA DE FORMACIÓN:** Análisis y desarrollo de software (ADSO)  
**PROYECTO FORMATIVO:** Construcción de software integrador de tecnologías orientadas a servicios  
**FASE DEL PROYECTO:** Ejecución  
**APRENDIZ:** Andrei (ADSO)  
**FECHA DE ELABORACIÓN:** 21 de Agosto de 2026  
**ESTADO DE LA EVALUACIÓN:** Cumplimiento del 100% de los indicadores  

## 1. INTRODUCCIÓN
El presente informe técnico consolida el cumplimiento de los indicadores de logro definidos para la construcción e integración de servicios y API REST dentro del proyecto **Dental Blanc**. A través de este documento se detalla de forma objetiva la correspondencia entre los requerimientos funcionales del sistema, la arquitectura de backend basada en **FastAPI**, la validación estricta de datos mediante esquemas y la gestión del código bajo control de versiones con **Git**.


## 2. LISTA DE CHEQUEO DE EVALUACIÓN

| No. | VARIABLES/INDICADORES DE LOGRO | CUMPLE (SÍ) | CUMPLE (NO) | Observaciones |
| :---: | :--- | :---: | :---: | :--- |
| **1** | Realiza los servicios según requerimientos del proyecto. | **X** | | Se han codificado los servicios clave para la gestión de la clínica odontológica: autenticación de usuarios, catálogo de tratamientos, y agendamiento y visualización del historial de citas (órdenes). |
| **2** | Realiza API Rest según necesidades del proyecto. | **X** | | Se diseñó y expuso una API REST con **FastAPI** que utiliza métodos HTTP estándar (`GET`, `POST`), serialización JSON y provee documentación interactiva automática en la ruta `/docs` (Swagger). |
| **3** | Realiza las validaciones de verificación correctamente. | **X** | | Se implementaron validaciones multinivel: frontend interactivo (React) y backend robusto usando tipado estricto con **Pydantic** (`schemas.py`), control de excepciones y decodificación de tokens JWT. |
| **4** | Utiliza herramientas de versionamiento para la creación de proyecto. | **X** | | El proyecto cuenta con control de versiones distribuido implementado con **Git** localmente y sincronizado con el repositorio remoto en **GitHub** (`Andrei-GJ/senatecnologo`), gestionando exclusiones con un archivo `.gitignore`. |


## 3. DETALLE Y EVIDENCIA DE CUMPLIMIENTO

### 3.1. Variable 1: Servicios Según Requerimientos
Los servicios del backend responden a los casos de uso definidos en la fase de análisis del consultorio odontológico:
* **Autenticación y Registro:** Creación de historias/cuentas de pacientes (`/api/register`) e inicio de sesión seguro (`/api/login`).
* **Catálogo Clínico:** Listado de servicios y tratamientos odontológicos vigentes (`/api/services`).
* **Operación de Citas:** Creación de citas médicas asociadas a un servicio (`/api/appointments`) y consulta de historial de citas/órdenes por usuario o rol de administrador (`/api/orders`).

### 3.2. Variable 2: API REST y Métodos HTTP
La API se construyó siguiendo el estándar arquitectónico REST:
* **Estructura Modular:** Definición de rutas utilizando decoradores nativos de FastAPI en [main.py](file:///home/andrei/repositorios/odontologia/backend/main.py):
  * `POST /api/register` - Creación de un recurso de usuario.
  * `POST /api/login` - Generación de sesión mediante token JWT.
  * `GET /api/services` - Consulta de colecciones activas.
  * `POST /api/appointments` - Registro de una nueva orden/cita médica.
  * `GET /api/orders` - Obtención estructurada de registros de citas.
* **Respuestas y Códigos de Estado:** Retorno de respuestas en formato `application/json` y control preciso de estados HTTP (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized` y `404 Not Found`).

### 3.3. Variable 3: Validaciones de Verificación
* **Validación de Datos (Pydantic):** Los esquemas en [schemas.py](file:///home/andrei/repositorios/odontologia/backend/schemas.py) garantizan la integridad de la información entrante (ej. formato de email, tipo numérico para la cédula, y estructura de fecha/hora de la cita).
* **Validación de Reglas de Negocio:** Prevención de duplicación de correos electrónicos y verificación de la vigencia del servicio odontológico seleccionado antes de registrar la cita en la base de datos.
* **Validación de Seguridad:** Intercepción de solicitudes en rutas protegidas mediante la dependencia `get_current_user`, verificando la autenticidad y fecha de expiración del token JWT.

### 3.4. Variable 4: Herramientas de Versionamiento (Git/GitHub)
* **Trazabilidad:** Registro ordenado del historial de cambios del proyecto.
* **Exclusiones:** Configuración del archivo [.gitignore](file:///home/andrei/repositorios/odontologia/.gitignore) para mantener el repositorio limpio y evitar la subida de dependencias (`venv`, `node_modules`) y credenciales sensibles (`.env`).
* **Sincronización:** Vinculación directa con el repositorio remoto de GitHub para trabajo colaborativo y despliegue continuo en la nube.
