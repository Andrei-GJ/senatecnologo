# INFORME TÉCNICO: MÓDULOS DE SOFTWARE CODIFICADOS Y PROBADOS (DENTAL BLANC)
## ARQUITECTURA WEB, MÉTODOS HTTP, EQUIVALENCIA DE SERVLETS/JSP Y CONTROL DE VERSIONES

**CÓDIGO DE EVIDENCIA:** GA7-220501096-AA2-EV02  
**PROGRAMA DE FORMACIÓN:** Análisis y desarrollo de software (ADSO)  
**PROYECTO FORMATIVO:** Construcción de software integrador de tecnologías orientadas a servicios  
**FASE DEL PROYECTO:** Ejecución  
**RESULTADO DE APRENDIZAJE:** 220501096-04 - Codificar el software de acuerdo con el diseño establecido.  
**ACTIVIDAD DE APRENDIZAJE:** GA7-220501096-AA2 - Aplicar estándares de codificación, de acuerdo con el diseño.  



## 1. DATOS GENERALES
*   **Nombre del Proyecto:** Dental Blanc - Sistema Clínico Odontológico (Fullstack)
*   **Aprendiz:** Andrei (ADSO)
*   **Fecha de Elaboración:** 18 de Agosto de 2026
*   **Tecnologías Principales:** Python (FastAPI), React (Vite), Supabase (PostgreSQL), Git.



## 2. INTRODUCCIÓN
El presente informe técnico expone la arquitectura del sistema **Dental Blanc**, desarrollado bajo un enfoque desacoplado (Decoupled Fullstack) utilizando un backend basado en microservicios/API REST con **FastAPI** y un cliente web interactivo desarrollado en **React**. 

Para cumplir formalmente con la lista de chequeo de la evidencia **GA7-220501096-AA2-EV02**, la cual evalúa tecnologías tradicionales basadas en la arquitectura Java Web (JSP y Servlets de Jakarta EE/Java EE), este documento detalla la correspondencia conceptual y técnica directa entre dichos componentes clásicos y el stack tecnológico implementado en este software, demostrando un nivel equivalente de robustez, manejo de parámetros HTTP (GET y POST), interfaces dinámicas y versionamiento de código.



## 3. EQUIVALENCIAS TECNOLÓGICAS: JAVA WEB VS. DENTAL BLANC (FASTAPI + REACT)

La arquitectura clásica de Java Web utiliza un servidor de aplicaciones (ej: Apache Tomcat) que expone **Servlets** (controladores lógicos que interceptan solicitudes y despachan respuestas) y **JSP** (vistas generadas en el servidor usando etiquetas dinámicas).

En **Dental Blanc**, esta estructura se moderniza mediante una arquitectura SPA (Single Page Application) donde las vistas dinámicas ocurren en el navegador (React JSX) y la lógica de negocio y persistencia se gestiona en endpoints REST (FastAPI):

| Componente Clásico (Java Web) | Implementación Dental Blanc (FastAPI + React) | Descripción del Rol Arquitectónico |
| : | : | : |
| **Formulario HTML** | Formulario JSX en React ([FormularioLogin.jsx](file:///home/andrei/repositorios/odontologia/frontend/src/components/FormularioLogin.jsx)) | Captura la interacción y datos del usuario de forma reactiva e interactiva. |
| **Java Servlets (doGet / doPost)** | Controladores / Endpoints REST en [main.py](file:///home/andrei/repositorios/odontologia/backend/main.py) | Procesan solicitudes HTTP específicas, inyectan dependencias, manejan sesiones/tokens y acceden a la base de datos. |
| **Métodos GET / POST de Servlets** | Decoradores `@app.get(...)` y `@app.post(...)` | Definen el verbo HTTP correspondiente para recibir parámetros en la URL, querys o en el cuerpo JSON. |
| **Elementos JSP (`<% %>`, JSTL, EL)** | Expresiones de JSX en React (`{ expression }`, `.map()`) | Renderizan la interfaz web en tiempo real de acuerdo con el estado interno o los datos devueltos por el backend. |



## 4. DETALLE DE IMPLEMENTACIÓN DE LA LISTA DE CHEQUEO

### 4.1. Indicador 1: Formularios HTML y su Procesamiento (Equivalente Servlet)
En el frontend de React, los datos son recopilados a través de formularios JSX que utilizan enlaces de datos bidireccionales (*two-way data binding*). Al enviar el formulario, se dispara un evento de envío (`onSubmit`) que despacha una solicitud asíncrona (`fetch` o `axios`) hacia los endpoints correspondientes de FastAPI.

#### Formulario React (Interfaz de Usuario):
Fragmento tomado del componente del cliente [FormularioLogin.jsx](file:///home/andrei/repositorios/odontologia/frontend/src/components/FormularioLogin.jsx):
```jsx
// FormularioLogin.jsx
<form onSubmit={alEnviar} className="space-y-4">
  {modo === 'register' && (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-slate-400">Nombre Completo</label>
        <input type="text" value={nombre} onChange={alCambiarNombre} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-slate-400">Cédula</label>
          <input type="number" value={cedula} onChange={alCambiarCedula} required />
        </div>
        <div className="space-y-1">
          <label className="text-slate-400">Nacimiento</label>
          <input type="date" value={fechaNacimiento} onChange={alCambiarFechaNacimiento} required />
        </div>
      </div>
    </div>
  )}
  {/* Campos de Correo y Contraseña */}
  <button type="submit">
    {modo === 'login' ? 'Entrar ahora' : 'Crear mi Historia'}
  </button>
</form>
```

#### Controlador Equivalente (Endpoint en FastAPI):
El endpoint procesa y valida la estructura de datos entrante usando esquemas de validación de datos `Pydantic` (equivalente a los Java Beans procesados en un servlet):
```python
# backend/main.py
@app.post("/api/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Lógica del Servlet
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya se encuentra registrado.")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        cedula=user.cedula,
        fecha_nacimiento=user.fecha_nacimiento,
        hashed_password=hashed_password,
        role=models.UserRole.patient
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
```



### 4.2. Indicador 2: Uso de los Métodos HTTP GET y POST para Parámetros
El protocolo HTTP utiliza métodos para indicar la acción que se desea realizar. Los Servlets usan `doGet` y `doPost` para capturar parámetros de la petición. En **Dental Blanc**, esta separación de métodos y captura de parámetros se define de la siguiente manera:

*   **Método POST (Envío de payloads complejos):** Se utiliza para iniciar sesión o registrar datos en la base de datos (seguridad de credenciales enviadas en el cuerpo del request en formato JSON y no expuestas en la URL).
```python
# Ejemplo de POST en main.py para creación de cita (Orden)
@app.post("/api/appointments")
def create_appointment(
    appointment: schemas.AppointmentCreate,  # Parámetro recibido en el Body (JSON)
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # Token de sesión (Header)
):
    ...
```

*   **Método GET (Obtención de colecciones y filtrados):** Se utiliza para listar datos (los servicios, las órdenes creadas) y recibir parámetros opcionales o de filtrado.
```python
# Ejemplo de GET en main.py para obtención de servicios catalogados
@app.get("/api/services", response_model=List[schemas.Service])
def get_services(db: Session = Depends(get_db)):
    return db.query(models.Service).filter(models.Service.is_active == True).all()
```



### 4.3. Indicador 3: Implementación de Elementos JSP (Equivalente JSX en React)
JavaServer Pages (JSP) inserta lógica dinámica de Java en HTML mediante etiquetas especiales (`<% %>` para scripts, `<%= %>` para expresiones evaluadas, y etiquetas de JSTL como `<c:forEach>` o `<c:if>`). 

En el desarrollo de interfaces modernas con **React JSX**, esta lógica se ejecuta de forma más limpia utilizando expresiones de Javascript directamente embebidas en las etiquetas XML:

1.  **Evaluación de Expresiones (`<%= user.getName() %>` en JSP vs `{usuario.nombre}` en JSX):**
    ```jsx
    {/* Se renderiza dinámicamente el mensaje según el estado 'modo' */}
    <h2 className="text-2xl font-extrabold text-slate-900">
      {modo === 'login' ? 'Bienvenido de nuevo' : 'Crea tu Historia'}
    </h2>
    ```

2.  **Renderizado Condicional (`<c:if>` en JSP vs Operador Lógico `&&` / Ternarios en JSX):**
    ```jsx
    {/* Si existe un mensaje de error, se renderiza el componente visual de alerta */}
    {error && (
      <div className="mb-6 rounded-2xl bg-red-50 p-4 text-center text-red-500">
        {error}
      </div>
    )}
    ```

3.  **Iteraciones y Bucles (`<c:forEach>` en JSP vs `.map()` en JSX):**
    Para renderizar las tarjetas del catálogo de servicios a partir de un arreglo JSON devuelto por el servidor, se mapea la colección de forma dinámica en [TarjetasServicios.jsx](file:///home/andrei/repositorios/odontologia/frontend/src/components/TarjetasServicios.jsx):
    ```jsx
    {servicios.map((servicio) => (
      <div key={servicio.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-50">
        <h3>{servicio.name}</h3>
        <p>{servicio.description}</p>
        <span>${servicio.price}</span>
      </div>
    ))}
    ```



### 4.4. Indicador 4: Utilización de Herramientas para Versionamiento del Código
El desarrollo del proyecto, la gestión del código fuente de React y FastAPI, y la documentación técnica de soporte han sido organizados bajo el control de versiones distribuidas de **Git**:

*   **Repositorio Local:** Gestionado localmente permitiendo confirmaciones estructuradas.
*   **Versionamiento del Código:** Registro del historial y cambios progresivos que garantizan la integridad y la posibilidad de auditar la evolución de los módulos codificados.
