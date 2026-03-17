import os
import sys

# Agregar la ruta del directorio para que pueda importar módulos locales
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

import models
import auth
from database import engine, SessionLocal

# Crear tablas
models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    try:
        # Verificar si hay servicios
        if db.query(models.Service).count() == 0:
            servicios_base = [
                models.Service(name="Limpieza Dental", description="Limpieza profunda con ultrasonido", price=120000.0),
                models.Service(name="Blanqueamiento", description="Sesión de blanqueamiento dental led", price=350000.0),
                models.Service(name="Extracción", description="Extracción de pieza dental simple", price=80000.0),
                models.Service(name="Ortodoncia (Valoración)", description="Consulta inicial para brackets", price=50000.0),
            ]
            db.add_all(servicios_base)
            
        # Crear usuario administrador base
        if not db.query(models.User).filter(models.User.email == "admin@dentalblanc.com").first():
            user = models.User(
                email="admin@dentalblanc.com",
                full_name="Administrador Principal",
                hashed_password=auth.get_password_hash("admin123"),
                role="admin"
            )
            db.add(user)

        db.commit()
        print("✅ Base de datos poblada exitosamente con servicios e inquilinos base!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
