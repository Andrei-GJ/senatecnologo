// ==========================================
// ARCHIVO CENTRAL DE LA APLICACIÓN (App.jsx)
// ==========================================
// Este archivo es como el director de la orquesta. 
// No toca los instrumentos (no tiene la lógica compleja), 
// solo decide en qué orden aparecen las partes de la página en la pantalla.

import './App.css';

// Aquí importamos las "herramientas" (hooks) que guardan los datos 
// de los usuarios y las citas médicas.
import { useAuth } from './hooks/useAuth';
import { useAppointments } from './hooks/useAppointments';

// Aquí importamos las "partes visuales" (componentes) de la página.
import { Header } from './components/Header';
import { ServiceList } from './components/ServiceList';
import { AuthForm } from './components/AuthForm';
import { AppointmentForm } from './components/AppointmentForm';

function App() {
  // 1. Extraemos las herramientas relacionadas con la Sesión del Usuario (Login/Registro)
  const { 
    token, // Si hay un token, significa que el usuario ya inició sesión
    authMode, // Nos dice si el usuario quiere "iniciar sesión" o "registrarse"
    authForm, // Guarda lo que el usuario escribe en el formulario de login/registro
    authError, // Guarda los mensajes de error por si se equivoca de contraseña
    handleAuthChange, // Función para detectar cuando escribe en los campos
    handleAuthSubmit, // Función para enviar los datos de login/registro
    toggleAuthMode, // Función para cambiar entre "Registrar" o "Iniciar Sesión"
    logout // Función para cerrar sesión (salir de la cuenta)
  } = useAuth();
  
  // 2. Extraemos las herramientas relacionadas con las Citas Médicas y Servicios
  const { 
    services, // La lista de servicios que ofrece la clínica (ej: Limpieza, Extracción)
    loading, // Un estado que nos dice si los servicios aún están cargando desde el servidor
    formData, // Guarda la fecha, hora y servicio que el paciente escogió
    submitStatus, // Nos dice si la cita se está enviando, si fue exitosa o si hubo error
    handleInputChange, // Función para guardar lo que el paciente escoge para la cita
    submitAppointment // Función que le avisa al servidor que guarde la cita final
  } = useAppointments(token); // Le pasamos el token para que el servidor sepa quién agendó

  return (
    // Todo lo que está dentro de este recuadro es lo que el navegador dibujará (HTML modificado llamado JSX)
    <div className="app-container">
      
      {/* 1. Muestra la cabecera superior azul con el título de "Dental Blanc" */}
      <Header token={token} onLogout={logout} />

      <main className="main-content">
        
        {/* 2. Muestra los cuadros (tarjetas) con los servicios de la odontología */}
        <ServiceList loading={loading} services={services} />

        {/* 3. Lógica para decidir qué mostrar: ¿Formulario de Login o Formulario de Cita? */}
        {!token ? (
          // Si NO hay token (es decir, no ha iniciado sesión), le mostramos la pantalla de Ingreso
          <AuthForm 
            authMode={authMode} 
            authForm={authForm} 
            authError={authError} 
            onAuthChange={handleAuthChange} 
            onAuthSubmit={handleAuthSubmit} 
            onToggleMode={toggleAuthMode}
          />
        ) : (
          // Si SI hay token (ya inició sesión), le mostramos el formulario para pedir la cita
          <AppointmentForm 
            services={services} 
            formData={formData} 
            submitStatus={submitStatus} 
            onChange={handleInputChange} 
            onSubmit={submitAppointment}
          />
        )}
      </main>
    </div>
  );
}

// Exportamos esta función principal para que React pueda arrancarla
export default App;
