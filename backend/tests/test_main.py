"""
PRUEBAS UNITARIAS E INTEGRATIVAS - DENTAL BLANC
EVIDENCIA SENA: GA9-220501096-AA3-EV01
"""

import pytest
from datetime import date


def test_01_health_and_services_catalog(client):
    """CP-001: Obtención exitosa del catálogo de servicios odontológicos activos."""
    response = client.get("/api/services")
    assert response.status_code == 200
    services = response.json()
    assert isinstance(services, list)
    assert len(services) >= 1
    assert services[0]["name"] == "Limpieza Dental Profiláctica"
    assert services[0]["price"] == 120000.0


def test_02_register_patient_success(client):
    """CP-002: Registro exitoso de un nuevo paciente con validación de cédula y fecha de nacimiento."""
    payload = {
        "email": "paciente.prueba@dentalblanc.com",
        "password": "PasswordSeguro123!",
        "full_name": "Carlos Andrés Mendoza",
        "cedula": "1098765432",
        "fecha_nacimiento": "1995-05-20"
    }
    response = client.post("/api/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["full_name"] == payload["full_name"]
    assert data["cedula"] == payload["cedula"]
    assert data["role"] == "patient"
    assert "id" in data
    assert "password" not in data  # La contraseña nunca debe ser retornada


def test_03_register_duplicate_email_error(client):
    """CP-003: Rechazo de registro duplicado de correo electrónico (HTTP 400)."""
    payload = {
        "email": "duplicado@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Ana María López",
        "cedula": "1011223344",
        "fecha_nacimiento": "1990-10-10"
    }
    # Primer registro exitoso
    res1 = client.post("/api/register", json=payload)
    assert res1.status_code == 200

    # Segundo registro con el mismo correo debe ser rechazado
    res2 = client.post("/api/register", json=payload)
    assert res2.status_code == 400
    assert "ya se encuentra registrado" in res2.json()["detail"]


def test_04_login_success(client):
    """CP-004: Autenticación exitosa y generación de Token JWT (Bearer)."""
    # 1. Registrar usuario
    client.post("/api/register", json={
        "email": "login.test@dentalblanc.com",
        "password": "SecretPassword123",
        "full_name": "Laura Sofía Torres",
        "cedula": "1055443322",
        "fecha_nacimiento": "1998-03-15"
    })

    # 2. Intentar login
    response = client.post(
        "/api/login",
        data={
            "username": "login.test@dentalblanc.com",
            "password": "SecretPassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_05_login_invalid_password(client):
    """CP-005: Rechazo de autenticación con credenciales erróneas (HTTP 401)."""
    client.post("/api/register", json={
        "email": "usuario.erroneo@dentalblanc.com",
        "password": "PasswordCorrecto123",
        "full_name": "Usuario Test",
        "cedula": "12345678",
        "fecha_nacimiento": "2000-01-01"
    })

    response = client.post(
        "/api/login",
        data={
            "username": "usuario.erroneo@dentalblanc.com",
            "password": "PasswordINCORRECTO"
        }
    )
    assert response.status_code == 401
    assert "Error: Correo electrónico o contraseña incorrectos" in response.json()["detail"]


def test_06_unauthorized_appointment_creation(client):
    """CP-006: Control de Seguridad - Rechazo de creación de cita sin Token JWT (HTTP 401)."""
    appointment_payload = {
        "service_id": 1,
        "date": "2026-10-15",
        "time": "10:30:00"
    }
    response = client.post("/api/appointments", json=appointment_payload)
    assert response.status_code == 401


def test_07_authorized_appointment_creation_success(client):
    """CP-007: Creación exitosa de cita médica odontológica con usuario autenticado."""
    # 1. Registrar y loguear usuario
    user_data = {
        "email": "paciente.cita@dentalblanc.com",
        "password": "PasswordCita123",
        "full_name": "Mateo Gómez",
        "cedula": "1122334455",
        "fecha_nacimiento": "1992-07-25"
    }
    client.post("/api/register", json=user_data)

    login_res = client.post(
        "/api/login",
        data={"username": user_data["email"], "password": user_data["password"]}
    )
    token = login_res.json()["access_token"]

    # 2. Agendar cita pasando token Bearer en Header
    headers = {"Authorization": f"Bearer {token}"}
    appointment_payload = {
        "service_id": 1,
        "date": "2026-10-20",
        "time": "14:00:00"
    }

    response = client.post("/api/appointments", json=appointment_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["service_id"] == 1
    assert data["date"] == "2026-10-20"
    assert data["time"] == "14:00:00"
    assert data["status"] == "pending"


def test_08_appointment_invalid_service_id(client):
    """CP-008: Manejo de Excepciones - Intento de agendar cita para un servicio inexistente (HTTP 404)."""
    client.post("/api/register", json={
        "email": "servicio.invalido@dentalblanc.com",
        "password": "Password123",
        "full_name": "Prueba Inexistente",
        "cedula": "99887766",
        "fecha_nacimiento": "1994-04-04"
    })

    login_res = client.post(
        "/api/login",
        data={"username": "servicio.invalido@dentalblanc.com", "password": "Password123"}
    )
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    appointment_payload = {
        "service_id": 99999,  # Servicio no existe
        "date": "2026-10-20",
        "time": "14:00:00"
    }

    response = client.post("/api/appointments", json=appointment_payload, headers=headers)
    assert response.status_code == 404
    assert "El servicio odontológico solicitado figura como no disponible" in response.json()["detail"]


def test_09_get_patient_appointments_isolation(client):
    """CP-009: Aislamiento de datos de paciente - Un usuario solo puede ver sus propias citas."""
    # Crear Paciente A
    client.post("/api/register", json={
        "email": "paciente.a@dentalblanc.com",
        "password": "PasswordA123",
        "full_name": "Paciente A",
        "cedula": "111111",
        "fecha_nacimiento": "2000-01-01"
    })
    token_a = client.post("/api/login", data={"username": "paciente.a@dentalblanc.com", "password": "PasswordA123"}).json()["access_token"]

    # Crear Paciente B
    client.post("/api/register", json={
        "email": "paciente.b@dentalblanc.com",
        "password": "PasswordB123",
        "full_name": "Paciente B",
        "cedula": "222222",
        "fecha_nacimiento": "2000-01-02"
    })
    token_b = client.post("/api/login", data={"username": "paciente.b@dentalblanc.com", "password": "PasswordB123"}).json()["access_token"]

    # Paciente A crea cita
    client.post("/api/appointments", json={"service_id": 1, "date": "2026-11-01", "time": "09:00:00"}, headers={"Authorization": f"Bearer {token_a}"})

    # Paciente B consulta citas: no debe ver la cita de A
    res_b = client.get("/api/appointments", headers={"Authorization": f"Bearer {token_b}"})
    assert res_b.status_code == 200
    assert len(res_b.json()) == 0

    # Paciente A consulta citas: debe ver 1 cita
    res_a = client.get("/api/appointments", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a.status_code == 200
    assert len(res_a.json()) == 1
