# INFORME DE ENTREGA: EVIDENCIA DE PRODUCTO - HERRAMIENTAS DE VERSIONAMIENTO CONFIGURADAS
**Evidencia: GA7-220501096-AA1-EV05**



## PORTADA

**PROGRAMA DE FORMACIÓN:**  
Tecnología en Análisis y Desarrollo de Software (ADSO)

**PROYECTO FORMATIVO:**  
Construcción de software integrador de tecnologías orientadas a servicios.

**FASE DEL PROYECTO:**  
Ejecución

**RESULTADO DE APRENDIZAJE:**  
220501096-01 - Planear actividades de construcción del software de acuerdo con el diseño establecido.

**ACTIVIDAD DE APRENDIZAJE:**  
GA7-220501096-AA1 - Configurar herramientas de versionamiento para control de código, de acuerdo con las metodologías de desarrollo.

**INTEGRANTES (GAES - Grupo de Asociación de Especialistas en Software):**  
1. Andrei (Reemplazar por tu Nombre y Apellidos Completos)
2. (Nombre del Integrante 2 - Opcional)
3. (Nombre del Integrante 3 - Opcional)

**INSTRUCTOR:**  
(Reemplazar por el Nombre del Instructor a Cargo)

**FECHA:**  
4 de agosto de 2026



## 1. INTRODUCCIÓN Y OBJETIVO DE LA EVIDENCIA

La presente entrega corresponde a la evidencia de producto **GA7-220501096-AA1-EV05**, cuyo propósito es certificar que la herramienta de control de versiones Git está correctamente instalada, configurada a nivel local e integrada de forma remota con la nube. 

Para validar el cumplimiento del desempeño y del producto, se ha elaborado una sustentación audiovisual práctica donde se ejecutan los comandos fundamentales del flujo de versionamiento, demostrando la coordinación del grupo de trabajo y su enlace con servicios de hosting web.



## 2. ENLACE DE ACCESO A LA SUSTENTACIÓN AUDIOVISUAL (VIDEO)

A continuación, se presenta el acceso directo al video demostrativo subido a la plataforma YouTube, donde se comprueba el uso e instalación funcional de Git en el entorno de desarrollo:

* **Enlace del Video en YouTube:**  
  [https://www.youtube.com/watch?v=Qq4SLycj_Vg](https://www.youtube.com/watch?v=Qq4SLycj_Vg)



## 3. RESUMEN DE COMANDOS EJECUTADOS Y PUNTOS DEMOSTRADOS EN EL VIDEO

En el material audiovisual se realizó la demostración en vivo de los siguientes aspectos clave:

### 3.1 Verificación del Estado Local del Repositorio
* **Comando:**  
  ```bash
  git status
  ```
* **Propósito:** Mostrar la rama de desarrollo colaborativo (`develop`) activa en el entorno de desarrollo y verificar que no existen archivos sin confirmar en el directorio de trabajo local.

### 3.2 Trazabilidad del Historial (Historial de Cambios)
* **Comando:**  
  ```bash
  git log -n 5 --oneline --graph --decorate
  ```
* **Propósito:** Evidenciar los commits previos realizados por el equipo de desarrollo, confirmando la integración y el flujo ordenado de ramas de desarrollo hacia la rama de producción (`main`).

### 3.3 Verificación de la Configuración Remota (Enlace con GitHub)
* **Comando:**  
  ```bash
  git remote -v
  ```
* **Propósito:** Comprobar la vinculación bidireccional (Fetch y Push) entre la terminal del desarrollador y el servidor en la nube de GitHub en la dirección del repositorio del proyecto.

### 3.4 Despliegue Automático (Despliegue Continuo)
* **Demostración:** Vista del panel de administración del proveedor de hosting **Render**, el cual recibe las actualizaciones de la rama `main` y realiza la compilación y publicación web automática de la aplicación del consultorio odontológico.



## 4. CONCLUSIONES DE LA PRÁCTICA

* **Control Efectivo del Código:** La terminal de Git proporciona una visualización precisa e histórica de la evolución del software, facilitando volver a versiones previas ante fallos.
* **Integración del Grupo:** Mediante el uso de Git y GitHub, los miembros del GAES pueden consolidar sus contribuciones en la rama `develop` asegurando el avance equitativo y coordinado.
* **Agilidad en Despliegue:** La conexión directa entre el repositorio de GitHub y el hoster Render ahorra tiempos operativos al automatizar las actualizaciones del sitio web en vivo una vez aprobadas las mezclas a la rama `main`.



## 5. REFERENCIAS BIBLIOGRÁFICAS

1. Chacon, S., & Straub, B. (2014). *Pro Git* (2nd ed.). Apress. https://git-scm.com/book/es/v2
2. Render Docs. (2026). *Git Integration and Automatic Deploys*. https://docs.render.com
3. Servicio Nacional de Aprendizaje (SENA). (2026). *Material de Formación: Administración de Código Fuente con Git*.
