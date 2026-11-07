# =========================================================================
# ARCHIVO DE MODELOS DE BASE DE DATOS (models.py)
# =========================================================================
# Este archivo define las tablas de la Base de Datos. Pydantic usa esto
# para saber qué columnas crear y de qué tipo de dato debe ser cada una 
# (Ej: Texto, Número, Fecha).

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime, Date, Time, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

# ----------------- ENUMS PARA ROLES Y ESTADOS -----------------
class UserRole(str, enum.Enum):
    patient = "patient"
    admin = "admin"
    dentist = "dentist"

class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"

class ServiceStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


# ----------------- TABLAS DE CATÁLOGO (MAESTRAS) -----------------
class Role(Base):
    __tablename__ = "roles"
    name = Column(String, primary_key=True)

class AppointmentStatusModel(Base):
    __tablename__ = "appointment_statuses"
    name = Column(String, primary_key=True)

class ServiceStatusModel(Base):
    __tablename__ = "service_statuses"
    name = Column(String, primary_key=True)


# ----------------- TABLA DE USUARIOS -----------------
class User(Base):
    __tablename__ = "users" # Nombre de la tabla principal

    # ID único para cada usuario
    id = Column(Integer, primary_key=True, index=True)
    
    # Correo único para el inicio de sesión
    email = Column(String, unique=True, index=True)
    
    # Aquí se guardará la contraseña de forma encriptada
    hashed_password = Column(String)
    
    # Información personal del paciente o personal de la clínica
    full_name = Column(String)
    
    # Documentos y fechas de registro obligatorias según requerimientos
    cedula = Column(String, unique=True, index=True, nullable=True) 
    fecha_nacimiento = Column(Date, nullable=True) # Tipo Date normalizado
    
    # "role" define los permisos y apunta a la tabla de catálogo 'roles'
    role = Column(String, ForeignKey("roles.name"), default="patient") 
    
    # Control para saber si la cuenta está activa o suspendida
    is_active = Column(Boolean, default=True)

    # Conexión con la tabla de Órdenes. Un paciente puede tener múltiples órdenes.
    orders = relationship("Order", back_populates="client", foreign_keys="Order.client_id")


# ----------------- TABLA DE SERVICIOS -----------------
# Guarda los tratamientos u operaciones que realiza la clínica.
class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) 
    description = Column(String) 
    price = Column(Float) # Float permite guardar precios con decimales
    
    # Control para ver si el servicio aún se sigue ofreciendo
    is_active = Column(Boolean, default=True)

    # Conexión con Órdenes. Un servicio puede tener múltiples órdenes.
    orders = relationship("Order", back_populates="service")


# NOTE:
# The previous `Appointment` table has been removed. Appointment-related
# fields (date/time/created_at) are now stored on `orders` so a single
# `orders` table holds scheduling + service state information.


# ----------------- TABLA DE ÓRDENES -----------------
# Registra las órdenes que enlazan clientes con servicios
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    
    # Enlaza al cliente (usuario) y al servicio
    client_id = Column(Integer, ForeignKey("users.id"))
    dentist_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("services.id"))

    # Fecha y hora de la prestación/turno (antes en appointments)
    date = Column(Date, nullable=True)
    time = Column(Time, nullable=True)

    # Estado que apunta a la tabla de catálogo 'service_statuses'
    status = Column(String, ForeignKey("service_statuses.name"), default="pending")

    # Fecha de creación de la orden
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relaciones para navegar fácilmente entre tablas
    client = relationship("User", back_populates="orders", foreign_keys=[client_id])
    service = relationship("Service", back_populates="orders")
    dentist = relationship("User", foreign_keys=[dentist_id])


# ----------------- TABLA DE ARTÍCULOS DE BLOG -----------------
class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    excerpt = Column(String)
    content = Column(String)
    author = Column(String, default="Equipo Dental Blanc")
    date = Column(String)
    is_active = Column(Boolean, default=True)


# ----------------- TABLA DE INFORMACIÓN INSTITUCIONAL (NOSOTROS) -----------------
class ClinicInfo(Base):
    __tablename__ = "clinic_info"

    id = Column(Integer, primary_key=True)
    mision = Column(String)
    vision = Column(String)
    valores = Column(String)
    telefono = Column(String, default="+57 (601) 745-0000")
    direccion = Column(String, default="Calle 127 # 19A - 44, Consultorio 502, Bogotá D.C.")
    email_contacto = Column(String, default="contacto@dentalblanc.com")

