# =========================================================================
# LÓGICA PRINCIPAL DEL BACKEND (main.py)
# =========================================================================
# Este archivo es el punto de entrada principal (Entrypoint) de la API REST 
# construida con FastAPI. Se encarga de gestionar las rutas HTTP (Endpoints)
# y conectar la lógica de la base de datos (SQLAlchemy) con la seguridad
# de autenticación de usuarios (JWT).

from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timedelta, timezone, time
from zoneinfo import ZoneInfo
import jose

BOGOTA_TZ = ZoneInfo("America/Bogota")

# 1. Importaciones de módulos locales construidos para este proyecto
import models # "Definición de las tablas SQL"
import schemas # "Reglas de validación de los datos JSON"
import auth # "Funciones de hashing y JWT"
from database import engine, get_db
from pdf_service import generate_appointment_pdf

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

# Middleware para anular cualquier cacheo HTTP de navegadores o proxies intermedios
from starlette.requests import Request

@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# ================= PROTECCIÓN DE RUTAS (Filtros de Seguridad) =================

# 5. Configuración para indicar a FastAPI de dónde extraer el JWT
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/login", auto_error=False)

def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
) -> Optional[models.User]:
    """Obtiene el usuario actual si se provee token; de lo contrario devuelve None sin bloquear."""
    if not token:
        return None
    try:
        payload = jose.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            return None
        return db.query(models.User).filter(models.User.email == email).first()
    except (jose.JWTError, Exception):
        return None

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


# Helper para formatear citas enriquecidas con datos del paciente, odontólogo y servicio
def format_appointment(order: models.Order) -> dict:
    return {
        "id": order.id,
        "client_id": order.client_id,
        "client_name": order.client.full_name if order.client else "",
        "client_email": order.client.email if order.client else "",
        "dentist_id": order.dentist_id,
        "dentist_name": order.dentist.full_name if order.dentist else None,
        "service_id": order.service_id,
        "service_name": order.service.name if order.service else "",
        "service_price": float(order.service.price) if order.service and order.service.price is not None else 0.0,
        "date": order.date.isoformat() if order.date else None,
        "time": (order.time.strftime("%H:%M:%S") if order.time else None),
        "status": order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


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
        role=models.UserRole.patient # Por defecto todos ingresan como paciente (seguridad estricta)
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
    
    # Se retorna un JSON apto para el Storage de React con token e identidad de usuario
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


# @app.get("/api/me"): Endpoint protegido para resolver la identidad de sesión
@app.get("/api/me", response_model=schemas.User)
@app.get("/api/users/me", response_model=schemas.User)
def get_authenticated_user(current_user: models.User = Depends(get_current_user)):
    return current_user


# Helper para requerir rol de Administrador
def require_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación restringida para administradores.",
        )
    return current_user


# ================= RUTAS: SERVICIOS Y PORTAFOLIO =================

# @app.get("/api/services"): Lista los servicios disponibles al Frontend
@app.get("/api/services", response_model=List[schemas.Service])
def get_services(db: Session = Depends(get_db)):
    # Ejecuta SELECT sobre los servicios marcados con estado "is_active" = True
    return db.query(models.Service).filter(models.Service.is_active == True).order_by(models.Service.id.asc()).all()


# @app.get("/api/admin/services"): Lista todos los servicios (activos e inactivos) para gestión
@app.get("/api/admin/services", response_model=List[schemas.Service])
def get_all_services_admin(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    return db.query(models.Service).order_by(models.Service.id.asc()).all()


# @app.post("/api/services"): Crear un nuevo servicio odontológico
@app.post("/api/services", response_model=schemas.Service, status_code=status.HTTP_201_CREATED)
def create_service(
    service_in: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    new_service = models.Service(
        name=service_in.name,
        description=service_in.description,
        price=service_in.price,
        is_active=True,
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service


# @app.put("/api/services/{service_id}"): Modificar un servicio existente
@app.put("/api/services/{service_id}", response_model=schemas.Service)
def update_service(
    service_id: int,
    service_in: schemas.ServiceUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    srv = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Servicio odontológico no encontrado.")
    
    if service_in.name is not None:
        srv.name = service_in.name
    if service_in.description is not None:
        srv.description = service_in.description
    if service_in.price is not None:
        srv.price = service_in.price
    if service_in.is_active is not None:
        srv.is_active = service_in.is_active

    db.commit()
    db.refresh(srv)
    return srv


# @app.delete("/api/services/{service_id}"): Desactivar un servicio (borrado lógico)
@app.delete("/api/services/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    srv = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Servicio odontológico no encontrado.")
    srv.is_active = False
    db.commit()
    return {"detail": "Servicio desactivado correctamente."}


# ================= RUTAS: CUADRO MÉDICO / ODONTÓLOGOS =================

# @app.get("/api/dentists"): Retorna la lista de usuarios activos con rol dentist
@app.get("/api/dentists", response_model=List[schemas.DentistUser])
def get_dentists(db: Session = Depends(get_db)):
    return (
        db.query(models.User)
        .filter(models.User.role == "dentist", models.User.is_active == True)
        .order_by(models.User.full_name.asc())
        .all()
    )


# @app.post("/api/dentists"): Creación de un nuevo odontólogo (Exclusivo Administrador)
@app.post("/api/dentists", response_model=schemas.DentistResponse, status_code=status.HTTP_201_CREATED)
def create_dentist(
    dentist_in: schemas.DentistCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador para dar de alta nuevos odontólogos.",
        )

    nombre_limpio = dentist_in.full_name.strip()
    if len(nombre_limpio) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre del especialista debe tener al menos 3 caracteres.",
        )

    email_limpio = str(dentist_in.email).strip().lower()
    existente_email = db.query(models.User).filter(models.User.email == email_limpio).first()
    if existente_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario o doctor registrado con este correo electrónico institucional.",
        )

    cedula_limpia = dentist_in.cedula.strip() if dentist_in.cedula else None
    if cedula_limpia:
        existente_cedula = db.query(models.User).filter(models.User.cedula == cedula_limpia).first()
        if existente_cedula:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un usuario o doctor registrado con este número de cédula profesional.",
            )

    password_plana = (
        dentist_in.password.strip()
        if dentist_in.password and len(dentist_in.password.strip()) >= 6
        else "Dental123!"
    )

    nuevo_doctor = models.User(
        email=email_limpio,
        full_name=nombre_limpio,
        cedula=cedula_limpia,
        fecha_nacimiento=dentist_in.fecha_nacimiento,
        hashed_password=auth.get_password_hash(password_plana),
        role=models.UserRole.dentist,
        is_active=True,
    )

    db.add(nuevo_doctor)
    db.commit()
    db.refresh(nuevo_doctor)
    return nuevo_doctor


# @app.delete("/api/dentists/{dentist_id}"): Desactivar odontólogo (Exclusivo Administrador)
@app.delete("/api/dentists/{dentist_id}")
def deactivate_dentist(
    dentist_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador para gestionar odontólogos.",
        )

    doctor = db.query(models.User).filter(models.User.id == dentist_id, models.User.role == "dentist").first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Odontólogo no encontrado en la base de datos.")

    doctor.is_active = False
    db.commit()
    return {"detail": f"Odontólogo {doctor.full_name} desactivado del cuadro médico."}


# ================= RUTAS: AGENDAMIENTO Y RESERVAS =================

VALID_APPOINTMENT_STATUSES = {"pending", "confirmed", "completed", "cancelled"}

# Horarios oficiales de atención clínica de Dental Blanc (07:00 a 19:00 cada 30 minutos)
CLINIC_HOURS = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
]

# @app.get("/api/available-slots"): Retorna la disponibilidad y conteo de ocupación médica por fecha
@app.get("/api/available-slots")
def get_available_slots(
    date: str, 
    email: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    active_dentists_count = (
        db.query(models.User)
        .filter(models.User.role == "dentist", models.User.is_active == True)
        .count()
    )

    active_orders = (
        db.query(models.Order)
        .filter(
            models.Order.date == date,
            models.Order.dentist_id.isnot(None),
            models.Order.status != "cancelled",
        )
        .all()
    )

    busy_slots = {}
    for o in active_orders:
        hora_str = str(o.time)[:5]
        busy_slots[hora_str] = busy_slots.get(hora_str, 0) + 1

    # Identificar paciente: por token de sesión o por correo de contacto en formulario
    patient_user = current_user
    if not patient_user and email and "@" in email:
        patient_user = db.query(models.User).filter(models.User.email == email.strip().lower()).first()

    # Verificar si el paciente ya tiene cita programada en la fecha seleccionada
    patient_appointment_today = None
    if patient_user and patient_user.role == "patient":
        existing_order = (
            db.query(models.Order)
            .options(joinedload(models.Order.dentist))
            .filter(
                models.Order.client_id == patient_user.id,
                models.Order.date == date,
                models.Order.status != "cancelled",
            )
            .first()
        )
        if existing_order:
            patient_appointment_today = {
                "id": existing_order.id,
                "time": str(existing_order.time)[:5],
                "dentist": existing_order.dentist.full_name if existing_order.dentist else "Especialista Clínico",
            }

    # Validar fecha respecto a la hora oficial de Colombia
    now_bogota = datetime.now(BOGOTA_TZ)
    today_str = now_bogota.strftime("%Y-%m-%d")
    current_time_str = now_bogota.strftime("%H:%M")

    # Si la fecha solicitada es anterior a hoy, no hay disponibilidad
    if date < today_str:
        return {
            "date": date,
            "total_dentists": active_dentists_count,
            "busy_slots": busy_slots,
            "available_hours": [],
            "patient_appointment_today": None,
        }

    # Calcular franjas que aún cuentan con cupo médico disponible
    # Si la clínica tiene N odontólogos y una hora tiene N turnos asignados, esa hora no se ofrece
    available_hours = []
    if not patient_appointment_today:
        for h in CLINIC_HOURS:
            # Si la consulta es para el día de hoy, descartar horas que ya pasaron
            if date == today_str and h <= current_time_str:
                continue

            ocupadas = busy_slots.get(h, 0)
            if active_dentists_count > 0 and ocupadas < active_dentists_count:
                available_hours.append(h)

    return {
        "date": date,
        "total_dentists": active_dentists_count,
        "busy_slots": busy_slots,
        "available_hours": available_hours,
        "patient_appointment_today": patient_appointment_today,
    }


# @app.post("/api/appointments"): Confirmación de una nueva cita. 
# Admite usuarios autenticados o agendamiento directo sin fricción con auto-registro y asignación automática de doctor.
@app.post("/api/appointments", response_model=schemas.AppointmentResponse)
def create_appointment(
    appointment: schemas.AppointmentCreate, 
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    # A. Verificación integral: Identificar si el servicio escogido sigue vigente en la BD.
    service = db.query(models.Service).filter(models.Service.id == appointment.service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El servicio odontológico solicitado figura como no disponible.")

    # B. Resolver paciente: si ya está logueado se usa; si no, se busca o auto-registra sin fricción
    client_user = current_user
    new_token = None

    if not client_user:
        if not appointment.email or not appointment.email.strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Se requiere iniciar sesión o ingresar correo de contacto para confirmar la cita médica.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        email_str = appointment.email.strip().lower()
        if "@" not in email_str or "." not in email_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ingresado no tiene un formato válido."
            )

        existing = db.query(models.User).filter(models.User.email == email_str).first()
        if existing:
            client_user = existing
            if appointment.full_name and (not existing.full_name or existing.full_name == "Paciente"):
                existing.full_name = appointment.full_name.strip()
            if appointment.cedula and not existing.cedula:
                existing.cedula = appointment.cedula.strip()
            db.commit()
        else:
            if appointment.cedula:
                cedula_user = db.query(models.User).filter(models.User.cedula == appointment.cedula.strip()).first()
                if cedula_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"El documento de identidad {appointment.cedula} ya está registrado con otro correo electrónico ({cedula_user.email})."
                    )

            client_name = (
                appointment.full_name.strip()
                if appointment.full_name and appointment.full_name.strip()
                else email_str.split("@")[0].capitalize()
            )
            client_user = models.User(
                email=email_str,
                full_name=client_name,
                cedula=appointment.cedula.strip() if appointment.cedula else None,
                hashed_password=auth.get_password_hash("DentalBlanc123!"),
                role=models.UserRole.patient,
                is_active=True,
            )
            db.add(client_user)
            db.commit()
            db.refresh(client_user)

        # Token JWT para auto-login del paciente en frontend
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_token = auth.create_access_token(
            data={"sub": client_user.email}, expires_delta=access_token_expires
        )

    # C. Validación de horario de atención clínica (07:00 a 19:00) y fecha futura
    if appointment.time < time(7, 0) or appointment.time > time(19, 0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El horario de atención odontológica es de 07:00 a 19:00."
        )

    # Validación de fecha y hora futura (horario de Colombia)
    now_bogota = datetime.now(BOGOTA_TZ)
    today_date = now_bogota.date()
    current_time = now_bogota.time()

    if appointment.date < today_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No es posible agendar citas en fechas pasadas."
        )

    if appointment.date == today_date and appointment.time <= current_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La hora seleccionada ({str(appointment.time)[:5]}) ya ha pasado el día de hoy. Por favor selecciona una hora futura."
        )

    # C. Validar conflictos del paciente (evitar citas duplicadas para la misma persona)
    # 1. Validación de mismo horario exacto
    patient_slot_conflict = (
        db.query(models.Order)
        .filter(
            models.Order.client_id == client_user.id,
            models.Order.date == appointment.date,
            models.Order.time == appointment.time,
            models.Order.status != "cancelled",
        )
        .first()
    )
    if patient_slot_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya tienes una cita confirmada para el {appointment.date} a las {str(appointment.time)[:5]} (Turno #{patient_slot_conflict.id}). No es posible agendar dos consultas a la misma hora.",
        )

    # 2. Validación de misma fecha: regla clínica de una sola consulta odontológica por día por paciente
    patient_day_conflict = (
        db.query(models.Order)
        .filter(
            models.Order.client_id == client_user.id,
            models.Order.date == appointment.date,
            models.Order.status != "cancelled",
        )
        .first()
    )
    if patient_day_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya tienes una cita asignada para el día {appointment.date} a las {str(patient_day_conflict.time)[:5]} (Turno #{patient_day_conflict.id}). Por política de la clínica, solo se permite una consulta por paciente al día.",
        )

    # D. Asignar odontólogo tratante y validar capacidad / sobrecupo médico
    assigned_dentist = None

    active_dentists = (
        db.query(models.User)
        .filter(models.User.role == "dentist", models.User.is_active == True)
        .order_by(models.User.id.asc())
        .all()
    )

    busy_dentist_ids = set(
        row[0]
        for row in db.query(models.Order.dentist_id)
        .filter(
            models.Order.date == appointment.date,
            models.Order.time == appointment.time,
            models.Order.dentist_id.isnot(None),
            models.Order.status != "cancelled",
        )
        .all()
    )

    if appointment.dentist_id:
        assigned_dentist = next((d for d in active_dentists if d.id == appointment.dentist_id), None)
        if not assigned_dentist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El odontólogo seleccionado no se encuentra disponible o activo.",
            )
        if assigned_dentist.id in busy_dentist_ids:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El Dr(a). {assigned_dentist.full_name} ya tiene un turno agendado para el {appointment.date} a las {appointment.time}. Por favor selecciona otro horario o especialista.",
            )
    elif appointment.auto_assign or current_user is None:
        if not active_dentists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay odontólogos activos registrados en la clínica.",
            )

        # Buscar especialistas activos que no estén ocupados en esa misma fecha y hora
        available_dentists = [d for d in active_dentists if d.id not in busy_dentist_ids]

        if not available_dentists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"No hay disponibilidad médica para el {appointment.date} a las {appointment.time}. Todos los especialistas ({len(active_dentists)}) se encuentran ocupados en este horario. Por favor selecciona otro horario.",
            )

        assigned_dentist = available_dentists[0]

    # D. Creamos la orden con doctor asignado
    new_order = models.Order(
        client_id=client_user.id,
        dentist_id=assigned_dentist.id if assigned_dentist else None,
        service_id=appointment.service_id,
        date=appointment.date,
        time=appointment.time,
        status="pending"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Cargar relaciones para respuesta enriquecida
    new_order.client = client_user
    new_order.service = service
    new_order.dentist = assigned_dentist

    res = format_appointment(new_order)
    if new_token:
        res["access_token"] = new_token
        res["token_type"] = "bearer"
        res["user"] = {
            "id": client_user.id,
            "email": client_user.email,
            "full_name": client_user.full_name,
            "cedula": client_user.cedula,
            "role": client_user.role,
            "is_active": client_user.is_active
        }
    return res


# @app.get("/api/appointments"): Endpoint para generar listado enriquecido del Historial de Citas
@app.get("/api/appointments", response_model=List[schemas.AppointmentResponse])
def get_appointments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Order).options(
        joinedload(models.Order.client),
        joinedload(models.Order.service),
        joinedload(models.Order.dentist),
    )
    if current_user.role == "admin":
        rows = query.order_by(models.Order.date.desc(), models.Order.time.desc()).all()
    elif current_user.role == "dentist":
        rows = query.filter(models.Order.dentist_id == current_user.id).order_by(models.Order.date.desc(), models.Order.time.desc()).all()
    else:
        rows = query.filter(models.Order.client_id == current_user.id).order_by(models.Order.date.desc(), models.Order.time.desc()).all()

    return [format_appointment(r) for r in rows]


# @app.patch("/api/appointments/{appointment_id}/assign-dentist"): Asignar odontólogo a una cita médica
@app.patch("/api/appointments/{appointment_id}/assign-dentist", response_model=schemas.AppointmentResponse)
def assign_dentist(
    appointment_id: int,
    payload: schemas.AssignDentistRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador para asignar odontólogos.",
        )

    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.client),
            joinedload(models.Order.service),
            joinedload(models.Order.dentist),
        )
        .filter(models.Order.id == appointment_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada.")

    dentist = db.query(models.User).filter(models.User.id == payload.dentist_id).first()
    if not dentist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Odontólogo no encontrado.")

    if dentist.role != "dentist":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario especificado no tiene el rol de odontólogo.",
        )

    # Validar si el odontólogo ya se encuentra ocupado en esa fecha y hora
    conflict = (
        db.query(models.Order)
        .filter(
            models.Order.id != order.id,
            models.Order.dentist_id == dentist.id,
            models.Order.date == order.date,
            models.Order.time == order.time,
            models.Order.status != "cancelled",
        )
        .first()
    )
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El Dr(a). {dentist.full_name} ya tiene asignada la cita #{conflict.id} para esa misma fecha y hora.",
        )

    order.dentist_id = dentist.id
    order.dentist = dentist
    db.commit()
    db.refresh(order)
    return format_appointment(order)


# @app.patch("/api/appointments/{appointment_id}/cancel"): Cancelación de cita por paciente o admin
@app.patch("/api/appointments/{appointment_id}/cancel", response_model=schemas.AppointmentResponse)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.client),
            joinedload(models.Order.service),
            joinedload(models.Order.dentist),
        )
        .filter(models.Order.id == appointment_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada.")

    if current_user.role != "admin" and order.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para cancelar esta cita.",
        )

    order.status = "cancelled"
    db.commit()
    db.refresh(order)
    return format_appointment(order)


# @app.patch("/api/appointments/{appointment_id}/status"): Actualización de estado de cita por admin
@app.patch("/api/appointments/{appointment_id}/status", response_model=schemas.AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    payload: schemas.AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador para cambiar el estado de citas.",
        )

    if payload.status not in VALID_APPOINTMENT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado inválido. Debe ser uno de: {sorted(list(VALID_APPOINTMENT_STATUSES))}",
        )

    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.client),
            joinedload(models.Order.service),
            joinedload(models.Order.dentist),
        )
        .filter(models.Order.id == appointment_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada.")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return format_appointment(order)


# @app.get("/api/appointments/{appointment_id}/pdf"): Descarga del comprobante oficial de cita médica
@app.get("/api/appointments/{appointment_id}/pdf")
def download_appointment_pdf(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.client),
            joinedload(models.Order.service),
            joinedload(models.Order.dentist),
        )
        .filter(models.Order.id == appointment_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada.")

    # Control de acceso estricto: solo el paciente dueño, el odontólogo asignado o un admin
    es_dueno = order.client_id == current_user.id
    es_dentista_asignado = order.dentist_id == current_user.id
    es_admin = current_user.role == "admin"

    if not (es_dueno or es_dentista_asignado or es_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para descargar el comprobante de esta cita médica.",
        )

    pdf_bytes = generate_appointment_pdf(order)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=comprobante_cita_{appointment_id}.pdf"
        },
    )


# @app.get("/api/orders"): Endpoint para generar listado de Órdenes creadas
@app.get("/api/orders", response_model=List[schemas.Order])
def get_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    # A. Lógica Administrativa: Si es admin, ve todas las órdenes
    if current_user.role == "admin":
        return db.query(models.Order).all()
        
    # B. Lógica de Clientes: Limitamos el Query a las suyas propias
    else:
        return db.query(models.Order).filter(models.Order.client_id == current_user.id).all()


# ================= RUTAS: BLOG INSTITUCIONAL =================

def _seed_initial_blogs_if_empty(db: Session):
    conteo = db.query(models.BlogPost).count()
    if conteo == 0:
        articulos_iniciales = [
            models.BlogPost(
                title="5 Consejos para un cepillado efectivo",
                excerpt="Descubre los errores más comunes que la mayoría comete al cepillarse los dientes y cómo solucionarlos para lograr una higiene bucal perfecta.",
                content="Mantener una adecuada técnica de cepillado es la base de una salud bucal duradera. Utiliza cepillo de cerdas suaves con inclinación de 45 grados respecto a la encía, cepilla suavemente durante al menos dos minutos y no olvides usar hilo dental a diario para limpiar entre los espacios interdentales donde el cepillo no alcanza.",
                author="Dr. Santiago Sotelo",
                date="10 de Marzo, 2024",
                is_active=True,
            ),
            models.BlogPost(
                title="Mitos y verdades sobre el blanqueamiento dental",
                excerpt="¿Daña el esmalte? ¿Causa sensibilidad a largo plazo? Aclaramos todas tus dudas sobre este popular tratamiento estético.",
                content="El blanqueamiento dental supervisado por un profesional es un procedimiento seguro y predecible. Los geles blanqueadores a base de peróxido de hidrógeno o carbamida actúan sobre las moléculas de pigmento orgánico en la dentina sin degradar la estructura del esmalte dental.",
                author="Dra. Valeria Gómez",
                date="25 de Febrero, 2024",
                is_active=True,
            ),
            models.BlogPost(
                title="La importancia de la limpieza profesional periódica",
                excerpt="Una limpieza en casa no es suficiente. Te explicamos por qué acudir al odontólogo cada seis meses es clave para prevenir sarro y caries.",
                content="El sarro dental no puede removerse con el cepillo común; requiere instrumentación ultrasónica profesional para desorganizar el biofilm bacteriano y prevenir la periodontitis y pérdida ósea dental.",
                author="Dr. Armando Guerra",
                date="14 de Febrero, 2024",
                is_active=True,
            ),
        ]
        db.add_all(articulos_iniciales)
        db.commit()


@app.get("/api/blogs", response_model=List[schemas.BlogPostResponse])
def get_blogs(db: Session = Depends(get_db)):
    _seed_initial_blogs_if_empty(db)
    return (
        db.query(models.BlogPost)
        .filter(models.BlogPost.is_active == True)
        .order_by(models.BlogPost.id.desc())
        .all()
    )


@app.get("/api/admin/blogs", response_model=List[schemas.BlogPostResponse])
def get_all_blogs_admin(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    _seed_initial_blogs_if_empty(db)
    return db.query(models.BlogPost).order_by(models.BlogPost.id.desc()).all()


@app.get("/api/blogs/{blog_id}", response_model=schemas.BlogPostResponse)
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    _seed_initial_blogs_if_empty(db)
    post = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id).first()
    if not post or not post.is_active:
        raise HTTPException(status_code=404, detail="Artículo de blog no encontrado.")
    return post


@app.post("/api/blogs", response_model=schemas.BlogPostResponse, status_code=status.HTTP_201_CREATED)
def create_blog(
    blog_in: schemas.BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    fecha_actual = blog_in.date or datetime.now().strftime("%d de %B, %Y")
    new_post = models.BlogPost(
        title=blog_in.title,
        excerpt=blog_in.excerpt,
        content=blog_in.content,
        author=blog_in.author or current_user.full_name,
        date=fecha_actual,
        is_active=True,
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


@app.put("/api/blogs/{blog_id}", response_model=schemas.BlogPostResponse)
def update_blog(
    blog_id: int,
    blog_in: schemas.BlogPostUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    post = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Artículo de blog no encontrado.")
    if blog_in.title is not None:
        post.title = blog_in.title
    if blog_in.excerpt is not None:
        post.excerpt = blog_in.excerpt
    if blog_in.content is not None:
        post.content = blog_in.content
    if blog_in.author is not None:
        post.author = blog_in.author
    if blog_in.date is not None:
        post.date = blog_in.date
    if blog_in.is_active is not None:
        post.is_active = blog_in.is_active

    db.commit()
    db.refresh(post)
    return post


@app.delete("/api/blogs/{blog_id}")
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    post = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Artículo de blog no encontrado.")
    post.is_active = False
    db.commit()
    return {"detail": "Artículo de blog desactivado con éxito."}


# ================= RUTAS: INFORMACIÓN INSTITUCIONAL (NOSOTROS) =================

@app.get("/api/clinic-info", response_model=schemas.ClinicInfoResponse)
def get_clinic_info(db: Session = Depends(get_db)):
    info = db.query(models.ClinicInfo).first()
    if not info:
        info = models.ClinicInfo(
            mision="Brindar servicios de salud oral de la más alta calidad, con un enfoque integral y personalizado, asegurando la comodidad y satisfacción de cada paciente.",
            vision="Ser la clínica odontológica de referencia por nuestra excelencia médica, innovación tecnológica y el compromiso genuino con el bienestar de nuestra comunidad.",
            valores="Ética profesional, empatía con nuestros pacientes, innovación constante, responsabilidad y un compromiso inquebrantable con la calidad del servicio.",
            telefono="+57 (601) 745-0000",
            direccion="Calle 127 # 19A - 44, Consultorio 502, Bogotá D.C.",
            email_contacto="contacto@dentalblanc.com",
        )
        db.add(info)
        db.commit()
        db.refresh(info)
    return info


@app.put("/api/clinic-info", response_model=schemas.ClinicInfoResponse)
def update_clinic_info(
    info_in: schemas.ClinicInfoUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    info = db.query(models.ClinicInfo).first()
    if not info:
        info = models.ClinicInfo(
            mision="Misión institucional",
            vision="Visión institucional",
            valores="Valores institucionales",
        )
        db.add(info)
    if info_in.mision is not None:
        info.mision = info_in.mision
    if info_in.vision is not None:
        info.vision = info_in.vision
    if info_in.valores is not None:
        info.valores = info_in.valores
    if info_in.telefono is not None:
        info.telefono = info_in.telefono
    if info_in.direccion is not None:
        info.direccion = info_in.direccion
    if info_in.email_contacto is not None:
        info.email_contacto = info_in.email_contacto

    db.commit()
    db.refresh(info)
    return info

