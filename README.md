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

## ✅ Progreso y TO-DO

- [x] Migración a PostgreSQL (Supabase).
- [x] Implementación de Variables de Entorno.
- [x] Rediseño de Interfaz a Estética Premium.
- [x] Migración Completa a Tailwind CSS v4.
- [x] Registro de Paciente con Cédula y Fecha de Nacimiento.
- [ ] Panel de Administración Avanzado (En desarrollo).
- [x] Exportación de Reportes a PDF (Pendiente).

---

&copy; 2024 Dental Blanc\
