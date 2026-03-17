# ==========================================
# CEREBRO PRINCIPAL DE LA APLICACIÓN (main.py)
# ==========================================
# FastAPI es el encargado de abrir los puertos de tu internet para 
# conectarse con la pantalla visual (React). Cada @app.algo es una puerta 
# con su propio número. Tú tocas, pides algo (como citas) y Python responde.

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import jose

# 1. Traemos nuestros propios manuales de otras partes
import models
import schemas
import auth
from database import engine, get_db

# 2. Le decimos a "SQLAlchemy" (el gerente de Base de Datos) que haga su magia.
# Revisará si existe un archivo dental_blanc.db y sus tablas, si no, las CREA él mismo.
models.Base.metadata.create_all(bind=engine)

# 3. Nace nuestra aplicación "app". Así le diremos de cariño.
app = FastAPI(title="API Clínica Dental Blanc", version="2.0")

# 4. CORS (Vigilante De Puertas).
# React vive en "localhost:5173", y FastAPI vive en "localhost:8000".
# Para los navegadores, eso es como venir de un país extraño y BLOQUEAN LA ENTRADA POR SEGURIDAD.
# CORS le avisa al navegador: "Sí soy yo, confío en ellos, por favor déjalos entrar".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Aquí decimos que confía en TODO EL MUNDO (Solo por estar en pruebas/desarrollo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= SEGURIDAD DE ACCESO (Cero Cédulas Falsas) =================

# 5. Le indicamos a FastAPI en qué ruta van a llegar los "Documentos de Identidad" (correos y contraseñas)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

# 6. "El Detector de Mentiras" (Una Dependencia / Función automática de seguridad)
# Si tú le pones `Depends(get_current_user)` a CUALQUIER OTRA RUTA, le estarás diciendo a Python:
# "Oye, antes de dejar a este paciente entrar a la sala, pídela la llave, 
# destápala (token), verifica que sea su correo real y sácalo de la base de datos".
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    
    # 6.1 Este es el golpe que daremos si la llave es falsa, caducada o robada "401 UNAUTHORIZED"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Lo sentimos, no pudimos verificar tus credenciales o tu sesión caducó.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 6.2 Desenmascarar al portador usando el "Lector" secreto HS256 (jose.jwt.decode)
    try:
        payload = jose.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub") # Extrae el correo escondido dentro del Token
        if email is None:
            raise credentials_exception
    except jose.JWTError:
        # Si falló al leer el token o estaba malicioso, tiramos error sin piedad
        raise credentials_exception
    
    # 6.3 Si el token era real, buscamos a la persona de carne y hueso en nuestra base de datos SQL
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if user is None:
        raise credentials_exception # Si la despidieron pero el token seguía vivo...
    
    # ¡Aprobado! "Puedes pasar señor/a" devolvemos todos sus datos completos al endpoint.
    return user


# ================= GESTIÓN DE PACIENTES O USUARIOS =================

# RUTA 1: Para cuando alguien hace clic en "Registrarme" en la web
# Retornamos el esquema "schemas.User" (sin la contraseña para que los hackers no la vean)
@app.post("/api/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # A. Revisar que su correo no esté ya inscrito
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Este correo electrónico ya está registrado.")
    
    # B. Agarrar la contraseña plana que digitó, meterla al horno encriptador y sacarla como "Sopa de letras"
    hashed_password = auth.get_password_hash(user.password)
    
    # C. Preparar la hoja de vida para guardar en la BD.
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        cedula=user.cedula,               # <= Nuevo DATO
        fecha_nacimiento=user.fecha_nacimiento, # <= Nuevo DATO
        hashed_password=hashed_password,
        role="patient" # Por regla, todos empiezan como paciente
    )
    
    # D. Guardar (add) y asegurar los cambios (commit) en el disco duro.
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Esto nos devuelve la hoja ya confirmada con un "ID" numérico oficial.
    
    return new_user


# RUTA 2: Entregar la LLAVE DE ORO (Token JWT) a los que se saben su cuenta
@app.post("/api/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # A. Buscar en la base de datos a ver quién es este atrevido "form_data.username"
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # B. Si no existe, O si sacando la sopa de letras del horno se ve desigual... Adiós 401.
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Uy, el correo electrónico o la contraseña que usaste son incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # C. Si lograste cruzar, te forjo una llave de tiempo mágico temporal (Expira en 7 días)
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Lo envolvemos todo y te lo devolvemos en bandeja de JSON.
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ================= SERVICIOS (El Portafolio de la Clínica) =================

# RUTA 3: El Frontend pide la lista de todos ("all") los servicios odontologicos
@app.get("/api/services", response_model=List[schemas.Service])
def get_services(db: Session = Depends(get_db)):
    # Solo dame los servicios que todavía no hayan sido borrados o cancelados en la vida real
    return db.query(models.Service).filter(models.Service.is_active == True).all()

# RUTA 4: Exclusivo para el Jefe ("Admin")
@app.post("/api/services", response_model=schemas.Service)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    # Verificamos si la persona validada es un paciente chismoso o el "Admin" real.
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Esta zona está prohibida, no eres personal autorizado.")
        
    new_service = models.Service(**service.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service


# ================= CITAS (Agendamiento por pacientes) =================

# RUTA 5: Agendar Cita ("POST")
@app.post("/api/appointments", response_model=schemas.Appointment)
def create_appointment(
    appointment: schemas.AppointmentCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # <= VIGILANTE ALERTA AQUÍ
):
    # A. Verificamos si el servicio que el paciente quiere, ¿Existe?
    service = db.query(models.Service).filter(models.Service.id == appointment.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="El servicio dental pedido desapareció :(")
    
    # B. Creamos la cita enlazándola internamente con el ID del que está detrás del teclado 
    # Múltiples hackers no pueden agendar a nombre de otro, porque `current_user.id` jala el dato 
    # desde la misma profundidad del TOKEN encriptado, no desde los dedos del usuario. Genial, ¿no?
    new_appointment = models.Appointment(
        patient_id=current_user.id,
        service_id=appointment.service_id,
        date=appointment.date,
        time=appointment.time
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    
    return new_appointment


# RUTA 6: ¡Ver mis citas de doctor!
@app.get("/api/appointments", response_model=List[schemas.Appointment])
def get_appointments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Lógica de oro: Si el jefe o doctores piden la lista, les mostramos TODO.
    if current_user.role == "admin":
        return db.query(models.Appointment).all()
        
    # Si eres paciente, te muestro exclusívamente las hojas de Excel que pertenecen "únicamente" a ti. (privacidad)
    else:
        return db.query(models.Appointment).filter(models.Appointment.patient_id == current_user.id).all()
