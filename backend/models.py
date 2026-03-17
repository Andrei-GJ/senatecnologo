# =========================================================================
# ARCHIVO DE MODELOS DE BASE DE DATOS (models.py)
# =========================================================================
# Este archivo define las tablas de la Base de Datos. Pydantic usa esto
# para saber qué columnas crear y de qué tipo de dato debe ser cada una 
# (Ej: Texto, Número, Fecha).

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

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
    fecha_nacimiento = Column(String, nullable=True) 
    
    # "role" define los permisos: "patient" (paciente), "admin" (administrador)
    role = Column(String, default="patient") 
    
    # Control para saber si la cuenta está activa o suspendida
    is_active = Column(Boolean, default=True)

    # Conexión con la tabla de Citas. Un paciente puede tener múltiples citas.
    appointments = relationship("Appointment", back_populates="patient")


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

    # Conexión con Citas. Varios pacientes pueden pedir este mismo servicio.
    appointments = relationship("Appointment", back_populates="service")


# ----------------- TABLA DE CITAS -----------------
# Gestiona el agendamiento y los horarios de atención.
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relaciones o llaves foráneas que apuntan al ID del usuario y del servicio
    patient_id = Column(Integer, ForeignKey("users.id")) 
    service_id = Column(Integer, ForeignKey("services.id")) 
    
    # Fechas y horas de la cita
    date = Column(String) # Formato YYYY-MM-DD
    time = Column(String) # Formato HH:MM
    
    # Estado (pending=pendiente, confirmed=confirmada, cancelled=cancelada)
    status = Column(String, default="pending") 
    
    # Hora en la cual el usuario registró la cita en el sistema web
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaciones (relationship) para navegar entre las tablas más fácilmente
    patient = relationship("User", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
