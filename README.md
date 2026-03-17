# 🦷 Dental Blanc - Sistema Clínico Odontológico (Fullstack)

Este proyecto es una solución integral y moderna para la gestión de una Clínica Odontológica, diseñada con un enfoque de alto rendimiento y estética de lujo.

1. **Backend**: Python con `FastAPI`. Migrado de SQLite a **Supabase (PostgreSQL)** para escalabilidad y seguridad.
2. **Frontend**: `React` con `Vite`, migrado totalmente a **Tailwind CSS v4**. Diseño premium inspirado en estéticas de alto impacto (Gymshark style).

---

## 🚀 Novedades de la Versión 2.0

- **☁️ Cloud Database**: Integración completa con Supabase.
- **🎨 Tailwind CSS v4**: Motor de diseño ultra-rápido y minimalista.
- **🔐 Seguridad Avanzada**: Manejo de variables de entorno (`.env`) y protección de credenciales.
- **💎 Interfaz Premium**: Sistema de navegación limpia, tipografía de alto impacto y autenticación mediante modales elegantes.

---

## 🛠️ Requisitos Previos

- **Python** 3.10+
- **Node.js** 20+
- **Cuenta en Supabase** (para la base de datos PostgreSQL)

---

## ⚙️ Configuración del Entorno (.env)

Es **obligatorio** configurar el archivo `/backend/.env` para que el sistema funcione. Crea el archivo con el siguiente formato:

```env
# URL de conexión (Obtenla en Supabase > Settings > Database > URI)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Llave secreta para firmar los tokens JWT
SECRET_KEY=una_clave_muy_segura_aqui
```

---

## 👨‍💻 Cómo Iniciar el Proyecto

### 1. Preparar el Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Linux/macOS
# o venv\Scripts\activate en Windows
pip install -r requirements.txt
```

### 2. Poblar la Base de Datos (Semilla)
Ejecuta esto una sola vez para crear las tablas y servicios base en Supabase:
```bash
python seed.py
```

### 3. Iniciar todo con el Orquestador
Desde la raíz del proyecto:
```bash
python start.py
```
- **Frontend**: [http://localhost:5174](http://localhost:5174)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## ✨ Características Técnicas

- **Persistencia Distribuida**: Conexión optimizada con `pool_pre_ping` para evitar cuelgues de red.
- **Glassmorphism & UX**: Animaciones suaves de entrada y desenfoque de fondo en modales.
- **Modularidad**: Componentes React 100% funcionales y desacoplados.
- **Mobile First**: Diseño totalmente responsivo para tablets y celulares.

---

## ☁️ Deploy en Vercel

El proyecto ya incluye toda la configuración necesaria (`vercel.json`, `api/index.py`).
Sigue estos pasos para publicarlo en producción:

### 1. Importar el repositorio

1. Ve a [vercel.com/new](https://vercel.com/new) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New… → Project"** y selecciona el repositorio `senatecnologo`.
3. Vercel detectará automáticamente el `vercel.json`; no necesitas cambiar ninguna configuración del framework.

### 2. Configurar las Variables de Entorno

Antes de hacer el primer deploy, ve a **Settings → Environment Variables** y agrega:

| Variable | Valor | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:[PASS]@[HOST]:5432/postgres` | Obtenla en Supabase → Settings → Database → URI |
| `SECRET_KEY` | `una_cadena_aleatoria_muy_larga` | Clave secreta para firmar los tokens JWT |

> 💡 Puedes generar un `SECRET_KEY` seguro con: `python -c "import secrets; print(secrets.token_hex(32))"`

### 3. Hacer el Deploy

Haz clic en **"Deploy"**. Vercel ejecutará:
```
cd frontend && npm install && npm run build
```
y publicará el resultado en `frontend/dist`.
La API FastAPI quedará disponible en `https://tu-app.vercel.app/api`.

### 4. Inicializar la Base de Datos (primera vez)

Ejecuta el script de semilla **una sola vez** apuntando a tu base de datos de Supabase:
```bash
cd backend
cp .env.example .env       # Agrega DATABASE_URL y SECRET_KEY reales
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python seed.py             # Crea tablas y servicios iniciales
```

### 5. Actualizaciones automáticas

Cada `git push` a la rama `main` lanzará un nuevo deploy automáticamente en Vercel.

---

## 👨‍💻 Desarrollo Local (sigue funcionando igual)

```bash
python start.py   # Levanta backend en :8000 y frontend en :5174
```

El proxy de Vite redirige `/api/*` al backend local; no necesitas configurar ninguna variable de entorno adicional.

---

## ✅ Progreso y TO-DO

- [x] Migración a PostgreSQL (Supabase).
- [x] Implementación de Variables de Entorno.
- [x] Rediseño de Interfaz a Estética Premium.
- [x] Migración Completa a Tailwind CSS v4.
- [x] Registro de Paciente con Cédula y Fecha de Nacimiento.
- [x] Configuración de Deploy en Vercel (`vercel.json` + API serverless).
- [ ] Panel de Administración Avanzado (En desarrollo).
- [ ] Exportación de Reportes a PDF (Pendiente).

---

&copy; 2024 Dental Blanc &bull; Medellín, Colombia
