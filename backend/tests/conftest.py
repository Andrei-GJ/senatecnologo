import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
import os

# Añadir el directorio backend al sys.path para importar correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from database import Base, get_db
import models

# Base de datos SQLite en memoria para aislamiento absoluto de pruebas
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Crea la estructura de tablas y catálogos requeridos antes de cada prueba."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Sembrar catálogos de roles y estados
    roles = ["patient", "admin", "dentist"]
    for role_name in roles:
        if not db.query(models.Role).filter_by(name=role_name).first():
            db.add(models.Role(name=role_name))

    statuses = ["pending", "completed", "cancelled"]
    for status_name in statuses:
        if not db.query(models.ServiceStatusModel).filter_by(name=status_name).first():
            db.add(models.ServiceStatusModel(name=status_name))

    # Sembrar servicio inicial de prueba
    service = models.Service(
        name="Limpieza Dental Profiláctica",
        description="Eliminación de sarro y pulido dental.",
        price=120000.0,
        is_active=True
    )
    db.add(service)

    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
