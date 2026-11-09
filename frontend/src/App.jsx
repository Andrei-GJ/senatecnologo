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
import { MisCitas } from './components/MisCitas';
import { PanelAdmin } from './components/PanelAdmin';

// Configuración dinámica de la API: usa la variable de entorno de Vite o localhost por defecto
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Función para normalizar cualquier error (string, dict, o array de FastAPI) a texto seguro
function normalizarMensajeError(errorDetail) {
  if (!errorDetail) return 'Ocurrió un error inesperado al procesar la solicitud.';
  if (typeof errorDetail === 'string') return errorDetail;
  if (Array.isArray(errorDetail)) {
    return errorDetail
      .map(err => {
        if (typeof err === 'string') return err;
        const campo = err.loc && Array.isArray(err.loc)
          ? err.loc.filter(l => l !== 'body').join(' ')
          : '';
        const msg = err.msg || JSON.stringify(err);
        return campo ? `${campo}: ${msg}` : msg;
      })
      .join('. ');
  }
  if (typeof errorDetail === 'object') {
    return errorDetail.detail || errorDetail.message || errorDetail.msg || JSON.stringify(errorDetail);
  }
  return String(errorDetail);
}

function App() {
  const [vistaActual, setVistaActual] = useState('inicio');
  const [articuloId, setArticuloId] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('usuario');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

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
  const [mensajeErrorCita, setMensajeErrorCita] = useState(null);
  const [nombrePacienteCita, setNombrePacienteCita] = useState('');
  const [emailPacienteCita, setEmailPacienteCita] = useState('');
  const [cedulaPacienteCita, setCedulaPacienteCita] = useState('');
  const [citaExitosa, setCitaExitosa] = useState(null);
  const [disponibilidadHoraria, setDisponibilidadHoraria] = useState(null);

  // Consultar disponibilidad horaria en tiempo real según la fecha seleccionada y el paciente
  useEffect(() => {
    if (!fechaCita) {
      setDisponibilidadHoraria(null);
      return;
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const emailQuery = (!token && emailPacienteCita && emailPacienteCita.includes('@'))
      ? `&email=${encodeURIComponent(emailPacienteCita.trim().toLowerCase())}`
      : '';

    fetch(`${API}/available-slots?date=${fechaCita}${emailQuery}`, { headers })
      .then(res => res.json())
      .then(data => {
        setDisponibilidadHoraria(data);
        if (data && horaCita) {
          if (data.patient_appointment_today) {
            setHoraCita('');
          } else if (Array.isArray(data.available_hours) && !data.available_hours.includes(horaCita)) {
            setHoraCita('');
          }
        }
      })
      .catch(() => setDisponibilidadHoraria(null));
  }, [fechaCita, emailPacienteCita, citaExitosa, token]);

  // Cargar catálogo de servicios disponibles
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

  // Validar y sincronizar datos de usuario al tener token activo
  useEffect(() => {
    if (!token) return;

    fetch(API + '/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Sesión expirada o no autorizada.');
        return res.json();
      })
      .then(datosUsuario => {
        setUsuario(datosUsuario);
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
      })
      .catch(() => {
        // En caso de token inválido o expirado, limpiar almacenamiento
        setToken(null);
        setUsuario(null);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      });
  }, [token]);

  // Sincronizar automáticamente el formulario con los datos del usuario activo y evitar mezcla de sesiones
  useEffect(() => {
    if (usuario) {
      setNombrePacienteCita(usuario.full_name || '');
      setEmailPacienteCita(usuario.email || '');
      setCedulaPacienteCita(usuario.cedula || '');
    } else {
      setNombrePacienteCita('');
      setEmailPacienteCita('');
      setCedulaPacienteCita('');
      setEstadoCita(null);
      setMensajeErrorCita(null);
      setCitaExitosa(null);
    }
  }, [usuario]);

  async function registrarPaciente() {
    const nombreLimpio = (nombre || '').trim().replace(/\s+/g, ' ');
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{3,70}$/;
    if (!nombreRegex.test(nombreLimpio)) {
      throw new Error('El nombre completo debe contener únicamente letras y espacios (mínimo 3 caracteres, sin números ni símbolos).');
    }

    const res = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: nombreLimpio, cedula, fecha_nacimiento: fechaNacimiento }),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = normalizarMensajeError(errorJson.detail || 'Error en el registro');
      throw new Error(msg);
    }
    // Auto-login automático e inmediato: no poner al paciente a volver a digitar credenciales
    await iniciarSesion(email, password);
  }

  async function iniciarSesion(correoParam = null, claveParam = null) {
    const userEmail = correoParam || email;
    const userPassword = claveParam || password;

    const cuerpo = new URLSearchParams();
    cuerpo.append('username', userEmail);
    cuerpo.append('password', userPassword);

    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cuerpo,
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = normalizarMensajeError(errorJson.detail || 'Correo o contraseña incorrectos');
      throw new Error(msg);
    }

    const datos = await res.json();
    setToken(datos.access_token);
    localStorage.setItem('token', datos.access_token);

    // Limpiar estados transitorios de cita previa al cambiar de cuenta
    setEstadoCita(null);
    setMensajeErrorCita(null);
    setCitaExitosa(null);

    if (datos.user) {
      setUsuario(datos.user);
      localStorage.setItem('usuario', JSON.stringify(datos.user));
      setNombrePacienteCita(datos.user.full_name || '');
      setEmailPacienteCita(datos.user.email || '');
      setCedulaPacienteCita(datos.user.cedula || '');

      // Redireccionar inmediatamente a la vista de su rol
      if (datos.user.role === 'admin') {
        setVistaActual('admin');
      } else if (datos.user.role === 'dentist') {
        setVistaActual('agenda');
      } else {
        setVistaActual('mis-citas');
      }
    }

    setMostrarModalAuth(false);
  }

  async function iniciarSesionRapida(correo, clave) {
    setErrorAuth(null);
    try {
      await iniciarSesion(correo, clave);
    } catch (err) {
      setErrorAuth(err.message);
      setMostrarModalAuth(true);
    }
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
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setNombrePacienteCita('');
    setEmailPacienteCita('');
    setCedulaPacienteCita('');
    setFechaCita('');
    setHoraCita('');
    setEstadoCita(null);
    setMensajeErrorCita(null);
    setCitaExitosa(null);
    setVistaActual('inicio');
  }

  function verArticulo(id) {
    setArticuloId(id);
    setVistaActual('articulo');
  }

  async function alEnviarCita(e) {
    e.preventDefault();
    setEstadoCita('submitting');
    setMensajeErrorCita(null);
    setCitaExitosa(null);

    // 1. Validación rigurosa de fecha y hora
    const ahora = new Date();
    const hoyStr = ahora.toLocaleDateString('en-CA');
    const horaActualStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    if (!fechaCita) {
      setMensajeErrorCita('Por favor selecciona la fecha de tu consulta.');
      setEstadoCita('error');
      return;
    }
    if (fechaCita < hoyStr) {
      setMensajeErrorCita('La fecha de la cita no puede ser anterior al día de hoy.');
      setEstadoCita('error');
      return;
    }
    if (!horaCita) {
      setMensajeErrorCita('Por favor selecciona la hora de tu consulta.');
      setEstadoCita('error');
      return;
    }
    if (fechaCita === hoyStr && horaCita <= horaActualStr) {
      setMensajeErrorCita(`La hora seleccionada (${horaCita}) ya transcurrió el día de hoy. Por favor elige un horario posterior.`);
      setEstadoCita('error');
      return;
    }
    if (horaCita < '07:00' || horaCita > '19:00') {
      setMensajeErrorCita('El horario de atención odontológica es de 07:00 a 19:00.');
      setEstadoCita('error');
      return;
    }

    // 2. Resolver servicio odontológico válido
    const idServicio = Number(servicioElegido || (servicios[0] ? servicios[0].id : 1));
    const horaFormateada = horaCita.length === 5 ? `${horaCita}:00` : horaCita;

    const payload = {
      service_id: idServicio,
      date: fechaCita,
      time: horaFormateada,
      auto_assign: true,
    };

    // 3. Validación de datos de contacto para paciente sin inicio de sesión (guest)
    if (!token) {
      const nombreLimpio = (nombrePacienteCita || '').trim().replace(/\s+/g, ' ');
      const emailLimpio = (emailPacienteCita || '').trim().toLowerCase();
      const cedulaLimpia = (cedulaPacienteCita || '').replace(/\D/g, '');

      const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{3,70}$/;
      if (!nombreRegex.test(nombreLimpio)) {
        setMensajeErrorCita('El nombre completo debe contener únicamente letras y espacios (mínimo 3 caracteres, sin números ni símbolos).');
        setEstadoCita('error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailLimpio || !emailRegex.test(emailLimpio)) {
        setMensajeErrorCita('Por favor ingresa un correo electrónico válido (ej: paciente@correo.com).');
        setEstadoCita('error');
        return;
      }

      if (cedulaLimpia.length < 6 || cedulaLimpia.length > 15) {
        setMensajeErrorCita('El número de documento o teléfono debe contener entre 6 y 15 dígitos numéricos sin letras.');
        setEstadoCita('error');
        return;
      }

      payload.email = emailLimpio;
      payload.full_name = nombreLimpio;
      payload.cedula = cedulaLimpia;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(API + '/appointments', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const datosCita = await res.json();
        setEstadoCita('success');
        setCitaExitosa(datosCita);
        setHoraCita('');

        // Si se generó credencial para paciente guest, autenticarlo automáticamente
        if (datosCita.access_token && datosCita.user) {
          setToken(datosCita.access_token);
          setUsuario(datosCita.user);
          localStorage.setItem('token', datosCita.access_token);
          localStorage.setItem('usuario', JSON.stringify(datosCita.user));
        }

        // Reconsultar disponibilidad horaria de inmediato para actualizar franjas
        const authHeader = datosCita.access_token 
          ? { Authorization: `Bearer ${datosCita.access_token}` }
          : (token ? { Authorization: `Bearer ${token}` } : {});

        fetch(`${API}/available-slots?date=${fechaCita}`, { headers: authHeader })
          .then(r => r.json())
          .then(data => setDisponibilidadHoraria(data))
          .catch(() => {});
      } else {
        const errorJson = await res.json().catch(() => ({}));
        const mensajeLimpio = normalizarMensajeError(
          errorJson.detail || errorJson.message || 'Error al procesar la cita. Revisa el horario seleccionado.'
        );
        setMensajeErrorCita(mensajeLimpio);
        setEstadoCita('error');
      }
    } catch {
      setMensajeErrorCita('Error de conexión con el servidor. Por favor verifica que el backend esté activo.');
      setEstadoCita('error');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#e2e8f0] text-slate-900 selection:bg-sky-100 font-['Outfit']">
      <Encabezado
        sesionActiva={token !== null}
        usuario={usuario}
        alCerrarSesion={cerrarSesion}
        alAbrirLogin={() => setMostrarModalAuth(true)}
        vistaActual={vistaActual}
        alCambiarVista={setVistaActual}
      />

      <main className="flex-1">
        {vistaActual === 'inicio' && (
          <>
            {/* Banner Hero - Enfoque Clínico con Alto Contraste y Cero Fondo Quemado */}
            <section className="relative overflow-hidden bg-[#edf2f7] border-b border-slate-300/90 py-14 sm:py-20">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center">
                  <span className="inline-block rounded-full bg-sky-100 px-4 py-1.5 text-xs font-bold tracking-wider text-sky-800 uppercase mb-4 border border-sky-300">
                    Cuidado Dental Avanzado
                  </span>
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                    Diseñamos la sonrisa de <br />
                    <span className="text-sky-700 italic">tus sueños</span>
                  </h1>
                  <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-700 font-medium">
                    En Dental Blanc combinamos calidez humana con tecnología odontológica de punta para que sonrías con total
                    confianza. Tu salud bucal es nuestra prioridad.
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-x-6">
                    <button
                      onClick={() => {
                        const agendarEl = document.getElementById('agendar');
                        if (agendarEl) agendarEl.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="rounded-xl bg-sky-700 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-sky-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Agendar Consulta de Valoración
                    </button>
                  </div>

                  {/* Tarjetas de Acceso a Módulos Clínicos */}
                  <div className="mt-12 mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                    {/* Tarjeta 1: Admin */}
                    <div
                      onClick={() => {
                        if (usuario?.role === 'admin') setVistaActual('admin');
                        else iniciarSesionRapida('admin@dentalblanc.com', 'admin123');
                      }}
                      className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md hover:border-sky-500 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-sky-200">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
                          Recepción
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                        Panel Administrativo
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                        Control de turnos con KPIs, confirmación de citas, edición de servicios, blogs e información clínica.
                      </p>
                      <div className="mt-4 flex items-center text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform">
                        Entrar como Admin →
                      </div>
                    </div>

                    {/* Tarjeta 2: Odontólogo */}
                    <div
                      onClick={() => {
                        if (usuario?.role === 'dentist') setVistaActual('agenda');
                        else iniciarSesionRapida('dr.santiago@dentalblanc.com', 'dental123');
                      }}
                      className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md hover:border-cyan-500 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-cyan-200">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                            <circle cx="20" cy="10" r="2"/>
                          </svg>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300">
                          Especialistas
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-cyan-800 transition-colors">
                        Agenda Odontológica
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                        Vista de turnos clínicos asignados a cada doctor, historial de pacientes y expedición de comprobantes.
                      </p>
                      <div className="mt-4 flex items-center text-xs font-bold text-cyan-800 group-hover:translate-x-1 transition-transform">
                        Entrar como Doctor →
                      </div>
                    </div>

                    {/* Tarjeta 3: Paciente */}
                    <div
                      onClick={() => {
                        if (usuario?.role === 'patient') setVistaActual('mis-citas');
                        else iniciarSesionRapida('paciente@dentalblanc.com', 'paciente123');
                      }}
                      className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-200">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Pacientes
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        Mis Citas & Comprobantes
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                        Historial de citas, estado con badges, cancelación autónoma y descarga instantánea de comprobantes en PDF.
                      </p>
                      <div className="mt-4 flex items-center text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
                        Entrar como Paciente →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
              <TarjetasServicios cargando={cargando} servicios={servicios} />

              {/* Formulario de Agendamiento Directo sin Fricción */}
              <div id="agendar" className="mt-14 scroll-mt-24">
                <FormularioCita
                  servicios={servicios}
                  servicioElegido={servicioElegido}
                  fechaCita={fechaCita}
                  horaCita={horaCita}
                  nombrePaciente={nombrePacienteCita}
                  emailPaciente={emailPacienteCita}
                  cedulaPaciente={cedulaPacienteCita}
                  estado={estadoCita}
                  mensajeError={mensajeErrorCita}
                  citaExitosa={citaExitosa}
                  sesionActiva={token !== null}
                  usuario={usuario}
                  disponibilidadHoraria={disponibilidadHoraria}
                  onVerMisCitas={() => setVistaActual('mis-citas')}
                  alCambiarServicio={e => setServicioElegido(e.target.value)}
                  alCambiarFecha={e => setFechaCita(e.target.value)}
                  alCambiarHora={e => setHoraCita(e.target.value)}
                  alCambiarNombre={e => setNombrePacienteCita(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, ''))}
                  alCambiarEmail={e => setEmailPacienteCita(e.target.value)}
                  alCambiarCedula={e => setCedulaPacienteCita(e.target.value.replace(/\D/g, ''))}
                  alEnviar={alEnviarCita}
                />
              </div>
            </div>
          </>
        )}

        {vistaActual === 'servicios' && (
          <PaginaServicios
            cargando={cargando}
            servicios={servicios}
            token={token}
            alAbrirLogin={() => setMostrarModalAuth(true)}
            alAgendar={() => {
              setVistaActual('inicio');
              setTimeout(() => {
                document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        {vistaActual === 'nosotros' && <PaginaNosotros apiBaseUrl={API} />}

        {vistaActual === 'blog' && <PaginaBlog apiBaseUrl={API} alVerArticulo={verArticulo} />}

        {vistaActual === 'articulo' && (
          <PaginaArticulo id={articuloId} apiBaseUrl={API} alVolver={() => setVistaActual('blog')} />
        )}

        {/* Vista: Mis Citas (Portal del Paciente) o Mi Agenda Médica (Odontólogo) */}
        {(vistaActual === 'mis-citas' || vistaActual === 'agenda') && (
          <MisCitas
            token={token}
            usuario={usuario}
            esAgendaMedica={usuario?.role === 'dentist' || vistaActual === 'agenda'}
            apiBaseUrl={API}
            onIrAgendar={() => {
              setVistaActual('inicio');
              setTimeout(() => {
                const agendarEl = document.getElementById('agendar');
                if (agendarEl) agendarEl.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        {/* Vista: Panel Administrativo */}
        {vistaActual === 'admin' && (
          <PanelAdmin
            token={token}
            usuario={usuario}
            apiBaseUrl={API}
            onVolverInicio={() => setVistaActual('inicio')}
          />
        )}
      </main>

      {/* Footer Más Amigable y con Bordes Definidos */}
      <footer className="bg-white border-t border-slate-200/90 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="text-sky-600 font-bold text-lg mb-2">DENTAL BLANC</div>
          <p className="text-slate-500 text-sm mb-6">Compromiso profesional y excelencia médica con tu bienestar oral.</p>
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
            &copy; 2026 Dental Blanc • Clínica Odontológica Especializada
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
