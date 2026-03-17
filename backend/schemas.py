# =========================================================================
# ESQUEMAS DE VALIDACIÓN DE DATOS (schemas.py)
# =========================================================================
# Este archivo (usando la librería Pydantic) se asegura de que los datos recibidos 
# desde la página web (React) y los datos enviados desde la base de datos tengan
# el formato y tipo correctos. Si falta un dato o un correo está mal escrito, 
# la validación rechazará la petición para evitar errores.

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

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
    
    # Optional significa que estos datos pueden ser nulos si no fueron suministrados.
    cedula: Optional[str] = None
    fecha_nacimiento: Optional[str] = None

# Cuando un usuario envía el formulario de Registro, tiene que proveer una contraseña.
class UserCreate(UserBase):
    password: str 

# Cuando el servidor le responde a React con los datos de un usuario, 
# usamos esta clase que nunca incluye la contraseña (por seguridad) pero sí su ID y Rol.
class User(UserBase):
    id: int 
    role: str 
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
    date: str # Formato de fecha esperado: "2023-11-20"
    time: str # Formato de hora esperado: "15:00"

class AppointmentCreate(AppointmentBase):
    pass

# La información completa de una cita ya consolidada en la base de datos
class Appointment(AppointmentBase):
    id: int
    patient_id: int # El dueño real de la cita
    status: str # "pending", "confirmed", etc.
    
    model_config = {"from_attributes": True}
