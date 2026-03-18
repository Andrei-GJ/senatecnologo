# =========================================================================
# ARCHIVO DE AUTENTICACIÓN Y SEGURIDAD (auth.py)
# =========================================================================
# Este archivo se encarga de dos cosas principales:
# 1. Encriptar o proteger las contraseñas.
# 2. Crear los "Tokens JWT" (Identificaciones digitales) para los usuarios.

import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv, find_dotenv

# Carga las variables del archivo .env
load_dotenv(find_dotenv())

# ----------------- CONFIGURACIONES DEL TOKEN -----------------
# La llave secreta se lee desde el archivo .env (ya no está en el código)
SECRET_KEY = os.getenv("SECRET_KEY", "clave-por-defecto-cambiar-en-produccion")
ALGORITHM = "HS256" # El algoritmo matemático que sella la firma.
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # El token dura 7 días y luego pide login de nuevo.

# ----------------- FUNCIONES DE SEGURIDAD -----------------

# 1. Verificar si la contraseña que escribió el usuario es correcta.
# Compara el texto normal (plain_password) con el texto protegido (hashed_password).
def verify_password(plain_password, hashed_password):
    return check_password_hash(hashed_password, plain_password)

# 2. Encriptar la contraseña antes de guardarla en la Base de Datos.
# Convierte "123456" en un texto largo e ilegible por seguridad.
def get_password_hash(password):
    return generate_password_hash(password)

# 3. Crear el Token de Acceso (La identificación digital del paciente).
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    # Hacemos una copia de los datos del paciente (normalmente su correo)
    to_encode = data.copy()
    
    # Calculamos la fecha y hora exacta en que este token dejará de funcionar
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15) # Por defecto dura 15 minutos
        
    # Agregamos la fecha de expiración ('exp') a los datos
    to_encode.update({"exp": expire})
    
    # Finalmente, creamos y firmamos el token usando nuestra llave secreta (SECRET_KEY)
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # Devolvemos el token generado
    return encoded_jwt
