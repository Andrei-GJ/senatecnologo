// App.jsx - Rediseño enfocado en Salud Dental (Estilo "Sonría")

import { useState, useEffect } from 'react';

import { Encabezado } from './components/Encabezado';
import { TarjetasServicios } from './components/TarjetasServicios';
import { FormularioLogin } from './components/FormularioLogin';
import { FormularioCita } from './components/FormularioCita';
import { PaginaServicios } from './components/PaginaServicios';
import { PaginaNosotros } from './components/PaginaNosotros';
import { PaginaBlog } from './components/PaginaBlog';
import { PaginaArticulo } from './components/PaginaArticulo';

// Configuración dinámica de la API: usa la variable de entorno de Vite o localhost por defecto
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function App() {
  const [vistaActual, setVistaActual] = useState('inicio');
  const [articuloId, setArticuloId] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [modoAuth, setModoAuth] = useState('login');
  const [errorAuth, setErrorAuth] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  const [servicioElegido, setServicioElegido] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [estadoCita, setEstadoCita] = useState(null);

  useEffect(() => {
    fetch(API + '/services')
      .then(res => res.json())
      .then(datos => {
        setServicios(datos);
        if (datos.length > 0) setServicioElegido(datos[0].id);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  async function registrarPaciente() {
    const res = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: nombre, cedula, fecha_nacimiento: fechaNacimiento }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Error en el registro');
    }
    setModoAuth('login');
    setErrorAuth('¡Registro exitoso! Ya puedes iniciar sesión.');
  }

  async function iniciarSesion() {
    const cuerpo = new URLSearchParams();
    cuerpo.append('username', email);
    cuerpo.append('password', password);

    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cuerpo,
    });
    if (!res.ok) throw new Error('Correo o contraseña incorrectos');

    const datos = await res.json();
    setToken(datos.access_token);
    localStorage.setItem('token', datos.access_token);
    setMostrarModalAuth(false);
  }

  async function alEnviarAuth(e) {
    e.preventDefault();
    setErrorAuth(null);
    try {
      if (modoAuth === 'register') await registrarPaciente();
      else await iniciarSesion();
    } catch (err) {
      setErrorAuth(err.message);
    }
  }

  function cerrarSesion() {
    setToken(null);
    localStorage.removeItem('token');
  }

  function verArticulo(id) {
    setArticuloId(id);
    setVistaActual('articulo');
  }

  async function alEnviarCita(e) {
    e.preventDefault();
    setEstadoCita('submitting');
    try {
      const res = await fetch(API + '/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ service_id: Number(servicioElegido), date: fechaCita, time: horaCita }),
      });
      if (res.ok) {
        setEstadoCita('success');
        setFechaCita(''); setHoraCita('');
        setTimeout(() => setEstadoCita(null), 5000);
      } else {
        setEstadoCita('error');
      }
    } catch (error) {
      setEstadoCita('error');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 selection:bg-sky-100 font-['Outfit']">
      
      <Encabezado 
        sesionActiva={token !== null} 
        alCerrarSesion={cerrarSesion} 
        alAbrirLogin={() => setMostrarModalAuth(true)}
        vistaActual={vistaActual}
        alCambiarVista={setVistaActual}
      />

      <main className="flex-1">
        
        {vistaActual === 'inicio' && (
          <>
            {/* Banner Hero - Enfoque en Bienestar y Sonrisas */}
            <section className="relative overflow-hidden bg-white py-16 sm:py-24">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center">
                  <span className="inline-block rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-600 uppercase mb-4">
                    Cuidado Dental Avanzado
                  </span>
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                    Diseñamos la sonrisa de <br/>
                    <span className="text-sky-500 italic">tus sueños</span>
                  </h1>
                  <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                    En Dental Blanc combinamos calidez humana con tecnología de punta para que sonrías con total confianza. Tu salud oral es nuestra prioridad.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    {!token && (
                      <button
                        onClick={() => setMostrarModalAuth(true)}
                        className="rounded-full bg-sky-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-200 hover:bg-sky-600 transition-all hover:scale-105 active:scale-95"
                      >
                        Agendar Valoración Gratuita
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Elementos decorativos (círculos suaves) */}
              <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-sky-100/50 mix-blend-multiply blur-3xl" />
              <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-cyan-100/50 mix-blend-multiply blur-3xl" />
            </section>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
              <TarjetasServicios cargando={cargando} servicios={servicios} />

              {/* Sección de Agenda - Solo visible si hay sesión */}
              {token !== null && (
                <div id="agendar" className="mt-12 transition-all duration-500 ease-out translate-y-0 opacity-100">
                  <FormularioCita
                    servicios={servicios}
                    servicioElegido={servicioElegido}
                    fechaCita={fechaCita}
                    horaCita={horaCita}
                    estado={estadoCita}
                    alCambiarServicio={e => setServicioElegido(e.target.value)}
                    alCambiarFecha={e => setFechaCita(e.target.value)}
                    alCambiarHora={e => setHoraCita(e.target.value)}
                    alEnviar={alEnviarCita}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {vistaActual === 'servicios' && <PaginaServicios cargando={cargando} servicios={servicios} token={token} alAbrirLogin={() => setMostrarModalAuth(true)} />}
        {vistaActual === 'nosotros' && <PaginaNosotros />}
        {vistaActual === 'blog' && <PaginaBlog alVerArticulo={verArticulo} />}
        {vistaActual === 'articulo' && <PaginaArticulo id={articuloId} alVolver={() => setVistaActual('blog')} />}
        
      </main>

      {/* Footer Más Amigable */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="text-sky-500 font-bold text-lg mb-2">DENTAL BLANC</div>
          <p className="text-slate-400 text-sm mb-6">Un compromiso real con tu bienestar oral.</p>
          <div className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
            &copy; 2024 Dental Blanc &bull; Especialistas en Sonrisas
          </div>
        </div>
      </footer>

      {/* Modal de Autenticación */}
      {mostrarModalAuth && (
        <FormularioLogin
          modo={modoAuth}
          email={email}
          password={password}
          nombre={nombre}
          cedula={cedula}
          fechaNacimiento={fechaNacimiento}
          error={errorAuth}
          alCambiarEmail={e => setEmail(e.target.value)}
          alCambiarPassword={e => setPassword(e.target.value)}
          alCambiarNombre={e => setNombre(e.target.value)}
          alCambiarCedula={e => setCedula(e.target.value)}
          alCambiarFechaNacimiento={e => setFechaNacimiento(e.target.value)}
          alEnviar={alEnviarAuth}
          alCerrar={() => {
            setMostrarModalAuth(false);
            setErrorAuth(null);
          }}
          alCambiarModo={() => {
            setModoAuth(modoAuth === 'login' ? 'register' : 'login');
            setErrorAuth(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
