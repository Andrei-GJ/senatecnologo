# INFORME TÉCNICO: REALIZACIÓN DE PRUEBAS DE FUNCIONALIDAD DEL SOFTWARE EN PRODUCCIÓN (DENTAL BLANC - RENDER PAAS)

**CÓDIGO DE EVIDENCIA:** GA10-220501097-AA7-EV01  
**PROGRAMA DE FORMACIÓN:** Análisis y Desarrollo de Software (ADSO)  
**PROYECTO FORMATIVO:** Construcción de software integrador de tecnologías orientadas a servicios  
**FASE DEL PROYECTO:** Ejecución  
**RESULTADO DE APRENDIZAJE:** 220501097-02 - Desplegar el software de acuerdo con la arquitectura y las políticas establecidas.  
**ACTIVIDAD DE APRENDIZAJE:** GA10-220501097-AA7 - Realizar pruebas de funcionalidad del software, de acuerdo con el modelo.  
**EVIDENCIA DE DESEMPEÑO:** Realización de pruebas de funcionalidad del software (GA10-220501097-AA7-EV01).  

---

## 1. DATOS GENERALES
* **Nombre del Proyecto:** Dental Blanc - Sistema Clínico Odontológico (Fullstack)
* **Aprendiz:** Andrei Santiago Sotelo Gómez (ADSO)
* **Centro de Formación:** Servicio Nacional de Aprendizaje (SENA)
* **Plataforma de Despliegue en Producción:** Render Cloud PaaS (Web Services + Managed PostgreSQL)
* **Stack Tecnológico:** Python (FastAPI / Uvicorn), React (Vite / Tailwind CSS), PostgreSQL, Linux.

---

## 2. INTRODUCCIÓN
El despliegue de software en la nube bajo arquitecturas orientadas a servicios requiere una rigurosa fase de validación funcional una vez el aplicativo se encuentra operando en su entorno de producción real. A diferencia de las pruebas realizadas en entornos de desarrollo local (`localhost`), la publicación en Internet a través de un proveedor PaaS como Render introduce variables críticas como la latencia de red, la terminación de certificados TLS/SSL, la propagación de dominios, las políticas de CORS (*Cross-Origin Resource Sharing*) y la concurrencia de conexiones hacia bases de datos gestionadas.

Este informe documenta la metodología y ejecución de pruebas funcionales sobre el sistema clínico Dental Blanc desplegado en Render, la verificación de migraciones de datos, la gestión de privilegios y seguridad, el uso de herramientas de prueba complementarias y el análisis de compatibilidad técnica ante la diversidad de motores de renderizado y dispositivos móviles.

---

## 3. OBJETIVOS

### 3.1 Objetivo General
Validar la operatividad, seguridad y rendimiento del sistema de software Dental Blanc desplegado en la plataforma cloud Render mediante pruebas funcionales, pruebas de integración de servicios y análisis de compatibilidad multiplataforma.

### 3.2 Objetivos Específicos
1. Documentar la arquitectura de producción y configuración de servicios aprovisionados en Render (Web Service y Managed PostgreSQL).
2. Ejecutar y tabular una matriz de casos de prueba funcionales sobre los flujos críticos de negocio (salud del servicio, autenticación JWT, operaciones CRUD y control de acceso).
3. Seleccionar y describir herramientas especializadas para pruebas complementarias (Postman, Playwright, k6, Google Lighthouse y OWASP ZAP).
4. Analizar la problemática de compatibilidad técnica en múltiples navegadores (Blink, WebKit, Gecko) y pantallas móviles, estableciendo estrategias de mitigación.
5. Verificar las políticas de migración de datos y configuración de seguridad basadas en el principio de menor privilegio.

---

## 4. ENTORNO DE PRODUCCIÓN EN RENDER Y CONFIGURACIÓN DE SERVICIOS

La plataforma Dental Blanc se encuentra hosteada en Render bajo una arquitectura desacoplada que separa la capa de cómputo y lógica de negocio de la capa de persistencia relacional:

* **Render Web Service (API / Backend):** Servicio que ejecuta el contenedor con la API REST en Python (FastAPI/Uvicorn). Cuenta con auto-deploy sincronizado con la rama principal de Git, aprovisionamiento automático de certificados SSL Let's Encrypt y balanceador de carga perimetral gestionado.
* **Render Managed PostgreSQL:** Instancia relacional administrada con almacenamiento persistente en disco SSD, respaldos automáticos diarios y canal cifrado obligatorio mediante TLS (`sslmode=require`).

### 4.1 Migración de Datos en Producción
Para garantizar la integridad y continuidad de la estructura relacional, la base de datos se actualiza automáticamente mediante scripts de migración ejecutados durante el ciclo de despliegue (*Build & Start Command*). Esto asegura:
* **Idempotencia:** Las migraciones solo aplican modificaciones sobre esquemas que no han sido alterados previamente.
* **Sembrado de Datos Maestros (*Seeders*):** Inicialización automática de roles de sistema (Administrador, Odontólogo, Recepcionista), permisos y catálogos clínicos indispensables para el arranque sin riesgo de sobreescritura de datos transaccionales.

### 4.2 Seguridad, Variables de Entorno y Privilegios de Usuario
* **Aislamiento de Secretos:** Parámetros sensibles como `DATABASE_URL`, `SECRET_KEY` criptográfica y caducidad de tokens no residen en el repositorio Git; se inyectan dinámicamente mediante las variables de entorno de Render.
* **Menor Privilegio en BD:** El usuario de conexión de la aplicación posee permisos restringidos a operaciones DML/DDL dentro de su esquema, bloqueando cualquier privilegio de superadministrador sobre el clúster de Render.
* **Control de Acceso Basado en Roles (RBAC):** La API valida en cada petición entrante la firma del token Bearer JWT y los alcances (*scopes*) asignados al rol del usuario, denegando el acceso (`HTTP 403 Forbidden`) ante intentos de operaciones no autorizadas.

---

## 5. RECOMENDACIONES Y PLAN DE ACTIVIDADES PARA PRUEBAS FUNCIONALES EN INTERNET

La ejecución de pruebas sobre un software accesible en Internet debe contemplar las siguientes fases estructuradas:
* **Fase 1 - Smoke Testing e Infraestructura:** Verificación de la ruta `/health` o `/api/health` para certificar que el proceso web está escuchando peticiones y que el pool de conexiones con PostgreSQL se encuentra activo.
* **Fase 2 - Seguridad Perimetral y Enrutamiento:** Validación de la redirección automática HTTP a HTTPS (puerto 80 al 443) y verificación estricta de las cabeceras CORS para autorizar únicamente el origen del frontend.
* **Fase 3 - Verificación de Flujos de Negocio:** Comprobación de la integridad del ciclo transaccional: registro de pacientes, autenticación, creación de citas odontológicas, actualización de historiales y eliminación lógica de registros.

### 5.1 Matriz de Casos de Prueba Funcionales (Ejecución en Render)

| ID | Módulo / Endpoint | Acción / Datos de Prueba | Resultado Esperado | Resultado en Render | Estado |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Infraestructura<br>`GET /health` | Petición HTTP GET al endpoint de verificación | HTTP 200 OK<br>JSON: `{status: 'healthy', db: 'ok'}` | HTTP 200 OK (Respuesta en 195 ms) | **Aprobado** |
| **TC-02** | Seguridad Red<br>`http://dentalblanc.onrender.com` | Navegación sin certificado SSL | Redirección 301 a https:// y candado activo | Redirección 301 automática y certificado válido | **Aprobado** |
| **TC-03** | Autenticación<br>`POST /api/v1/auth/login` | Credenciales válidas de odontólogo | HTTP 200 OK<br>Retorno de token JWT con expiración | Token emitido y roles asignados en payload | **Aprobado** |
| **TC-04** | Seguridad RBAC<br>`DELETE /api/v1/usuarios/5` | Petición DELETE con token de rol 'Recepcionista' | HTTP 403 Forbidden<br>Mensaje: Permisos insuficientes | HTTP 403 Forbidden (Operación bloqueada) | **Aprobado** |
| **TC-05** | Gestión Citas<br>`POST /api/v1/citas` | Payload JSON con fecha, odontólogo y paciente | HTTP 201 Created<br>Registro persistido en PostgreSQL | HTTP 201 Created (ID generado y visible en consulta) | **Aprobado** |
| **TC-06** | Validación Datos<br>`POST /api/v1/pacientes` | Payload con formato de email inválido y cédula vacía | HTTP 422 Unprocessable Entity<br>Detalle semántico del error | HTTP 422 con array de campos rechazados | **Aprobado** |

---

## 6. HERRAMIENTAS PARA LA REALIZACIÓN DE PRUEBAS COMPLEMENTARIAS

* **Postman / Thunder Client (Pruebas de Contratos de API):** Permite crear suites de pruebas automatizadas que verifican esquemas JSON, códigos de estado y tiempos de respuesta de cada endpoint tras cada nuevo commit en Render.
* **Playwright (Pruebas End-to-End Automatizadas):** Framework en Python que automatiza la navegación en navegadores reales (Chromium, Firefox, WebKit), validando que un usuario pueda iniciar sesión, agendar una cita y verificar la actualización del calendario sin fallos visuales.
* **k6 (Pruebas de Carga y Concurrencia):** Herramienta que simula 50 usuarios virtuales concurrentes interactuando con la API en Render, midiendo la degradación de latencia (percentiles p90 y p95) y la resistencia del pool de conexiones de PostgreSQL.
* **Google Lighthouse / PageSpeed Insights (Auditoría Web y Core Web Vitals):** Evalúa el frontend en producción en métricas de *Largest Contentful Paint* (LCP), *Interaction to Next Paint* (INP) y accesibilidad (WCAG 2.2).
* **OWASP ZAP (Zed Attack Proxy - Seguridad Dinámica):** Escáner automatizado de seguridad perimetral para identificar cabeceras de seguridad ausentes (CSP, HSTS, X-Content-Type-Options) y protección contra inyecciones y XSS.

---

## 7. PROBLEMÁTICA DEL DESPLIEGUE MULTIPLATAFORMA: EXPLORADORES Y DISPOSITIVOS

La publicación de una aplicación web orientada al público clínico y a pacientes enfrenta serios desafíos técnicos debido a la disparidad de plataformas cliente:

### 7.1 Fragmentación de Motores de Renderizado
* **Blink (Google Chrome, Edge, Brave, Opera):** Motor predominante en Android y Windows. Soporta de forma inmediata las características más recientes de JavaScript y CSS, pero exige vigilancia en el consumo de memoria en equipos de recursos modestos.
* **WebKit (Apple Safari en iOS y macOS):** Es el motor obligatorio por política de Apple en todos los navegadores que corren en iPhones y iPads. Presenta diferencias notables en el manejo de eventos táctiles, renderizado de sombras complejas y APIs de almacenamiento web.
* **Gecko (Mozilla Firefox):** Implementa estándares estrictos de la W3C, requiriendo validación en el comportamiento de fuentes personalizadas y elementos interactivos nativos como selectores de fecha y hora.

### 7.2 Particularidades Críticas en Dispositivos Móviles (iOS / Android)
* **El Bug del Viewport de 100vh en Safari Móvil:** La altura `100vh` tradicional en CSS calcula el espacio incluyendo el área oculta debajo de la barra de navegación retráctil de iOS, provocando que los botones de acción inferior (como 'Guardar Cita') queden cortados. Se solucionó adoptando unidades modernas de CSS: `100dvh` (*Dynamic Viewport Height*).
* **Controles de Entrada Nativos (Date/Time Pickers):** Cada sistema operativo móvil renderiza los campos `<input type='date'>` de manera diferente, lo que obligó a estandarizar componentes de calendario en React para asegurar consistencia visual.
* **Restricciones de Ancho de Banda y Latencia:** Pacientes que acceden mediante redes móviles 3G/4G requieren interfaces ligeras. Se implementó división de código (*code-splitting*), compresión de activos y fuentes de sistema para minimizar la carga inicial.

---

## 8. CONCLUSIONES
1. El despliegue en Render demostró la viabilidad de una arquitectura cloud moderna orientada a servicios, donde el desacoplamiento de la API y la base de datos gestionada permite escalar y auditar componentes de forma independiente.
2. Las pruebas funcionales en caliente permitieron detectar y corregir comportamientos que no se manifiestan en entornos locales, tales como la gestión de reconexiones SSL en PostgreSQL y las restricciones de encabezados CORS.
3. La heterogeneidad de navegadores (particularmente el motor WebKit en dispositivos Apple) ratifica la necesidad de adoptar enfoques de diseño defensivo, utilizando CSS moderno adaptativo y pruebas automatizadas multiplataforma con Playwright.
4. El cumplimiento estricto del principio de menor privilegio en bases de datos y la segregación de variables de entorno protegen la plataforma clínica contra fugas de información y accesos no autorizados.

---

## 9. REFERENCIAS BIBLIOGRÁFICAS
* Fielding, R. T., & Taylor, R. N. (2002). *Principled design of the modern Web architecture*. ACM Transactions on Internet Technology (TOIT), 2(2), 115-150.
* Google Chrome Developers. (2024). *Core Web Vitals and PageSpeed documentation*. Recuperado de https://web.dev/vitals/
* MDN Web Docs. (2024). *Cross-Origin Resource Sharing (CORS)*. Mozilla Foundation. Recuperado de https://developer.mozilla.org/es/docs/Web/HTTP/CORS
* OWASP Foundation. (2021). *OWASP Top 10: The Ten Most Critical Web Application Security Risks*. Recuperado de https://owasp.org/www-project-top-ten/
* Playwright Team. (2024). *Fast and reliable end-to-end testing for modern web apps*. Microsoft. Recuperado de https://playwright.dev/
* Render Documentation. (2024). *Deploying Web Services and PostgreSQL Databases on Render*. Render Services Inc. Recuperado de https://render.com/docs
* World Wide Web Consortium (W3C). (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation.
