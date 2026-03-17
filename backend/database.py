# =========================================================================
# CONEXIÓN A BASE DE DATOS - SUPABASE (PostgreSQL)
# =========================================================================
# Este archivo configura la conexión a la Base de Datos alojada en Supabase.
# La URL de conexión se lee desde el archivo .env para mayor seguridad.

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Carga las variables definidas en el archivo .env
load_dotenv()

# Lee la URL de la base de datos desde la variable de entorno
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Validación: Si no existe la variable, avisamos con un error claro
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(
        "⚠️ ERROR: No se encontró la variable DATABASE_URL en el archivo .env.\n"
        "Por favor, agrega tu connection string de Supabase al archivo .env"
    )

# Creación del motor de conexión PostgreSQL (Supabase)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,
    pool_recycle=300,        # Reciclar conexiones más rápido (cada 5 min)
    pool_timeout=30,         # Esperar hasta 30 segundos
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10
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
