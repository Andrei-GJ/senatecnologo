# =========================================================================
# ESQUEMAS DE VALIDACIÓN DE DATOS (schemas.py)
# =========================================================================
# Este archivo (usando la librería Pydantic) se asegura de que los datos recibidos 
# desde la página web (React) y los datos enviados desde la base de datos tengan
# el formato y tipo correctos. Si falta un dato o un correo está mal escrito, 
# la validación rechazará la petición para evitar errores.

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date as date_type, time as time_type

# Importamos los Enums parametrizados desde models
from models import UserRole, ServiceStatus

# ==================== 1. TOKENS JWT ====================
# Estructura del Token que se le devuelve al usuario cuando inicia sesión.
class Token(BaseModel):
    access_token: str # Cadena segura (El token de acceso)
    token_type: str   # Usualmente es 'bearer'

# Información opcional que extraemos desde dentro del token desencriptado.
class TokenData(BaseModel):
    email: Optional[str] = None 


# ==================== 2. USUARIOS Y PACIENTES ====================
# Propiedades base que todos los usuarios (pacientes o administradores) deben tener.
class UserBase(BaseModel):
    email: EmailStr # EmailStr valida automáticamente que sí tenga formato de correo (@ y punto)
    full_name: str
    
    # Tipo date nativo de Python para validación y normalización estricta
    cedula: Optional[str] = None
    fecha_nacimiento: Optional[date_type] = None

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


# ==================== 3. SERVICIOS MÉDICOS ====================
# Datos de un servicio: Limpieza, Blanqueamiento, Ortodoncia...
class ServiceBase(BaseModel):
    name: str 
    description: str 
    price: float # Tipo Float porque el precio puede poseer decimales

# Lo que envía el Administrador para crear un nuevo servicio
class ServiceCreate(ServiceBase):
    pass # Pass indica que no requiere campos extras (es igual a ServiceBase)

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
    pass

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

