# =========================================================================
# LÓGICA PRINCIPAL DEL BACKEND (main.py)
# =========================================================================
# Este archivo es el punto de entrada principal (Entrypoint) de la API REST 
# construida con FastAPI. Se encarga de gestionar las rutas HTTP (Endpoints)
# y conectar la lógica de la base de datos (SQLAlchemy) con la seguridad
# de autenticación de usuarios (JWT).

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import jose

# 1. Importaciones de módulos locales construidos para este proyecto
import models # "Definición de las tablas SQL"
import schemas # "Reglas de validación de los datos JSON"
import auth # "Funciones de hashing y JWT"
from database import engine, get_db

# 2. Instrucción a SQLAlchemy para que genere o detecte las tablas 
# de la Base de Datos SQLite (dental_blanc.db) automáticamente.
models.Base.metadata.create_all(bind=engine)

# 3. Inicialización del framework FastAPI con metadatos del proyecto
app = FastAPI(title="API Clínica Dental Blanc", version="2.0")

# 4. Configuración de CORS (Cross-Origin Resource Sharing)
# Permite que la aplicación Web (Frontend - React) que corre en un puerto HTTP distinto
# (ej: puerto 5173) pueda comunicarse sin problemas de seguridad con la API (puerto 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= PROTECCIÓN DE RUTAS (Filtros de Seguridad) =================

# 5. Configuración para indicar a FastAPI de dónde extraer el JWT
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

# 6. FUNCIÓN DE RASTREO: `get_current_user`
# Dependencia que se utiliza para proteger (secure) endpoints que requieran 
# que un usuario haya iniciado sesión (ej: Agendar una cita médica). 
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    
    # 6.1 Estructura del error 401 Unauthorized si el token es inválido o expiró
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas, sesión expirada, o formato incorrecto (Unauthorized)",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 6.2 Desencriptación y lectura interna del Token
    try:
        # Usa la SECRET_KEY (Llave del servidor) para abrir el JWT del usuario
        payload = jose.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        
        # Obtiene el identificador (`sub`: Subject/Email) del usuario
        email: str = payload.get("sub") 
        if email is None:
            raise credentials_exception
    except jose.JWTError:
        # Si la librería falla al leer el string, el token está corrupto y es rechazado
        raise credentials_exception
    
    # 6.3 Consulta de la existencia en la tabla Users de SQL.
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if user is None:
        raise credentials_exception # Si el usuario fue desactivado
    
    # Retorna el objeto completo del usuario (Permisos, ID, Rol, Correo...)
    return user


# ================= RUTAS: SISTEMA DE CUENTAS (USERS) =================

# @app.post("/api/register"): Endpoint para inscripción de un nuevo paciente.
# response_model=schemas.User evita que la función devuelva la contraseña hasheada
@app.post("/api/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # A. Consulta (SELECT) para asegurar que el correo (UniqueConstraint) no se repita.
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya se encuentra registrado.")
    
    # B. Se toma la contraseña plana (`user.password`) y se encripta de forma irreversible.
    hashed_password = auth.get_password_hash(user.password)
    
    # C. Se crea el objeto del modelo SQL
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        cedula=user.cedula,               # <= Se registra la Cédula suministrada (TO-DO SENA)
        fecha_nacimiento=user.fecha_nacimiento, # <= Se registra la Fecha (TO-DO SENA)
        hashed_password=hashed_password,
        role="patient" # Por defecto todos ingresan con permisos de cuenta básica (patient).
    )
    
    # D. "commit" y "refresh" envían la petición (INSERT) y leen su ID AutoIncremnetable
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user 


# @app.post("/api/login"): Endpoint encargado de iniciar las sesiones y devolver un JWT.
@app.post("/api/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # A. Busca el registro basado en el correo entregado (username)
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # B. Si no hay coincidencia, o el hash de contraseña falla (Contraseña errónea), retorna 401.
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error: Correo electrónico o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # C. Definimos el periodo de vigencia del JWT según las configuraciones Base
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # D. Generamos el JWT de respuesta insertando únicamente el email (`sub`) dentro de este
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Se retorna un JSON apto para el Storage de React
    return {"access_token": access_token, "token_type": "bearer"}


# ================= RUTAS: SERVICIOS Y PORTAFOLIO =================

# @app.get("/api/services"): Lista los servicios disponibles al Frontend
@app.get("/api/services", response_model=List[schemas.Service])
def get_services(db: Session = Depends(get_db)):
    # Ejecuta SELECT sobre los servicios marcados con estado "is_active" = True
    return db.query(models.Service).filter(models.Service.is_active == True).all()


# ================= RUTAS: AGENDAMIENTO Y RESERVAS =================

# @app.post("/api/appointments"): Confirmación de una nueva cita. Exige permisos de token.
@app.post("/api/appointments", response_model=schemas.Appointment)
def create_appointment(
    appointment: schemas.AppointmentCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # <= DEPENDECIA DE SEGURIDAD. SOLO LOGUEADOS
):
    # A. Verificación integral: Identificar si el servicio escogido sigue vigente en la BD.
    service = db.query(models.Service).filter(models.Service.id == appointment.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="El servicio odontológico solicitado figura como no disponible.")
    
    # B. Creación segura de Cita.
    # Extraemos el "patient_id" desde el JWT validado (current_user.id) para 
    # proteger contra Vulnerabilidades IDOR de manipulación de peticiones HTTP.
    new_appointment = models.Appointment(
        patient_id=current_user.id,
        service_id=appointment.service_id,
        date=appointment.date,
        time=appointment.time
    )
    
    # Insert de Cita y Commit final a SQLite
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    
    return new_appointment


# @app.get("/api/appointments"): Endpoint para generar listado del Historial de Citas
@app.get("/api/appointments", response_model=List[schemas.Appointment])
def get_appointments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    # A. Lógica Administrativa: Si es el gerente/admin, le entregamos el query de todo (all)
    if current_user.role == "admin":
        return db.query(models.Appointment).all()
        
    # B. Lógica de Pacientes (Privacidad): Limitamos el Query usando WHERE clause en base a su propia ID
    else:
        return db.query(models.Appointment).filter(models.Appointment.patient_id == current_user.id).all()
