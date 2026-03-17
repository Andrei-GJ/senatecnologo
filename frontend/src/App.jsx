// App.jsx - Archivo principal del frontend de Dental Blanc
// Aquí está toda la lógica de la aplicación.

import { useState, useEffect } from 'react';
import './App.css';

import { Encabezado } from './components/Encabezado';
import { TarjetasServicios } from './components/TarjetasServicios';
import { FormularioLogin } from './components/FormularioLogin';
import { FormularioCita } from './components/FormularioCita';

// Dirección del backend
const API = 'http://localhost:8000/api';

function App() {

  // ---- Lista de servicios ----
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ---- Sesión ----
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [modoAuth, setModoAuth] = useState('login');
  const [errorAuth, setErrorAuth] = useState(null);

  // ---- Campos del formulario de login/registro (cada uno por separado) ----
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  // ---- Campos del formulario de cita (cada uno por separado) ----
  const [servicioElegido, setServicioElegido] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [estadoCita, setEstadoCita] = useState(null);


  // ==================== CARGAR SERVICIOS ====================
  // Se ejecuta una vez al abrir la página.
  useEffect(function () {
    fetch(API + '/services')
      .then(function (res) { return res.json(); })
      .then(function (datos) {
        setServicios(datos);
        if (datos.length > 0) {
          setServicioElegido(datos[0].id);
        }
        setCargando(false);
      })
      .catch(function () {
        setCargando(false);
      });
  }, []);


  // ==================== REGISTRO ====================
  async function registrarPaciente() {
    var respuesta = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password,
        full_name: nombre,
        cedula: cedula,
        fecha_nacimiento: fechaNacimiento,
      }),
    });

    if (!respuesta.ok) {
      var error = await respuesta.json();
      throw new Error(error.detail || 'Error en el registro');
    }

    // Si todo salió bien, lo mandamos a iniciar sesión
    setModoAuth('login');
    setErrorAuth('¡Registro exitoso! Ya puedes iniciar sesión.');
    setPassword('');
    setNombre('');
    setCedula('');
    setFechaNacimiento('');
  }


  // ==================== LOGIN ====================
  async function iniciarSesion() {
    var cuerpo = new URLSearchParams();
    cuerpo.append('username', email);
    cuerpo.append('password', password);

    var respuesta = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cuerpo,
    });

    if (!respuesta.ok) {
      throw new Error('Correo o contraseña incorrectos');
    }

    var datos = await respuesta.json();
    setToken(datos.access_token);
    localStorage.setItem('token', datos.access_token);
  }


  // ==================== AL ENVIAR LOGIN/REGISTRO ====================
  async function alEnviarAuth(e) {
    e.preventDefault();
    setErrorAuth(null);

    try {
      if (modoAuth === 'register') {
        await registrarPaciente();
      } else {
        await iniciarSesion();
      }
    } catch (err) {
      setErrorAuth(err.message);
    }
  }


  // ==================== CERRAR SESIÓN ====================
  function cerrarSesion() {
    setToken(null);
    localStorage.removeItem('token');
  }


  // ==================== AGENDAR CITA ====================
  async function alEnviarCita(e) {
    e.preventDefault();
    setEstadoCita('submitting');

    try {
      var respuesta = await fetch(API + '/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          service_id: Number(servicioElegido),
          date: fechaCita,
          time: horaCita,
        }),
      });

      if (respuesta.ok) {
        setEstadoCita('success');
        setFechaCita('');
        setHoraCita('');
        setTimeout(function () { setEstadoCita(null); }, 5000);
      } else {
        setEstadoCita('error');
      }
    } catch (error) {
      setEstadoCita('error');
    }
  }


  // ==================== LO QUE SE VE EN PANTALLA ====================
  return (
    <div className="app-container">

      <Encabezado sesionActiva={token !== null} alCerrarSesion={cerrarSesion} />

      <main className="main-content">

        <TarjetasServicios cargando={cargando} servicios={servicios} />

        {/* Si NO tiene sesión: mostrar login. Si SI tiene: mostrar formulario de cita */}
        {token === null ? (
          <FormularioLogin
            modo={modoAuth}
            email={email}
            password={password}
            nombre={nombre}
            cedula={cedula}
            fechaNacimiento={fechaNacimiento}
            error={errorAuth}
            alCambiarEmail={function (e) { setEmail(e.target.value); }}
            alCambiarPassword={function (e) { setPassword(e.target.value); }}
            alCambiarNombre={function (e) { setNombre(e.target.value); }}
            alCambiarCedula={function (e) { setCedula(e.target.value); }}
            alCambiarFechaNacimiento={function (e) { setFechaNacimiento(e.target.value); }}
            alEnviar={alEnviarAuth}
            alCambiarModo={function () {
              setModoAuth(modoAuth === 'login' ? 'register' : 'login');
              setErrorAuth(null);
            }}
          />
        ) : (
          <FormularioCita
            servicios={servicios}
            servicioElegido={servicioElegido}
            fechaCita={fechaCita}
            horaCita={horaCita}
            estado={estadoCita}
            alCambiarServicio={function (e) { setServicioElegido(e.target.value); }}
            alCambiarFecha={function (e) { setFechaCita(e.target.value); }}
            alCambiarHora={function (e) { setHoraCita(e.target.value); }}
            alEnviar={alEnviarCita}
          />
        )}
      </main>
    </div>
  );
}

export default App;
