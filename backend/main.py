from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="API Clínica Odontológica", version="1.0")

# Configurar CORS para permitir que el frontend consuma la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción deberías especificar el dominio exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de datos
class Service(BaseModel):
    id: int
    name: str
    description: str
    price: float

class Appointment(BaseModel):
    patient_name: str
    service_id: int
    date: str
    time: str

# Base de datos simulada
services_db = [
    Service(id=1, name="Limpieza Dental", description="Limpieza profunda con ultrasonido", price=120000.0),
    Service(id=2, name="Blanqueamiento", description="Sesión de blanqueamiento dental led", price=350000.0),
    Service(id=3, name="Extracción", description="Extracción de pieza dental simple", price=80000.0),
    Service(id=4, name="Ortodoncia (Valoración)", description="Consulta inicial para brackets", price=50000.0),
]

appointments_db = []

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de la Clínica Odontológica"}

@app.get("/api/services", response_model=List[Service])
def get_services():
    return services_db

@app.post("/api/appointments")
def create_appointment(appointment: Appointment):
    # Verificamos si el servicio existe
    service_exists = any(s.id == appointment.service_id for s in services_db)
    if not service_exists
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    # En un entorno real, guardaríamos esto en la base de datos con un ID autoincremental
    appointment_data = appointment.dict()
    appointment_data["id"] = len(appointments_db) + 1
    appointments_db.append(appointment_data)
    
    return {"message": "Cita agendada exitosamente", "appointment": appointment_data}

@app.get("/api/appointments")
def get_appointments():
    return appointments_db
