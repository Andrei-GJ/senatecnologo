# ==========================================
# MODELOS DE BASE DE DATOS (models.py)
# ==========================================
# Este archivo le enseña a la Base de Datos (SQLite) qué tablas debe crear 
# y qué columnas va a tener cada tabla (Ej: Nombre, correo, precio, etc).
# Piénsalo como si estuvieras diseñando un documento de Excel en código.

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

# 1. TABLA DE USUARIOS (Pacientes, Doctores o Administradores)
class User(Base):
    __tablename__ = "users" # El nombre de la pestaña en 'Excel'

    # Cada paciente debe tener un ID único (1, 2, 3...) como llave primaria
    id = Column(Integer, primary_key=True, index=True)
    
    # El correo se usará para iniciar sesión. unique=True asegura que no existan 2 cuentas con un mismo correo
    email = Column(String, unique=True, index=True)
    
    # Aquí NUNCA guardaremos la contraseña real (ej: "12345"). 
    # Guardaremos una "sopa de letras" encriptada por seguridad (hasheo).
    hashed_password = Column(String)
    
    # Datos personales
    full_name = Column(String)
    
    # Nuevos datos pedidos en el TO-DO del SENA:
    cedula = Column(String, unique=True, index=True, nullable=True) # Cédula de ciudadanía
    fecha_nacimiento = Column(String, nullable=True) # Ej: 1995-10-25
    
    # El rol dice si esta persona es un "patient" (paciente normal) o "admin" (secretaria/jefe)
    role = Column(String, default="patient") 
    
    # ¿El usuario todavía viene a la clínica o su cuenta fue borrada/suspendida?
    is_active = Column(Boolean, default=True)

    # Una "relación" significa que la tabla de Usuarios está conectada con la tabla de Citas.
    # Un paciente puede tener MUCHAS citas guardadas.
    appointments = relationship("Appointment", back_populates="patient")


# 2. TABLA DE SERVICIOS (El portafolio de la clínica)
class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # Ej: "Limpieza profunda"
    description = Column(String) # Ej: "Limpieza con flúor..."
    price = Column(Float) # Ej: 150000.0 (Float permite decimales)
    
    # ¿El servicio se sigue ofreciendo hoy en día?
    is_active = Column(Boolean, default=True)

    # Un servicio (Ej: Limpieza) puede estar en MUCHAS citas agendadas por diferentes personas.
    appointments = relationship("Appointment", back_populates="service")


# 3. TABLA DE CITAS (El cruce entre paciente y un servicio a cierta hora)
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    
    # Llaves Foráneas (ForeignKey): Estos números mágicos apuntan a los IDs de otras tablas
    patient_id = Column(Integer, ForeignKey("users.id")) # Apunta al paciente #5 por ejemplo
    service_id = Column(Integer, ForeignKey("services.id")) # Apunta al servicio #2 por ejemplo
    
    # Cuándo será la cita
    date = Column(String) # Para hacerlo simple guardamos texto: "AAAA-MM-DD"
    time = Column(String) # Guardamos texto: "14:30"
    
    # Estado de la cita (pending=pendiente, confirmed=confirmada, cancelled=cancelada)
    status = Column(String, default="pending") 
    
    # Cuándo el usuario oprimió el botón de agendar en la web (hora real en que se creó el registro)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Conexiones mágicas para que Python pueda traer todos los datos enteros cruzados
    patient = relationship("User", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
