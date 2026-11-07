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
        "date": "2026-11-20",
        "time": "14:00:00"
    }

    response = client.post("/api/appointments", json=appointment_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["service_id"] == 1
    assert data["date"] == "2026-11-20"
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
    client.post("/api/appointments", json={"service_id": 1, "date": "2026-11-21", "time": "09:00:00"}, headers={"Authorization": f"Bearer {token_a}"})

    # Paciente B consulta citas: no debe ver la cita de A
    res_b = client.get("/api/appointments", headers={"Authorization": f"Bearer {token_b}"})
    assert res_b.status_code == 200
    assert len(res_b.json()) == 0

    # Paciente A consulta citas: debe ver 1 cita
    res_a = client.get("/api/appointments", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a.status_code == 200
    assert len(res_a.json()) == 1


def test_10_login_returns_user_data(client):
    """CP-010: El login devuelve access_token, token_type y el objeto user con sus atributos."""
    client.post("/api/register", json={
        "email": "identidad@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Mario Mendoza",
        "cedula": "77889900",
        "fecha_nacimiento": "1988-12-05"
    })

    response = client.post(
        "/api/login",
        data={"username": "identidad@dentalblanc.com", "password": "Password123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    user = data["user"]
    assert user["email"] == "identidad@dentalblanc.com"
    assert user["full_name"] == "Mario Mendoza"
    assert user["cedula"] == "77889900"
    assert user["role"] == "patient"
    assert user["is_active"] is True
    assert "password" not in user
    assert "hashed_password" not in user


def test_11_get_me_endpoint_security(client):
    """CP-011: Endpoint /api/me y /api/users/me protegido con JWT que retorna el usuario autenticado."""
    # 1. Petición sin token debe responder 401
    unauth_res = client.get("/api/me")
    assert unauth_res.status_code == 401

    # 2. Registrar y autenticar usuario
    client.post("/api/register", json={
        "email": "perfil.test@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Valeria Morales",
        "cedula": "44556677",
        "fecha_nacimiento": "1993-08-14"
    })
    token = client.post(
        "/api/login",
        data={"username": "perfil.test@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. GET /api/me exitoso
    me_res = client.get("/api/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "perfil.test@dentalblanc.com"
    assert me_data["full_name"] == "Valeria Morales"
    assert me_data["role"] == "patient"

    # 4. GET /api/users/me alias también exitoso
    users_me_res = client.get("/api/users/me", headers=headers)
    assert users_me_res.status_code == 200
    assert users_me_res.json()["email"] == "perfil.test@dentalblanc.com"


def test_12_get_appointments_enriched_data(client):
    """CP-012: Enriquecimiento de citas con client_name, client_email, service_name y service_price."""
    client.post("/api/register", json={
        "email": "enriquecido@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Juliana Herrera",
        "cedula": "33445566",
        "fecha_nacimiento": "1991-03-22"
    })
    token = client.post(
        "/api/login",
        data={"username": "enriquecido@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Crear cita
    create_res = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-11-15", "time": "15:00:00"},
        headers=headers
    )
    assert create_res.status_code == 200

    # Consultar citas
    res = client.get("/api/appointments", headers=headers)
    assert res.status_code == 200
    citas = res.json()
    assert len(citas) >= 1
    cita = citas[0]
    # Validar campos enriquecidos requeridos
    assert "id" in cita
    assert cita["client_id"] > 0
    assert cita["client_name"] == "Juliana Herrera"
    assert cita["client_email"] == "enriquecido@dentalblanc.com"
    assert cita["service_id"] == 1
    assert cita["service_name"] == "Limpieza Dental Profiláctica"
    assert cita["service_price"] == 120000.0
    assert cita["date"] == "2026-11-15"
    assert cita["time"] == "15:00:00"
    assert cita["status"] == "pending"
    assert "created_at" in cita


def test_13_patient_cancels_own_appointment(client):
    """CP-013: Un paciente puede cancelar su propia cita vía PATCH /api/appointments/{id}/cancel."""
    client.post("/api/register", json={
        "email": "cancela.propia@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Esteban Restrepo",
        "cedula": "88990011",
        "fecha_nacimiento": "1987-11-10"
    })
    token = client.post(
        "/api/login",
        data={"username": "cancela.propia@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    cita_id = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-12-01", "time": "11:00:00"},
        headers=headers
    ).json()["id"]

    # Cancelar la cita
    cancel_res = client.patch(f"/api/appointments/{cita_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # Verificar persistencia en base de datos
    check_res = client.get("/api/appointments", headers=headers)
    assert check_res.json()[0]["status"] == "cancelled"


def test_14_patient_cannot_cancel_others_appointment(client):
    """CP-014: Un paciente no puede cancelar citas de otro paciente (HTTP 403 Forbidden)."""
    # Paciente Víctima
    client.post("/api/register", json={
        "email": "victima@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Víctima Test",
        "cedula": "11221122",
        "fecha_nacimiento": "1990-01-01"
    })
    token_victima = client.post(
        "/api/login",
        data={"username": "victima@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    cita_id = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-12-05", "time": "09:00:00"},
        headers={"Authorization": f"Bearer {token_victima}"}
    ).json()["id"]

    # Paciente Intruso
    client.post("/api/register", json={
        "email": "intruso@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Intruso Test",
        "cedula": "99889988",
        "fecha_nacimiento": "1992-02-02"
    })
    token_intruso = client.post(
        "/api/login",
        data={"username": "intruso@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]

    # Intruso intenta cancelar cita de Víctima
    res = client.patch(
        f"/api/appointments/{cita_id}/cancel",
        headers={"Authorization": f"Bearer {token_intruso}"}
    )
    assert res.status_code == 403
    assert "No tienes permisos" in res.json()["detail"]


def test_15_cancel_nonexistent_appointment_404(client):
    """CP-015: Intento de cancelar una cita inexistente retorna HTTP 404 Not Found."""
    client.post("/api/register", json={
        "email": "paciente.404@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Test CuatrocientosCuatro",
        "cedula": "40440440",
        "fecha_nacimiento": "1999-09-09"
    })
    token = client.post(
        "/api/login",
        data={"username": "paciente.404@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]

    res = client.patch(
        "/api/appointments/99999/cancel",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 404
    assert "Cita no encontrada" in res.json()["detail"]


def test_16_admin_update_appointment_status(client):
    """CP-016: Administrador puede cambiar el estado a confirmed, completed y cancelled."""
    from conftest import TestingSessionLocal
    import models
    import auth

    # 1. Crear usuario Admin directamente en la BD
    db = TestingSessionLocal()
    admin_user = models.User(
        email="admin.clinica@dentalblanc.com",
        full_name="Dra. Diana Trujillo",
        cedula="52334455",
        fecha_nacimiento=date(1980, 5, 10),
        hashed_password=auth.get_password_hash("AdminSecret2026!"),
        role="admin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.close()

    admin_token = client.post(
        "/api/login",
        data={"username": "admin.clinica@dentalblanc.com", "password": "AdminSecret2026!"}
    ).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Crear paciente y su cita
    client.post("/api/register", json={
        "email": "paciente.estado@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Camilo Sánchez",
        "cedula": "77112233",
        "fecha_nacimiento": "1996-04-18"
    })
    patient_token = client.post(
        "/api/login",
        data={"username": "paciente.estado@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]

    cita_id = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-11-20", "time": "16:00:00"},
        headers={"Authorization": f"Bearer {patient_token}"}
    ).json()["id"]

    # 3. Admin confirma la cita
    res_confirmed = client.patch(
        f"/api/appointments/{cita_id}/status",
        json={"status": "confirmed"},
        headers=admin_headers
    )
    assert res_confirmed.status_code == 200
    assert res_confirmed.json()["status"] == "confirmed"

    # 4. Admin completa la cita
    res_completed = client.patch(
        f"/api/appointments/{cita_id}/status",
        json={"status": "completed"},
        headers=admin_headers
    )
    assert res_completed.status_code == 200
    assert res_completed.json()["status"] == "completed"

    # 5. Admin puede cancelar cualquier cita vía /cancel
    res_cancel = client.patch(
        f"/api/appointments/{cita_id}/cancel",
        headers=admin_headers
    )
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "cancelled"


def test_17_patient_cannot_change_status(client):
    """CP-017: Un paciente no puede cambiar el estado de una cita directamente (HTTP 403 Forbidden)."""
    client.post("/api/register", json={
        "email": "paciente.noadmin@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Paciente NoAdmin",
        "cedula": "99118822",
        "fecha_nacimiento": "2001-01-01"
    })
    token = client.post(
        "/api/login",
        data={"username": "paciente.noadmin@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    cita_id = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-11-25", "time": "08:00:00"},
        headers=headers
    ).json()["id"]

    res = client.patch(
        f"/api/appointments/{cita_id}/status",
        json={"status": "confirmed"},
        headers=headers
    )
    assert res.status_code == 403
    assert "Se requieren permisos de administrador" in res.json()["detail"]


def test_18_admin_invalid_status_rejected(client):
    """CP-018: El intento de enviar un estado inválido retorna HTTP 400 Bad Request."""
    from conftest import TestingSessionLocal
    import models
    import auth

    db = TestingSessionLocal()
    admin_user = models.User(
        email="admin.validador@dentalblanc.com",
        full_name="Admin Validador",
        cedula="12399988",
        fecha_nacimiento=date(1982, 1, 1),
        hashed_password=auth.get_password_hash("AdminPass123!"),
        role="admin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.close()

    admin_token = client.post(
        "/api/login",
        data={"username": "admin.validador@dentalblanc.com", "password": "AdminPass123!"}
    ).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Crear cita previa con paciente
    client.post("/api/register", json={
        "email": "paciente.invalido@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Paciente Validador",
        "cedula": "99009900",
        "fecha_nacimiento": "1997-07-07"
    })
    patient_token = client.post(
        "/api/login",
        data={"username": "paciente.invalido@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    cita_id = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-11-28", "time": "10:00:00"},
        headers={"Authorization": f"Bearer {patient_token}"}
    ).json()["id"]

    res = client.patch(
        f"/api/appointments/{cita_id}/status",
        json={"status": "en_progreso_no_valido"},
        headers=admin_headers
    )
    assert res.status_code == 400
    assert "Estado inválido" in res.json()["detail"]


def test_19_get_dentists_list(client):
    """CP-019: Listado exitoso de odontólogos activos (GET /api/dentists)."""
    from conftest import TestingSessionLocal
    import models
    import auth

    db = TestingSessionLocal()
    dentist_1 = models.User(
        email="dr.alvarez@dentalblanc.com",
        full_name="Dr. Juan Álvarez",
        cedula="80123456",
        fecha_nacimiento=date(1985, 3, 15),
        hashed_password=auth.get_password_hash("PassDentist1!"),
        role="dentist",
        is_active=True,
    )
    dentist_2 = models.User(
        email="dra.morales@dentalblanc.com",
        full_name="Dra. Diana Morales",
        cedula="52987654",
        fecha_nacimiento=date(1989, 7, 22),
        hashed_password=auth.get_password_hash("PassDentist2!"),
        role="dentist",
        is_active=True,
    )
    inactive_dentist = models.User(
        email="dr.inactivo@dentalblanc.com",
        full_name="Dr. Odontólogo Inactivo",
        cedula="51000111",
        fecha_nacimiento=date(1980, 1, 1),
        hashed_password=auth.get_password_hash("PassDentist3!"),
        role="dentist",
        is_active=False,
    )
    db.add_all([dentist_1, dentist_2, inactive_dentist])
    db.commit()
    db.close()

    res = client.get("/api/dentists")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    emails = [d["email"] for d in data]
    assert "dr.alvarez@dentalblanc.com" in emails
    assert "dra.morales@dentalblanc.com" in emails
    assert "dr.inactivo@dentalblanc.com" not in emails
    for d in data:
        assert "id" in d
        assert "full_name" in d
        assert "email" in d
        assert "password" not in d
        assert "hashed_password" not in d


def test_20_assign_dentist_by_admin_success(client):
    """CP-020: Asignación exitosa de odontólogo a cita médica por admin (PATCH /api/appointments/{id}/assign-dentist)."""
    from conftest import TestingSessionLocal
    import models
    import auth

    db = TestingSessionLocal()
    admin_user = models.User(
        email="admin.agenda@dentalblanc.com",
        full_name="Admin Agenda",
        cedula="100200300",
        fecha_nacimiento=date(1980, 5, 10),
        hashed_password=auth.get_password_hash("Admin12345!"),
        role="admin",
        is_active=True,
    )
    dentist_user = models.User(
        email="dr.ramirez@dentalblanc.com",
        full_name="Dr. Sergio Ramírez",
        cedula="79888999",
        fecha_nacimiento=date(1986, 9, 14),
        hashed_password=auth.get_password_hash("Dentist123!"),
        role="dentist",
        is_active=True,
    )
    db.add_all([admin_user, dentist_user])
    db.commit()
    dentist_id = dentist_user.id
    db.close()

    admin_token = client.post(
        "/api/login",
        data={"username": "admin.agenda@dentalblanc.com", "password": "Admin12345!"}
    ).json()["access_token"]

    # Registrar paciente y agendar cita
    client.post("/api/register", json={
        "email": "paciente.cita@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Paciente Con Cita",
        "cedula": "1040506070",
        "fecha_nacimiento": "1994-04-12"
    })
    pat_token = client.post(
        "/api/login",
        data={"username": "paciente.cita@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]

    res_cita = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-11-29", "time": "14:00:00"},
        headers={"Authorization": f"Bearer {pat_token}"}
    )
    assert res_cita.status_code == 200
    cita_id = res_cita.json()["id"]
    assert res_cita.json()["dentist_id"] is None
    assert res_cita.json()["dentist_name"] is None

    # Asignar odontólogo con token admin
    res_assign = client.patch(
        f"/api/appointments/{cita_id}/assign-dentist",
        json={"dentist_id": dentist_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_assign.status_code == 200
    data_assigned = res_assign.json()
    assert data_assigned["id"] == cita_id
    assert data_assigned["dentist_id"] == dentist_id
    assert data_assigned["dentist_name"] == "Dr. Sergio Ramírez"


def test_21_assign_dentist_permissions_and_validations(client):
    """CP-021: Validaciones de seguridad en asignación de odontólogo (403 si no es admin, 404 y 400)."""
    from conftest import TestingSessionLocal
    import models
    import auth

    db = TestingSessionLocal()
    admin_user = models.User(
        email="admin.seg@dentalblanc.com",
        full_name="Admin Seguridad",
        cedula="99887766",
        fecha_nacimiento=date(1983, 2, 20),
        hashed_password=auth.get_password_hash("AdminPass123!"),
        role="admin",
        is_active=True,
    )
    non_dentist = models.User(
        email="paciente.comun@dentalblanc.com",
        full_name="Paciente Común",
        cedula="44332211",
        fecha_nacimiento=date(1996, 6, 15),
        hashed_password=auth.get_password_hash("Pass123!"),
        role="patient",
        is_active=True,
    )
    db.add_all([admin_user, non_dentist])
    db.commit()
    non_dentist_id = non_dentist.id
    db.close()

    admin_token = client.post(
        "/api/login",
        data={"username": "admin.seg@dentalblanc.com", "password": "AdminPass123!"}
    ).json()["access_token"]
    non_admin_token = client.post(
        "/api/login",
        data={"username": "paciente.comun@dentalblanc.com", "password": "Pass123!"}
    ).json()["access_token"]

    # Crear cita
    res_cita = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-11-30", "time": "09:00:00"},
        headers={"Authorization": f"Bearer {non_admin_token}"}
    )
    cita_id = res_cita.json()["id"]

    # 1. No admin intenta asignar -> 403 Forbidden
    res_403 = client.patch(
        f"/api/appointments/{cita_id}/assign-dentist",
        json={"dentist_id": 1},
        headers={"Authorization": f"Bearer {non_admin_token}"}
    )
    assert res_403.status_code == 403

    # 2. Asignar odontólogo inexistente -> 404 Not Found
    res_404 = client.patch(
        f"/api/appointments/{cita_id}/assign-dentist",
        json={"dentist_id": 99999},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_404.status_code == 404

    # 3. Asignar un usuario que no tiene rol dentist -> 400 Bad Request
    res_400 = client.patch(
        f"/api/appointments/{cita_id}/assign-dentist",
        json={"dentist_id": non_dentist_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_400.status_code == 400
    assert "no tiene el rol de odontólogo" in res_400.json()["detail"]


def test_22_download_appointment_pdf_success(client):
    """CP-022: Descarga exitosa de comprobante PDF (GET /api/appointments/{id}/pdf) por paciente y por admin."""
    from conftest import TestingSessionLocal
    import models
    import auth

    db = TestingSessionLocal()
    admin_user = models.User(
        email="admin.pdf@dentalblanc.com",
        full_name="Admin PDF",
        cedula="88776655",
        fecha_nacimiento=date(1981, 1, 10),
        hashed_password=auth.get_password_hash("AdminPdf123!"),
        role="admin",
        is_active=True,
    )
    dentist_user = models.User(
        email="dr.pdf@dentalblanc.com",
        full_name="Dr. Especialista PDF",
        cedula="71223344",
        fecha_nacimiento=date(1984, 8, 19),
        hashed_password=auth.get_password_hash("DrPdf123!"),
        role="dentist",
        is_active=True,
    )
    db.add_all([admin_user, dentist_user])
    db.commit()
    dentist_id = dentist_user.id
    db.close()

    # Paciente crea cita
    client.post("/api/register", json={
        "email": "paciente.pdf@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Paciente Descarga PDF",
        "cedula": "1055667788",
        "fecha_nacimiento": "1993-11-25"
    })
    pat_token = client.post(
        "/api/login",
        data={"username": "paciente.pdf@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    admin_token = client.post(
        "/api/login",
        data={"username": "admin.pdf@dentalblanc.com", "password": "AdminPdf123!"}
    ).json()["access_token"]
    dentist_token = client.post(
        "/api/login",
        data={"username": "dr.pdf@dentalblanc.com", "password": "DrPdf123!"}
    ).json()["access_token"]

    cita_id = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-12-01", "time": "11:00:00"},
        headers={"Authorization": f"Bearer {pat_token}"}
    ).json()["id"]

    # Asignar odontólogo
    client.patch(
        f"/api/appointments/{cita_id}/assign-dentist",
        json={"dentist_id": dentist_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # 1. Descarga por el paciente dueño
    res_pat = client.get(
        f"/api/appointments/{cita_id}/pdf",
        headers={"Authorization": f"Bearer {pat_token}"}
    )
    assert res_pat.status_code == 200
    assert "application/pdf" in res_pat.headers.get("content-type", "")
    assert f"comprobante_cita_{cita_id}.pdf" in res_pat.headers.get("content-disposition", "")
    assert len(res_pat.content) > 1000
    assert res_pat.content[:4] == b"%PDF"

    # 2. Descarga por el administrador
    res_admin = client.get(
        f"/api/appointments/{cita_id}/pdf",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_admin.status_code == 200
    assert "application/pdf" in res_admin.headers.get("content-type", "")
    assert res_admin.content[:4] == b"%PDF"

    # 3. Descarga por el odontólogo asignado
    res_dentist = client.get(
        f"/api/appointments/{cita_id}/pdf",
        headers={"Authorization": f"Bearer {dentist_token}"}
    )
    assert res_dentist.status_code == 200
    assert "application/pdf" in res_dentist.headers.get("content-type", "")
    assert res_dentist.content[:4] == b"%PDF"


def test_23_download_appointment_pdf_forbidden_for_other_users(client):
    """CP-023: Rechazo HTTP 403 si un usuario ajeno intenta descargar el PDF de otra persona."""
    # Paciente A crea cita
    client.post("/api/register", json={
        "email": "paciente.a@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Paciente A",
        "cedula": "1001001",
        "fecha_nacimiento": "1990-01-01"
    })
    token_a = client.post(
        "/api/login",
        data={"username": "paciente.a@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    cita_id = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-12-05", "time": "15:00:00"},
        headers={"Authorization": f"Bearer {token_a}"}
    ).json()["id"]

    # Paciente B se autentica
    client.post("/api/register", json={
        "email": "paciente.b@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Paciente B",
        "cedula": "1002002",
        "fecha_nacimiento": "1992-02-02"
    })
    token_b = client.post(
        "/api/login",
        data={"username": "paciente.b@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]

    # Paciente B intenta descargar cita de Paciente A -> 403 Forbidden
    res_forbidden = client.get(
        f"/api/appointments/{cita_id}/pdf",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res_forbidden.status_code == 403
    assert "No tienes permisos para descargar" in res_forbidden.json()["detail"]


def test_24_dentist_appointments_agenda_filter(client):
    """CP-024: Odontólogo solo visualiza en /api/appointments sus citas asignadas."""
    from conftest import TestingSessionLocal
    import models
    import auth

    db = TestingSessionLocal()
    admin_user = models.User(
        email="admin.agenda.filtro@dentalblanc.com",
        full_name="Admin Agenda",
        cedula="99112233",
        fecha_nacimiento=date(1982, 3, 10),
        hashed_password=auth.get_password_hash("Admin123!"),
        role="admin",
        is_active=True,
    )
    dentist_target = models.User(
        email="dr.objetivo@dentalblanc.com",
        full_name="Dr. Objetivo",
        cedula="88001122",
        fecha_nacimiento=date(1985, 4, 15),
        hashed_password=auth.get_password_hash("DrObj123!"),
        role="dentist",
        is_active=True,
    )
    dentist_other = models.User(
        email="dr.otro@dentalblanc.com",
        full_name="Dr. Otro",
        cedula="88003344",
        fecha_nacimiento=date(1987, 8, 20),
        hashed_password=auth.get_password_hash("DrOtro123!"),
        role="dentist",
        is_active=True,
    )
    db.add_all([admin_user, dentist_target, dentist_other])
    db.commit()
    target_id = dentist_target.id
    other_id = dentist_other.id
    db.close()

    admin_token = client.post(
        "/api/login",
        data={"username": "admin.agenda.filtro@dentalblanc.com", "password": "Admin123!"}
    ).json()["access_token"]
    dentist_token = client.post(
        "/api/login",
        data={"username": "dr.objetivo@dentalblanc.com", "password": "DrObj123!"}
    ).json()["access_token"]

    # Paciente crea 2 citas
    client.post("/api/register", json={
        "email": "paciente.agenda@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Paciente Agenda",
        "cedula": "77112233",
        "fecha_nacimiento": "1995-10-10"
    })
    pat_token = client.post(
        "/api/login",
        data={"username": "paciente.agenda@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]

    cita_1 = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-12-10", "time": "09:00:00"},
        headers={"Authorization": f"Bearer {pat_token}"}
    ).json()["id"]

    cita_2 = client.post(
        "/api/appointments",
        json={"service_id": 1, "date": "2026-12-11", "time": "10:00:00"},
        headers={"Authorization": f"Bearer {pat_token}"}
    ).json()["id"]

    # Asignar cita_1 a dentist_target, y cita_2 a dentist_other
    client.patch(
        f"/api/appointments/{cita_1}/assign-dentist",
        json={"dentist_id": target_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    client.patch(
        f"/api/appointments/{cita_2}/assign-dentist",
        json={"dentist_id": other_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # Cuando Dr. Objetivo consulta /api/appointments, solo ve cita_1
    res = client.get(
        "/api/appointments",
        headers={"Authorization": f"Bearer {dentist_token}"}
    )
    assert res.status_code == 200
    citas_dr = res.json()
    assert len(citas_dr) == 1
    assert citas_dr[0]["id"] == cita_1
    assert citas_dr[0]["dentist_id"] == target_id
    assert citas_dr[0]["dentist_name"] == "Dr. Objetivo"


def _get_admin_and_patient_tokens(client):
    from conftest import TestingSessionLocal
    import auth
    import models

    db = TestingSessionLocal()
    admin_user = db.query(models.User).filter_by(email="admin.crud@dentalblanc.com").first()
    if not admin_user:
        admin_user = models.User(
            email="admin.crud@dentalblanc.com",
            full_name="Admin CRUD",
            role="admin",
            hashed_password=auth.get_password_hash("Admin123!"),
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
    db.close()

    admin_token = client.post(
        "/api/login",
        data={"username": "admin.crud@dentalblanc.com", "password": "Admin123!"}
    ).json()["access_token"]
    
    client.post("/api/register", json={
        "email": "test.patient.crud@dentalblanc.com",
        "password": "Password123!",
        "full_name": "Test Paciente",
        "cedula": "99887766",
        "fecha_nacimiento": "1990-01-01"
    })
    patient_token = client.post(
        "/api/login",
        data={"username": "test.patient.crud@dentalblanc.com", "password": "Password123!"}
    ).json()["access_token"]
    
    return admin_token, patient_token


def test_25_admin_crud_services(client):
    admin_token, patient_token = _get_admin_and_patient_tokens(client)

    # 1. Non-admin gets 403
    res_unauth = client.post(
        "/api/services",
        json={"name": "Endodoncia", "description": "Tratamiento de conducto", "price": 450000},
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    assert res_unauth.status_code == 403

    # 2. Admin creates service
    res_create = client.post(
        "/api/services",
        json={"name": "Endodoncia", "description": "Tratamiento de conducto", "price": 450000},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_create.status_code == 201
    srv_id = res_create.json()["id"]
    assert res_create.json()["name"] == "Endodoncia"

    # 3. Admin updates service
    res_update = client.put(
        f"/api/services/{srv_id}",
        json={"price": 500000},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_update.status_code == 200
    assert res_update.json()["price"] == 500000

    # 4. Admin deletes service (soft delete)
    res_del = client.delete(
        f"/api/services/{srv_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_del.status_code == 200


def test_26_blogs_public_and_admin_crud(client):
    admin_token, patient_token = _get_admin_and_patient_tokens(client)

    # 1. Public can read blogs
    res_get = client.get("/api/blogs")
    assert res_get.status_code == 200

    # 2. Patient cannot create blog
    res_unauth = client.post(
        "/api/blogs",
        json={"title": "Test Blog", "excerpt": "Excerpt", "content": "Content"},
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    assert res_unauth.status_code == 403

    # 3. Admin creates blog
    res_create = client.post(
        "/api/blogs",
        json={"title": "Test Blog", "excerpt": "Excerpt", "content": "Content"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_create.status_code == 201
    blog_id = res_create.json()["id"]

    # 4. Public can read specific blog
    res_one = client.get(f"/api/blogs/{blog_id}")
    assert res_one.status_code == 200
    assert res_one.json()["title"] == "Test Blog"


def test_27_clinic_info_get_and_admin_update(client):
    admin_token, patient_token = _get_admin_and_patient_tokens(client)

    # 1. Public can read clinic info
    res_get = client.get("/api/clinic-info")
    assert res_get.status_code == 200
    assert "mision" in res_get.json()

    # 2. Patient cannot update clinic info
    res_unauth = client.put(
        "/api/clinic-info",
        json={"telefono": "+57 (601) 999-8888"},
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    assert res_unauth.status_code == 403

    # 3. Admin updates clinic info
    res_up = client.put(
        "/api/clinic-info",
        json={"telefono": "+57 (601) 999-8888"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_up.status_code == 200
    assert res_up.json()["telefono"] == "+57 (601) 999-8888"


def test_28_admin_creates_and_deactivates_dentist(client):
    """CP-028: Admin puede dar de alta nuevos odontólogos y desactivarlos del cuadro médico."""
    admin_token, patient_token = _get_admin_and_patient_tokens(client)

    # 1. Paciente no puede crear odontólogos (403 Forbidden)
    res_unauth = client.post(
        "/api/dentists",
        json={
            "full_name": "Dr. No Autorizado",
            "email": "dr.noauth@dentalblanc.com",
            "cedula": "70809010",
        },
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    assert res_unauth.status_code == 403

    # 2. Admin crea odontólogo exitosamente (201 Created)
    res_create = client.post(
        "/api/dentists",
        json={
            "full_name": "Dr. Camilo Torres",
            "email": "dr.torres@dentalblanc.com",
            "cedula": "80999111",
            "password": "PasswordDoctor123!"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_create.status_code == 201
    doc_data = res_create.json()
    assert doc_data["id"] > 0
    assert doc_data["full_name"] == "Dr. Camilo Torres"
    assert doc_data["email"] == "dr.torres@dentalblanc.com"
    assert doc_data["role"] == "dentist"
    assert doc_data["is_active"] is True
    dentist_id = doc_data["id"]

    # 3. Aparece en el listado activo de GET /api/dentists
    res_list = client.get("/api/dentists")
    assert res_list.status_code == 200
    emails = [d["email"] for d in res_list.json()]
    assert "dr.torres@dentalblanc.com" in emails

    # 4. Admin desactiva odontólogo
    res_del = client.delete(
        f"/api/dentists/{dentist_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_del.status_code == 200
    assert "desactivado" in res_del.json()["detail"]

    # 5. Ya no figura en la lista activa de GET /api/dentists
    res_list_after = client.get("/api/dentists")
    emails_after = [d["email"] for d in res_list_after.json()]
    assert "dr.torres@dentalblanc.com" not in emails_after


def test_29_overbooking_prevented_when_all_dentists_occupied(client):
    """CP-029: Prevenir sobrecupo médico. Si hay 2 odontólogos activos, el intento 3 a la misma hora es rechazado (409 Conflict)."""
    admin_token, _ = _get_admin_and_patient_tokens(client)

    # 1. Crear 2 odontólogos activos
    res_d1 = client.post(
        "/api/dentists",
        json={
            "full_name": "Dr. Primero",
            "email": "dr.primero@dentalblanc.com",
            "cedula": "1111111",
            "password": "Password123!",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_d1.status_code == 201

    res_d2 = client.post(
        "/api/dentists",
        json={
            "full_name": "Dr. Segundo",
            "email": "dr.segundo@dentalblanc.com",
            "cedula": "2222222",
            "password": "Password123!",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_d2.status_code == 201

    fecha_prueba = "2026-12-20"
    hora_prueba = "10:00:00"

    # Cita 1 a las 10:00:00 -> Aceptada y asignada al Dr. Primero
    res_1 = client.post(
        "/api/appointments",
        json={
            "service_id": 1,
            "date": fecha_prueba,
            "time": hora_prueba,
            "email": "paciente1@dentalblanc.com",
            "full_name": "Paciente Uno",
            "auto_assign": True,
        },
    )
    assert res_1.status_code == 200
    assert res_1.json()["dentist_name"] == "Dr. Primero"
    cita_1_id = res_1.json()["id"]

    # Cita 2 a las 10:00:00 -> Aceptada y asignada al Dr. Segundo (balanceo automático)
    res_2 = client.post(
        "/api/appointments",
        json={
            "service_id": 1,
            "date": fecha_prueba,
            "time": hora_prueba,
            "email": "paciente2@dentalblanc.com",
            "full_name": "Paciente Dos",
            "auto_assign": True,
        },
    )
    assert res_2.status_code == 200
    assert res_2.json()["dentist_name"] == "Dr. Segundo"

    # Cita 3 a las 10:00:00 -> RECHAZADA (409 Conflict: ambos doctores ya tienen paciente en esa hora)
    res_3 = client.post(
        "/api/appointments",
        json={
            "service_id": 1,
            "date": fecha_prueba,
            "time": hora_prueba,
            "email": "paciente3@dentalblanc.com",
            "full_name": "Paciente Tres",
            "auto_assign": True,
        },
    )
    assert res_3.status_code == 409
    assert "No hay disponibilidad médica" in res_3.json()["detail"]

    # Liberar cupo cancelando la cita 1
    res_cancel = client.patch(
        f"/api/appointments/{cita_1_id}/cancel",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_cancel.status_code == 200

    # Ahora sí permite agendar la cita 3 (Dr. Primero libre)
    res_reintento = client.post(
        "/api/appointments",
        json={
            "service_id": 1,
            "date": fecha_prueba,
            "time": hora_prueba,
            "email": "paciente3@dentalblanc.com",
            "full_name": "Paciente Tres",
            "auto_assign": True,
        },
    )
    assert res_reintento.status_code == 200
    assert res_reintento.json()["dentist_name"] == "Dr. Primero"

