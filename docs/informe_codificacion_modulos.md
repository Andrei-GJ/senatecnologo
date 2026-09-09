# INFORME TÉCNICO: CODIFICACIÓN DE MÓDULOS DEL SOFTWARE (DENTAL BLANC)
## CONEXIÓN A BASE DE DATOS, OPERACIONES CRUD, VERSIONAMIENTO Y ESTÁNDARES

**CÓDIGO DE EVIDENCIA:** GA7-220501096-AA2-EV01  
**PROGRAMA DE FORMACIÓN:** Análisis y desarrollo de software (ADSO)  
**PROYECTO FORMATIVO:** Construcción de software integrador de tecnologías orientadas a servicios  
**FASE DEL PROYECTO:** Ejecución  
**RESULTADO DE APRENDIZAJE:** 220501096-04 - Codificar el software de acuerdo con el diseño establecido.  
**ACTIVIDAD DE APRENDIZAJE:** GA7-220501096-AA2 - Aplicar estándares de codificación, de acuerdo con el diseño.  



## 1. DATOS GENERALES
*   **Nombre del Proyecto:** Dental Blanc - Sistema Clínico Odontológico (Fullstack)
*   **Aprendiz:** Andrei (ADSO)
*   **Fecha de Elaboración:** 17 de Agosto de 2026
*   **Tecnologías Principales:** Python (FastAPI), React (Vite), Supabase (PostgreSQL), SQLAlchemy, Git.



## 2. INTRODUCCIÓN
El presente documento describe la codificación y estructuración técnica del sistema clínico odontológico **Dental Blanc**. Este informe ha sido estructurado para dar cumplimiento a los indicadores de la lista de chequeo de la evidencia **GA7-220501096-AA2-EV01**, la cual evalúa la conexión a bases de datos, las operaciones CRUD, el uso de herramientas de versionamiento y la adopción de un estándar de codificación riguroso.

Dado que el proyecto utiliza un stack moderno basado en **Python (FastAPI)** para el backend y **React** para el frontend, este informe detalla las equivalencias tecnológicas aplicadas en el desarrollo (como el uso de SQLAlchemy y motores relacionales sobre Supabase en lugar de la API JDBC nativa de Java) para lograr el mismo objetivo pedagógico y técnico con un rendimiento superior y acorde al diseño de la aplicación.



## 3. CUMPLIMIENTO DE LA LISTA DE CHEQUEO

### 3.1. Variable 1: Conexión con Bases de Datos (Equivalencia JDBC)
En los entornos de desarrollo Python, el equivalente directo a JDBC (Java Database Connectivity) para bases de datos relacionales es el uso de un controlador nativo de PostgreSQL (`psycopg2`) combinado con un motor ORM como **SQLAlchemy**. 

Para la base de datos distribuida en la nube de **Supabase (PostgreSQL)**, la conexión se configura de forma segura en el archivo [database.py](file:///home/andrei/repositorios/odontologia/backend/database.py).

#### Fragmento de Código de Conexión:
```python
# database.py
import os
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Carga de variables del archivo .env
load_dotenv(find_dotenv(), override=True)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Creación del motor de conexión PostgreSQL (Supabase) con pool de conexiones
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,      # Valida que la conexión esté viva antes de usarla
    pool_recycle=60,         # Recicla conexiones cada 60 segundos
    connect_args={
        "sslmode": "require", # Exige conexión cifrada SSL (Seguridad)
        "connect_timeout": 5
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### 3.2. Variable 2: Aplicación del CRUD (Create y Read sobre la base de datos)
El sistema implementa de forma nativa las operaciones del ciclo de vida de los datos. A continuación, se detallan las operaciones correspondientes para las Cuentas de Usuarios y las Citas Médicas / Órdenes en el archivo [main.py](file:///home/andrei/repositorios/odontologia/backend/main.py):

#### A. CREATE (Creación de registros - Registro de Pacientes y Citas)
El endpoint `POST /api/register` realiza la creación de un nuevo usuario en la base de datos (con contraseña encriptada de manera irreversible).
```python
@app.post("/api/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
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

Asimismo, el endpoint `POST /api/appointments` permite registrar nuevas citas/órdenes asociando al cliente con un servicio odontológico específico.
```python
@app.post("/api/appointments")
def create_appointment(
    appointment: schemas.AppointmentCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    service = db.query(models.Service).filter(models.Service.id == appointment.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="El servicio odontológico solicitado figura como no disponible.")

    new_order = models.Order(
        client_id=current_user.id,
        service_id=appointment.service_id,
        date=appointment.date,
        time=appointment.time,
        status="pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order
```

#### B. READ (Lectura de registros - Catálogo de Servicios y Listado de Órdenes)
El endpoint `GET /api/services` permite consultar el catálogo de tratamientos activos y disponibles:
```python
@app.get("/api/services", response_model=List[schemas.Service])
def get_services(db: Session = Depends(get_db)):
    return db.query(models.Service).filter(models.Service.is_active == True).all()
```

Los endpoints `GET /api/appointments` y `GET /api/orders` permiten listar las citas médicas/órdenes del usuario autenticado o todos los registros si el usuario cuenta con el rol `admin`.
```python
@app.get("/api/orders", response_model=List[schemas.Order])
def get_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role == "admin":
        return db.query(models.Order).all()
    else:
        return db.query(models.Order).filter(models.Order.client_id == current_user.id).all()
```

### 3.3. Variable 3: Herramientas de Versionamiento
El proyecto utiliza **Git** como sistema de control de versiones local y **GitHub** como plataforma de almacenamiento remoto. Esto asegura la trazabilidad completa del desarrollo del código fuente y facilita el control de versiones en equipo.

*   **Estructura de Versionamiento:** Se gestiona mediante confirmaciones locales (`git commit`) y sincronizaciones remotas (`git push`/`git pull`).
*   **Gestión de Exclusiones:** El archivo [.gitignore](file:///home/andrei/repositorios/odontologia/.gitignore) se encuentra debidamente configurado en la raíz del proyecto para excluir dependencias compiladas (`node_modules`, `venv`) y variables de entorno sensibles (`.env`).
*   **Commits Semánticos:** Los mensajes de commit se redactan bajo la convención *Conventional Commits* (`feat: ...`, `fix: ...`, `docs: ...`), garantizando una bitácora limpia y estructurada.

### 3.4. Variable 4: Estándar de Codificación Definido
Para asegurar la legibilidad, escalabilidad y coherencia del software, se adoptan los siguientes estándares oficiales de la industria:

1.  **Backend (Python):** Se sigue de forma estricta la guía de estilos **PEP 8** (sangría de 4 espacios, nombrado en `snake_case` para variables y funciones, `PascalCase` para clases de modelos SQLAlchemy y esquemas de Pydantic). Adicionalmente se aplican anotaciones de tipo nativas (`Type Hints`) y docstrings explicativos en cada función.
2.  **Frontend (React/JSX):** Componentes estructurados en `PascalCase` (ej: [TarjetasServicios.jsx](file:///home/andrei/repositorios/odontologia/frontend/src/components/TarjetasServicios.jsx)), nombres de funciones y hooks en `camelCase`. Separación rigurosa de vistas y lógica de componentes para facilitar la reutilización.



## 4. CONCLUSIONES
*   El backend en FastAPI y SQLAlchemy proporciona una persistencia robusta e comercialmente viable comparable a sistemas JDBC tradicionales de Java, implementando pools de conexiones eficientes y optimizados hacia la base de datos de Supabase.
*   Las operaciones del ciclo de vida de los datos han sido desplegadas y documentadas en endpoints REST estandarizados, listos para ser consumidos de forma síncrona y segura por el frontend en React.
*   La combinación de un estándar de codificación definido (PEP 8 / React Clean Code) y el versionamiento detallado con Git garantiza la calidad y mantenibilidad del software de acuerdo con los criterios de evaluación de la formación.
