# 🦷 Backend & Frontend Simultáneos para Clínica Odontológica

Este proyecto contiene un sistema integrado y moderno para una Clínica Odontológica, compuesto por:
1. **Backend**: Creado usando Python con `FastAPI`, extremadamente rápido y robusto.
2. **Frontend**: Desarrollado en JavaScript usando `React` y empaquetado con `Vite`, con una excelente calidad gráfica, moderna, veloz y lista.
 
---

## 🛠️ Requisitos Previos Generales
Asegúrate de tener instalado:
- **Python** (versión 3.8 o superior).
- **Node.js** (versión 18 o superior, que incluye gestor `npm`).

---

## 👨‍💻 Cómo Iniciarlo (El Método Unificado y Mágico)

He implementado un script central en la carpeta raíz `start.py` para que **el Backend y el Frontend convivan en la misma ventana de terminal** y funcionen de manera fluida, sin necesidad de navegar a carpetas separadas. ¡Ambos sistemas se encenderán desde aquí!

### 1. Preparar las dependencias (Sólo necesario la primera vez)
Estando en la raíz del proyecto (`/home/andrei/repositorios/odontologia/`), crea un entorno virtual y dótalo de los requerimientos de Python:

**Para Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

**Para Windows (CMD / PowerShell):**
```cmd
python -m venv venv
venv\Scripts\activate
pip install -r backend/requirements.txt
```

*(El script `start.py` ya se encargará automáticamente de instalar por ti los paquetes del Frontend en `npm` si ve que no los tienes todavía).*

### 2. Arrancar Todo a la Vez 🚀

Una vez tengas tu entorno virtual con Python activo desde la raíz, tan solo ejecuta el poderoso script orquestador:

```bash
python start.py
```

### 3. ¡Disfruta el Sistema!

- El terminal te indicará que ambas aplicaciones levantaron de forma perfecta.
- Frontend (React): Haz [Click en el Enlace de Vite](http://localhost:5173) en tu ventana, y navega por la interfaz de usuario con tu navegador.
- Backend (FastAPI): Si quieres consultar la documentación técnica de la API interactiva visita [`http://localhost:8000/docs`](http://localhost:8000/docs).

Para apagar ambos servicios al mismo tiempo, simplemente oprime `Ctrl + C` en la terminal.

---

## ✨ Características Ocultas

- Estilos "Vanilla CSS" inspirados en el diseño premium y de salud dental (Bordes suaves, Glassmorphism, sombras).
- Totalmente unificados en una simple ejecución gracias a Python.
- La ejecución en caliente (Hot Reload) sigue activa. ¡Haz un cambio en el código y lo verás al instante sin necesidad de apagar nada!