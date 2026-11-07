# =========================================================================
# ESQUEMAS DE VALIDACIÓN DE DATOS (schemas.py)
# =========================================================================
# Este archivo (usando la librería Pydantic) se asegura de que los datos recibidos 
# desde la página web (React) y los datos enviados desde la base de datos tengan
# el formato y tipo correctos. Si falta un dato o un correo está mal escrito, 
# la validación rechazará la petición para evitar errores.

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime, date as date_type, time as time_type

# Importamos los Enums parametrizados desde models
from models import UserRole, ServiceStatus

# ==================== 1. USUARIOS Y PACIENTES ====================
# Propiedades base que todos los usuarios (pacientes o administradores) deben tener.
class UserBase(BaseModel):
    email: EmailStr # EmailStr valida automáticamente que sí tenga formato de correo (@ y punto)
    full_name: str
    
    # Tipo date nativo de Python para validación y normalización estricta
    cedula: Optional[str] = None
    fecha_nacimiento: Optional[date_type] = None

    @field_validator("full_name", mode="before")
    @classmethod
    def validate_user_full_name(cls, v):
        if v is None:
            return v
        v_str = str(v).strip()
        if not v_str:
            raise ValueError("El nombre no puede estar vacío.")
        import re
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'.-]{2,80}$", v_str):
            raise ValueError("El nombre debe contener exclusivamente letras y espacios (sin números ni símbolos extraños).")
        return v_str

    @field_validator("cedula", mode="before")
    @classmethod
    def validate_user_cedula(cls, v):
        if v is None:
            return None
        v_str = str(v).strip()
        if not v_str:
            return None
        if not v_str.isdigit():
            raise ValueError("La cédula debe contener únicamente números.")
        if len(v_str) < 6 or len(v_str) > 15:
            raise ValueError("La cédula debe contener entre 6 y 15 dígitos numéricos.")
        return v_str

# Cuando un usuario envía el formulario de Registro, tiene que proveer una contraseña.
class UserCreate(UserBase):
    password: str 

# Cuando el servidor le responde a React con los datos de un usuario, 
# usamos esta clase que nunca incluye la contraseña (por seguridad) pero sí su ID y Rol.
class User(UserBase):
    id: int 
    role: UserRole # Enum parametrizado
    is_active: bool

    # Esta configuración permite a Pydantic leer los datos desde un objeto de SQLAlchemy (DB).
    model_config = {"from_attributes": True}


# ==================== 2. TOKENS JWT ====================
# Estructura del Token que se le devuelve al usuario cuando inicia sesión.
class Token(BaseModel):
    access_token: str # Cadena segura (El token de acceso)
    token_type: str   # Usualmente es 'bearer'
    user: User        # Datos del usuario autenticado

# Información opcional que extraemos desde dentro del token desencriptado.
class TokenData(BaseModel):
    email: Optional[str] = None


# ==================== 3. SERVICIOS MÉDICOS ====================
# Datos de un servicio: Limpieza, Blanqueamiento, Ortodoncia...
class ServiceBase(BaseModel):
    name: str 
    description: str 
    price: float # Tipo Float porque el precio puede poseer decimales

# Lo que envía el Administrador para crear un nuevo servicio
class ServiceCreate(ServiceBase):
    pass # Pass indica que no requiere campos extras (es igual a ServiceBase)

# Actualización de servicio por parte del Administrador
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

# Lo que le mostramos a los pacientes en el catálogo de servicios de la web
class Service(ServiceBase):
    id: int 
    is_active: bool

    model_config = {"from_attributes": True}


# ==================== 4. AGENDAMIENTO DE CITAS ====================
# Información base para agendar una cita.
class AppointmentBase(BaseModel):
    # Nota: No pedimos el ID del paciente aquí, porque ese dato lo obtenemos
    # de forma más segura a través de su Token JWT de sesión activa.
    service_id: int 
    date: date_type
    time: time_type# Formato de hora nativo (validará HH:MM o HH:MM:SS)

class AppointmentCreate(AppointmentBase):
    full_name: Optional[str] = None
    email: Optional[str] = None
    cedula: Optional[str] = None
    telefono: Optional[str] = None
    dentist_id: Optional[int] = None
    auto_assign: Optional[bool] = False

    @field_validator("full_name", mode="before")
    @classmethod
    def validate_appointment_full_name(cls, v):
        if v is None:
            return None
        v_str = str(v).strip()
        if not v_str:
            return None
        import re
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'.-]{2,80}$", v_str):
            raise ValueError("El nombre completo debe contener exclusivamente letras y espacios (sin números ni símbolos extraños).")
        return v_str

    @field_validator("cedula", mode="before")
    @classmethod
    def validate_appointment_cedula(cls, v):
        if v is None:
            return None
        v_str = str(v).strip()
        if not v_str:
            return None
        if not v_str.isdigit():
            raise ValueError("El número de cédula o teléfono debe contener exclusivamente dígitos numéricos.")
        if len(v_str) < 6 or len(v_str) > 15:
            raise ValueError("El número de cédula o teléfono debe contener entre 6 y 15 dígitos numéricos.")
        return v_str

# Actualización de estado de la cita por parte del administrador
class AppointmentStatusUpdate(BaseModel):
    status: str

# Respuesta enriquecida de citas para vistas de Paciente y Administrador
class AppointmentResponse(BaseModel):
    id: int
    client_id: int
    client_name: str
    client_email: str
    dentist_id: Optional[int] = None
    dentist_name: Optional[str] = None
    service_id: int
    service_name: str
    service_price: float
    date: Optional[str] = None
    time: Optional[str] = None
    status: str
    created_at: Optional[str] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    user: Optional[User] = None

    model_config = {"from_attributes": True}

# Solicitud para asignar odontólogo a una cita médica
class AssignDentistRequest(BaseModel):
    dentist_id: int

# Esquema para creación de odontólogo por parte del administrador
class DentistCreate(BaseModel):
    full_name: str
    email: EmailStr
    cedula: Optional[str] = None
    fecha_nacimiento: Optional[date_type] = None
    password: Optional[str] = None

# Esquema para listar y responder información de odontólogos
class DentistUser(BaseModel):
    id: int
    full_name: str
    email: str
    cedula: Optional[str] = None
    is_active: Optional[bool] = True

    model_config = {"from_attributes": True}

class DentistResponse(BaseModel):
    id: int
    full_name: str
    email: str
    cedula: Optional[str] = None
    fecha_nacimiento: Optional[date_type] = None
    is_active: bool
    role: str

    model_config = {"from_attributes": True}

# NOTE: Appointments functionality is now merged into Orders. Keep the
# appointment schemas for compatibility where the frontend still posts
# appointment payloads; they will be handled by Order endpoints.


# ==================== 5. ÓRDENES (ORDERS) ====================
# Información base de una orden
class OrderBase(BaseModel):
    service_id: int
    date: Optional[date_type] = None
    time: Optional[time_type] = None
    status: ServiceStatus = ServiceStatus.pending

class OrderCreate(OrderBase):
    pass

# La información completa de la orden en la base de datos
class Order(OrderBase):
    id: int
    client_id: int
    created_at: datetime
    
    # También incluimos relaciones para poder detallar la orden
    service: Service
    
    model_config = {"from_attributes": True}


# ==================== 6. BLOG INSTITUCIONAL ====================
class BlogPostBase(BaseModel):
    title: str
    excerpt: str
    content: str
    author: Optional[str] = "Equipo Dental Blanc"
    date: Optional[str] = None
    is_active: Optional[bool] = True

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    date: Optional[str] = None
    is_active: Optional[bool] = None

class BlogPostResponse(BlogPostBase):
    id: int
    model_config = {"from_attributes": True}


# ==================== 7. SOBRE NOSOTROS / CLÍNICA ====================
class ClinicInfoBase(BaseModel):
    mision: str
    vision: str
    valores: str
    telefono: Optional[str] = "+57 (601) 745-0000"
    direccion: Optional[str] = "Calle 127 # 19A - 44, Consultorio 502, Bogotá D.C."
    email_contacto: Optional[str] = "contacto@dentalblanc.com"

class ClinicInfoUpdate(BaseModel):
    mision: Optional[str] = None
    vision: Optional[str] = None
    valores: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    email_contacto: Optional[str] = None

class ClinicInfoResponse(ClinicInfoBase):
    id: int
    model_config = {"from_attributes": True}


