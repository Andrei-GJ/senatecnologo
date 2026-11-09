# =========================================================================
# CONEXIÓN A BASE DE DATOS - neon (PostgreSQL)
# =========================================================================
# Este archivo configura la conexión a la Base de Datos alojada en neon.
# La URL de conexión se lee desde el archivo .env para mayor seguridad.

import os
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Carga las variables definidas en el archivo .env (sobrescribiendo variables del sistema si existen)
load_dotenv(find_dotenv(), override=True)

# Lee la URL de la base de datos desde la variable de entorno
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Validación: Si no existe la variable, avisamos con un error claro
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(
        "⚠️ ERROR: No se encontró la variable DATABASE_URL en el archivo .env.\n"
        "Por favor, agrega tu connection string de neon al archivo .env"
    )

# Normalizar esquema de conexión:
# 1. Quitar posibles espacios o comillas accidentales inyectadas en variables de entorno.
SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.strip("\"' ")

# 2. Compatibilidad con sintaxis legacy 'postgres://' que falla en SQLAlchemy >= 1.4.
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Creación del motor de conexión PostgreSQL (neon)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,
    pool_recycle=60,         # Reciclar cada minuto para evitar conexiones muertas
    connect_args={
        "sslmode": "require",
        "connect_timeout": 5
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Generador que abre y cierra la sesión de BD por cada petición HTTP."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
