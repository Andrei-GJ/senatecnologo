import subprocess
import os
import sys
import platform
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")
    
    is_windows = platform.system().lower() == "windows"
    npm_cmd = "npm.cmd" if is_windows else "npm"

    print("\n🦷 Preparando el entorno de la Clínica Odontológica...")

    backend_dir = os.path.join(root_dir, "backend")

    # Instalar dependencias de React si no hay node_modules
    if not os.path.exists(os.path.join(frontend_dir, "node_modules")):
        print("\n📦 Instalando dependencias del Frontend (Esto sólo ocurre la primera vez)...")
        try:
            subprocess.check_call([npm_cmd, "install", "--legacy-peer-deps"], cwd=frontend_dir)
        except Exception as e:
            print(f"Error instalando paquetes de frontend: {e}")
            sys.exit(1)

    # Verificar e instalar dependencias del Backend si faltan
    print("\n🐍 Verificando dependencias del Backend...")
    try:
        # Hacemos una comprobación rápida importando librerías clave
        subprocess.check_call([sys.executable, "-c", "import uvicorn, fastapi, sqlalchemy, jose"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print("📦 Instalando dependencias del Backend (requirements.txt)...")
        try:
            requirements_file = os.path.join(backend_dir, "requirements.txt")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_file])
        except Exception as e:
            print(f"Error instalando paquetes del backend: {e}")
            sys.exit(1)

    print("\n🚀 Iniciando servicios simultáneos desde la raíz...")
    
    # Configurar variables de entorno para que el backend reconozca la ruta de sus módulos
    backend_env = os.environ.copy()
    if "PYTHONPATH" in backend_env:
        backend_env["PYTHONPATH"] = backend_dir + os.pathsep + backend_env["PYTHONPATH"]
    else:
        backend_env["PYTHONPATH"] = backend_dir

    # Comando de backend usando el intérprete actual de python
    backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"]
    # Comando de frontend
    frontend_cmd = [npm_cmd, "run", "dev"]

    try:
        print("-> ⚙️  Levantando FastAPI (Backend) en el puerto 8000...")
        backend_process = subprocess.Popen(backend_cmd, cwd=backend_dir, env=backend_env)
        
        time.sleep(1.5) # Espera un instante para que los mensajes en consola no se sobrepongan feo
        
        print("-> 🎨 Levantando React/Vite (Frontend)...")
        frontend_process = subprocess.Popen(frontend_cmd, cwd=frontend_dir)
        
        # Mantener la ejecución viva observando los dos procesos
        backend_process.wait()
        frontend_process.wait()
        
    except KeyboardInterrupt:
        print("\n\n🛑 Deteniendo la Clínica Odontológica de forma segura...")
        try:
            backend_process.terminate()
            frontend_process.terminate()
            backend_process.wait(timeout=3)
            frontend_process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            backend_process.kill()
            frontend_process.kill()
            
        print("✅ Servicios detenidos.")
        sys.exit(0)

if __name__ == "__main__":
    main()
