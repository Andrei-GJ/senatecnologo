# ==========================================
# ESQUEMAS DE VALIDACIÓN (schemas.py)
# ==========================================
# Este archivo no crea tablas. Este archivo es como un "Guardia de Seguridad"
# que lee la información que viene desde la página web (tu formulario en React)
# y revisa que llegue completa, en el formato correcto, o la rechaza por fea.

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ================= 1. TOKENS (Llaves de Sesión) =================
# Si mandas buenas credenciales, te respondemos con un token (llave) y decimos que tipo (Bearer)
class Token(BaseModel):
    access_token: str
    token_type: str

# Cuando desencriptamos la llave, esto es lo único que nos interesa sacar (el email del paciente)
class TokenData(BaseModel):
    email: Optional[str] = None


# ================= 2. USUARIOS (Pacientes / Admin) =================
# 2.1 Datos básicos que siempre, siempre se necesitan:
class UserBase(BaseModel):
    # EmailStr asegurará que el texto de verdad sea un correo con "@" y ".com"
    email: EmailStr
    full_name: str
    # Agregamos los permisos opcionales si vienen del formulario FrontEnd
    cedula: Optional[str] = None
    fecha_nacimiento: Optional[str] = None

# 2.2 Cuando se REGISTRAN, nos mandan TODO lo anterior (UserBase) + Una Contraseña!
class UserCreate(UserBase):
    password: str # La contraseña solo llega en el Body del POST, pero NUNCA se manda de vuelta.

# 2.3 Cuando sacamos un Usuario de la Base de datos y lo mostramos como JSON, jamás mostramos la contraseña.
# Solo le enviamos lo básico (UserBase) más su ID, rol y si está activo.
class User(UserBase):
    id: int
    role: str
    is_active: bool

    # Configuración mágica para que Pydantic lea desde SQLAlchemy como si fuera un diccionario normal Python
    model_config = {"from_attributes": True}


# ================= 3. SERVICIOS MÉDICOS =================
# Datos base para los servicios (nombre, descripcion, precio)
class ServiceBase(BaseModel):
    name: str # Ej: Extracción
    description: str # Ej: 1 molar
    price: float # Ej: 15.000

# Lo que envía el Admin al botón "Crear nuevo servicio"
class ServiceCreate(ServiceBase):
    pass # Significa que solo pide Base

# Lo que enviamos desde el servidor a la lista azul de "Nuestros Servicios" de la página web.
class Service(ServiceBase):
    id: int # Le pasamos también el ID interno porque lo necesitamos para el formulario.
    is_active: bool

    model_config = {"from_attributes": True}


# ================= 4. CITAS ODONTOLÓGICAS =================
# Datos base de la cita.
class AppointmentBase(BaseModel):
    # Nota: No necesitamos pedirle al Frontend el id del paciente: ya sabemos 
    # quién es gracias al JWT/Token encripatdo que mandó con la petición.
    service_id: int 
    date: str # '2023-11-23'
    time: str # '08:00'

# Lo que el Frontend de React manda cuando oprime "Confirmar Cita"
class AppointmentCreate(AppointmentBase):
    pass

# Lo que ve el doctor o el paciente en el historial de citas agendadas de la base de datos
class Appointment(AppointmentBase):
    id: int
    patient_id: int # Acá si le avisamos de QUIÉN ES
    status: str # "confirmado, etc"
    
    model_config = {"from_attributes": True}
