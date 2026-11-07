import { useState, useEffect, useMemo, useCallback } from 'react';

// Formato de moneda para Colombia (COP)
function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio || 0);
}

// Formato de fecha legible
function formatearFecha(fechaStr) {
  if (!fechaStr) return 'Por definir';
  try {
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return fecha.toLocaleDateString('es-CO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return fechaStr;
  } catch {
    return fechaStr;
  }
}

// Formato de hora en 12h (AM/PM)
function formatearHora(horaStr) {
  if (!horaStr) return '';
  const partes = horaStr.split(':');
  if (partes.length >= 2) {
    const horas = Number(partes[0]);
    const minutos = partes[1];
    const ampm = horas >= 12 ? 'PM' : 'AM';
    const horas12 = horas % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
  }
  return horaStr;
}

// Badge de estado para la administración
function BadgeEstadoAdmin({ status }) {
  const configs = {
    pending: {
      label: 'Pendiente',
      clases: 'bg-amber-50 text-amber-700 border border-amber-200/70',
    },
    confirmed: {
      label: 'Confirmada',
      clases: 'bg-sky-50 text-sky-700 border border-sky-200/70',
    },
    completed: {
      label: 'Completada',
      clases: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
    },
    cancelled: {
      label: 'Cancelada',
      clases: 'bg-slate-100 text-slate-500 border border-slate-200',
    },
  };

  const actual = configs[status] || configs.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${actual.clases}`}>
      {actual.label}
    </span>
  );
}

// Tarjeta individual de KPI métrico
function TarjetaKpi({ titulo, valor, icono, colorBg, colorTexto }) {
  return (
    <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-md flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{titulo}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{valor}</p>
      </div>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorBg} ${colorTexto} border border-slate-100`}>
        {icono}
      </div>
    </div>
  );
}

export function PanelAdmin({ token, usuario, apiBaseUrl, onVolverInicio }) {
  // Pestaña activa: 'citas' | 'doctores' | 'servicios' | 'blogs' | 'nosotros'
  const [tabActiva, setTabActiva] = useState('citas');

  // Estado general de Citas
  const [citas, setCitas] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [idEnProceso, setIdEnProceso] = useState(null);
  const [asignandoId, setAsignandoId] = useState(null);
  const [descargandoPdfId, setDescargandoPdfId] = useState(null);

  // Estado para gestión del Cuadro Médico de Odontólogos
  const [modalDoctor, setModalDoctor] = useState(false);
  const [guardandoDoctor, setGuardandoDoctor] = useState(false);
  const [formDoctor, setFormDoctor] = useState({
    full_name: '',
    email: '',
    cedula: '',
    password: '',
    fecha_nacimiento: '',
  });

  // Estado de Servicios Odontológicos
  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [modalServicio, setModalServicio] = useState(null); // null | { modo: 'create'|'edit', datos: {...} }

  // Estado de Artículos de Blog
  const [blogs, setBlogs] = useState([]);
  const [cargandoBlogs, setCargandoBlogs] = useState(false);
  const [modalBlog, setModalBlog] = useState(null); // null | { modo: 'create'|'edit', datos: {...} }

  // Estado de Información de la Clínica (Sobre Nosotros)
  const [infoClinica, setInfoClinica] = useState({
    mision: '',
    vision: '',
    valores: '',
    telefono: '',
    direccion: '',
    email_contacto: '',
  });
  const [cargandoInfo, setCargandoInfo] = useState(false);
  const [guardandoInfo, setGuardandoInfo] = useState(false);

  // Cargar Citas y Odontólogos en vivo (evitando toda caché residual)
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [resCitas, resDentistas] = await Promise.all([
        fetch(`${apiBaseUrl}/appointments`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
        fetch(`${apiBaseUrl}/dentists`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      ]);

      if (!resCitas.ok) {
        throw new Error('No fue posible cargar las citas de la clínica.');
      }

      const datosCitas = await resCitas.json();
      const datosDentistas = resDentistas.ok ? await resDentistas.json() : [];

      setCitas(datosCitas);
      setOdontologos(datosDentistas);
    } catch (err) {
      setError(err.message || 'Error al conectar con la API.');
    } finally {
      setCargando(false);
    }
  }, [apiBaseUrl, token]);

  useEffect(() => {
    if (token && usuario?.role === 'admin' && (tabActiva === 'citas' || tabActiva === 'doctores')) {
      cargarDatos();
    } else if (!token) {
      setCargando(false);
    }
  }, [token, usuario, tabActiva, cargarDatos]);

  // Cargar Servicios cuando se selecciona la pestaña de servicios
  useEffect(() => {
    if (tabActiva === 'servicios' && token && usuario?.role === 'admin') {
      cargarServicios();
    }
  }, [tabActiva]);

  // Cargar Blogs cuando se selecciona la pestaña de blogs
  useEffect(() => {
    if (tabActiva === 'blogs' && token && usuario?.role === 'admin') {
      cargarBlogs();
    }
  }, [tabActiva]);

  // Cargar Información de la Clínica cuando se selecciona la pestaña nosotros
  useEffect(() => {
    if (tabActiva === 'nosotros' && token && usuario?.role === 'admin') {
      cargarInfoClinica();
    }
  }, [tabActiva]);

  async function cargarServicios() {
    setCargandoServicios(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const datos = await res.json();
        setServicios(datos);
      }
    } catch {
      setError('Error al cargar la lista de servicios.');
    } finally {
      setCargandoServicios(false);
    }
  }

  async function cargarBlogs() {
    setCargandoBlogs(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const datos = await res.json();
        setBlogs(datos);
      }
    } catch {
      setError('Error al cargar los artículos del blog.');
    } finally {
      setCargandoBlogs(false);
    }
  }

  async function cargarInfoClinica() {
    setCargandoInfo(true);
    try {
      const res = await fetch(`${apiBaseUrl}/clinic-info`);
      if (res.ok) {
        const datos = await res.json();
        setInfoClinica(datos);
      }
    } catch {
      setError('Error al consultar información institucional.');
    } finally {
      setCargandoInfo(false);
    }
  }

  // Asignar odontólogo tratante
  async function asignarOdontologo(citaId, dentistId) {
    if (!dentistId) return;
    setAsignandoId(citaId);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/appointments/${citaId}/assign-dentist`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dentist_id: Number(dentistId) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al asignar odontólogo tratante.');
      }

      const citaActualizada = await res.json();
      setCitas(prev =>
        prev.map(c => (c.id === citaActualizada.id ? citaActualizada : c))
      );

      setMensajeExito(
        `Odontólogo ${citaActualizada.dentist_name || ''} asignado al Turno #${citaActualizada.id}.`
      );
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setAsignandoId(null);
    }
  }

  // Registrar un nuevo odontólogo especialista en la base de datos
  async function guardarDoctor(e) {
    e.preventDefault();
    setGuardandoDoctor(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/dentists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formDoctor.full_name.trim(),
          email: formDoctor.email.trim().toLowerCase(),
          cedula: formDoctor.cedula ? formDoctor.cedula.trim() : null,
          password: formDoctor.password ? formDoctor.password.trim() : 'Dental123!',
          fecha_nacimiento: formDoctor.fecha_nacimiento || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al registrar el odontólogo.');
      }

      const nuevoDoc = await res.json();
      setMensajeExito(`Odontólogo ${nuevoDoc.full_name} registrado exitosamente en el cuadro médico.`);
      setModalDoctor(false);
      setFormDoctor({ full_name: '', email: '', cedula: '', password: '', fecha_nacimiento: '' });
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoDoctor(false);
    }
  }

  // Desactivar odontólogo del cuadro médico
  async function desactivarDoctor(doctor) {
    if (!window.confirm(`¿Estás seguro de desactivar al especialista ${doctor.full_name}?`)) return;
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/dentists/${doctor.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al desactivar odontólogo.');
      }
      setMensajeExito(`Especialista ${doctor.full_name} desactivado correctamente.`);
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err) {
      setError(err.message);
    }
  }

  // Descargar comprobante oficial en formato PDF
  async function descargarPdf(citaId) {
    setDescargandoPdfId(citaId);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/appointments/${citaId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let detalle = 'Error al descargar el comprobante.';
        try {
          const errData = await res.json();
          if (errData.detail) detalle = errData.detail;
        } catch {
          // Mantener mensaje por defecto
        }
        throw new Error(detalle);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `comprobante_cita_${citaId}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'No fue posible generar el comprobante PDF.');
    } finally {
      setDescargandoPdfId(null);
    }
  }

  // Actualizar estado de una cita
  async function actualizarEstado(citaId, nuevoEstado) {
    setIdEnProceso(citaId);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/appointments/${citaId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nuevoEstado }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al actualizar el estado de la cita.');
      }

      const citaActualizada = await res.json();
      setCitas(prev =>
        prev.map(c => (c.id === citaActualizada.id ? citaActualizada : c))
      );

      const estadosEtiquetas = {
        confirmed: 'confirmada',
        completed: 'completada',
        cancelled: 'cancelada',
        pending: 'pendiente',
      };

      setMensajeExito(
        `Cita #${citaActualizada.id} (${citaActualizada.client_name}) marcada como ${estadosEtiquetas[nuevoEstado] || nuevoEstado}.`
      );
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIdEnProceso(null);
    }
  }

  // Guardar (Crear o Editar) Servicio Odontológico
  async function guardarServicio(e) {
    e.preventDefault();
    if (!modalServicio) return;
    const { modo, datos } = modalServicio;
    setError(null);
    try {
      const url = modo === 'create' ? `${apiBaseUrl}/services` : `${apiBaseUrl}/services/${datos.id}`;
      const method = modo === 'create' ? 'POST' : 'PUT';
      const body = {
        name: datos.name,
        description: datos.description,
        price: parseFloat(datos.price),
        is_active: datos.is_active !== undefined ? datos.is_active : true,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Error al guardar el servicio.');
      }

      setMensajeExito(`Servicio "${datos.name}" guardado correctamente.`);
      setTimeout(() => setMensajeExito(null), 4000);
      setModalServicio(null);
      cargarServicios();
    } catch (err) {
      setError(err.message);
    }
  }

  // Eliminar o desactivar servicio
  async function alternarEstadoServicio(s) {
    try {
      const res = await fetch(`${apiBaseUrl}/services/${s.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo desactivar el servicio.');
      setMensajeExito(`Servicio #${s.id} desactivado correctamente.`);
      setTimeout(() => setMensajeExito(null), 4000);
      cargarServicios();
    } catch (err) {
      setError(err.message);
    }
  }

  // Guardar (Crear o Editar) Artículo de Blog
  async function guardarBlog(e) {
    e.preventDefault();
    if (!modalBlog) return;
    const { modo, datos } = modalBlog;
    setError(null);
    try {
      const url = modo === 'create' ? `${apiBaseUrl}/blogs` : `${apiBaseUrl}/blogs/${datos.id}`;
      const method = modo === 'create' ? 'POST' : 'PUT';
      const body = {
        title: datos.title,
        excerpt: datos.excerpt,
        content: datos.content,
        author: datos.author || 'Equipo Dental Blanc',
        is_active: datos.is_active !== undefined ? datos.is_active : true,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Error al guardar el artículo.');
      }

      setMensajeExito(`Artículo "${datos.title}" guardado con éxito.`);
      setTimeout(() => setMensajeExito(null), 4000);
      setModalBlog(null);
      cargarBlogs();
    } catch (err) {
      setError(err.message);
    }
  }

  // Desactivar artículo de blog
  async function alternarEstadoBlog(b) {
    try {
      const res = await fetch(`${apiBaseUrl}/blogs/${b.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo desactivar el artículo.');
      setMensajeExito(`Artículo #${b.id} desactivado correctamente.`);
      setTimeout(() => setMensajeExito(null), 4000);
      cargarBlogs();
    } catch (err) {
      setError(err.message);
    }
  }

  // Guardar información institucional "Sobre Nosotros"
  async function guardarInfoClinica(e) {
    e.preventDefault();
    setGuardandoInfo(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/clinic-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(infoClinica),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Error al actualizar información de la clínica.');
      }

      const actualizada = await res.json();
      setInfoClinica(actualizada);
      setMensajeExito('Información institucional de Dental Blanc actualizada con éxito.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoInfo(false);
    }
  }

  // Cálculo de KPIs de citas
  const kpis = useMemo(() => {
    const lista = Array.isArray(citas) ? citas : [];
    const total = lista.length;
    const pendientes = lista.filter(c => c.status === 'pending').length;
    const confirmadas = lista.filter(c => c.status === 'confirmed').length;
    const completadas = lista.filter(c => c.status === 'completed').length;
    const canceladas = lista.filter(c => c.status === 'cancelled').length;
    return { total, pendientes, confirmadas, completadas, canceladas };
  }, [citas]);

  // Filtrado y búsqueda reactiva de citas
  const citasFiltradas = useMemo(() => {
    const lista = Array.isArray(citas) ? citas : [];
    return lista.filter(c => {
      const coincideEstado = filtroEstado === 'todas' || c.status === filtroEstado;
      const termino = busqueda.trim().toLowerCase();
      if (!termino) return coincideEstado;

      const coincideTexto =
        (c.client_name && c.client_name.toLowerCase().includes(termino)) ||
        (c.client_email && c.client_email.toLowerCase().includes(termino)) ||
        (c.service_name && c.service_name.toLowerCase().includes(termino)) ||
        String(c.id).includes(termino);

      return coincideEstado && coincideTexto;
    });
  }, [citas, filtroEstado, busqueda]);

  // Guardia de seguridad: Usuario no es administrador
  if (usuario?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Acceso Restringido</h3>
        <p className="text-sm text-slate-500 mt-2">
          Esta vista es de uso exclusivo para el personal administrativo y recepción de Dental Blanc.
        </p>
        <button
          type="button"
          onClick={onVolverInicio}
          className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 animate-in fade-in duration-300">
      
      {/* Cabecera del Panel con selector de módulos */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Administración Central
            </span>
            <span className="text-xs text-slate-400 font-medium">• Control Total del Sistema</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Panel de Gestión Odontológica
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Administra citas clínicas, asignación de especialistas, catálogo de servicios, blog y datos institucionales.
          </p>
        </div>

        {/* Botones de acción en cabecera */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              if (tabActiva === 'citas' || tabActiva === 'doctores') cargarDatos();
              else if (tabActiva === 'servicios') cargarServicios();
              else if (tabActiva === 'blogs') cargarBlogs();
              else if (tabActiva === 'nosotros') cargarInfoClinica();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:text-sky-600 hover:border-sky-400 transition-colors shadow-xs cursor-pointer"
            title="Recargar datos directamente de la base de datos sin caché"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>

          <button
            type="button"
            onClick={onVolverInicio}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:text-sky-600 hover:border-sky-400 transition-colors shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Vista Pública
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación de Administración */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-4 mb-8 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTabActiva('citas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabActiva === 'citas'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"></line>
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"></line>
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"></line>
          </svg>
          Citas y Turnos ({citas.length})
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('doctores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabActiva === 'doctores'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Cuadro Médico ({odontologos.length})
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('servicios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabActiva === 'servicios'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Catálogo de Servicios
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('blogs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabActiva === 'blogs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Artículos del Blog
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('nosotros')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabActiva === 'nosotros'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Sobre Nosotros (Institucional)
        </button>
      </div>

      {/* Alertas informativas */}
      {mensajeExito && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 font-bold cursor-pointer">&times;</button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"></line>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"></line>
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700 font-bold cursor-pointer">&times;</button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: GESTIÓN DE CITAS Y TURNOS
         ========================================================================= */}
      {tabActiva === 'citas' && (
        <div>
          {/* Fila de Tarjetas KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <TarjetaKpi
              titulo="Total Citas"
              valor={kpis.total}
              colorBg="bg-slate-100"
              colorTexto="text-slate-700"
              icono={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"></line>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"></line>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"></line>
                </svg>
              }
            />
            <TarjetaKpi
              titulo="Por Confirmar"
              valor={kpis.pendientes}
              colorBg="bg-amber-50"
              colorTexto="text-amber-600"
              icono={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                  <polyline points="12 6 12 12 16 14" strokeWidth="2"></polyline>
                </svg>
              }
            />
            <TarjetaKpi
              titulo="Confirmadas"
              valor={kpis.confirmadas}
              colorBg="bg-sky-50"
              colorTexto="text-sky-600"
              icono={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              }
            />
            <TarjetaKpi
              titulo="Completadas"
              valor={kpis.completadas}
              colorBg="bg-emerald-50"
              colorTexto="text-emerald-600"
              icono={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
            />
            <TarjetaKpi
              titulo="Canceladas"
              valor={kpis.canceladas}
              colorBg="bg-slate-100"
              colorTexto="text-slate-500"
              icono={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                  <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2"></line>
                  <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2"></line>
                </svg>
              }
            />
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/50 p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setFiltroEstado('todas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroEstado === 'todas'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todas ({kpis.total})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroEstado === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pendientes ({kpis.pendientes})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('confirmed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroEstado === 'confirmed'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Confirmadas ({kpis.confirmadas})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroEstado === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Completadas ({kpis.completadas})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('cancelled')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroEstado === 'cancelled'
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Canceladas ({kpis.canceladas})
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"></line>
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar paciente o servicio..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Tabla de Citas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/50 overflow-hidden">
            {cargando ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Cargando registros de citas...
              </div>
            ) : citasFiltradas.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-semibold text-slate-700">No se encontraron citas</p>
                <p className="text-xs text-slate-400 mt-1">
                  Prueba cambiando los filtros de estado o ajustando el término de búsqueda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4"># Turno</th>
                      <th className="py-3.5 px-4">Paciente</th>
                      <th className="py-3.5 px-4">Servicio Clínico</th>
                      <th className="py-3.5 px-4">Fecha y Hora</th>
                      <th className="py-3.5 px-4">Odontólogo Asignado</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {citasFiltradas.map(cita => {
                      const enProceso = idEnProceso === cita.id;

                      return (
                        <tr key={cita.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">
                            #{cita.id}
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-900">{cita.client_name || 'Paciente anónimo'}</p>
                            <p className="text-[11px] text-slate-400">{cita.client_email}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-slate-800">{cita.service_name}</p>
                            <p className="text-[11px] font-bold text-slate-500">{formatearPrecio(cita.service_price)}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-slate-800 capitalize">{formatearFecha(cita.date)}</p>
                            <p className="text-[11px] text-sky-600 font-bold">{formatearHora(cita.time)}</p>
                          </td>
                          <td className="py-4 px-4 min-w-[210px]">
                            <select
                              value={cita.dentist_id || ''}
                              onChange={e => asignarOdontologo(cita.id, e.target.value)}
                              disabled={asignandoId === cita.id}
                              className={`w-full py-1.5 px-2.5 text-xs rounded-xl font-medium border transition-all cursor-pointer ${
                                cita.dentist_id
                                  ? 'bg-sky-50 border-sky-200 text-sky-900 font-semibold'
                                  : 'bg-amber-50 border-amber-200 text-amber-800 italic'
                              }`}
                            >
                              <option value="" disabled>-- Sin Asignar --</option>
                              {odontologos.map(od => (
                                <option key={od.id} value={od.id} className="text-slate-800 not-italic font-medium">
                                  Dr(a). {od.full_name}
                                </option>
                              ))}
                            </select>
                            {asignandoId === cita.id && (
                              <span className="text-[10px] text-sky-600 block mt-1 animate-pulse">Guardando...</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <BadgeEstadoAdmin status={cita.status} />
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Descargar comprobante PDF */}
                              <button
                                type="button"
                                onClick={() => descargarPdf(cita.id)}
                                disabled={descargandoPdfId === cita.id}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors border border-slate-200 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                title="Descargar Comprobante Oficial en PDF"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{descargandoPdfId === cita.id ? 'PDF...' : 'PDF'}</span>
                              </button>

                              {cita.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => actualizarEstado(cita.id, 'confirmed')}
                                  disabled={enProceso}
                                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[11px] transition-colors border border-sky-200/60 disabled:opacity-50 cursor-pointer"
                                >
                                  Confirmar
                                </button>
                              )}

                              {cita.status === 'confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => actualizarEstado(cita.id, 'completed')}
                                  disabled={enProceso}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors border border-emerald-200/60 disabled:opacity-50 cursor-pointer"
                                >
                                  Completar
                                </button>
                              )}

                              {(cita.status === 'pending' || cita.status === 'confirmed') && (
                                <button
                                  type="button"
                                  onClick={() => actualizarEstado(cita.id, 'cancelled')}
                                  disabled={enProceso}
                                  className="px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 font-bold text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              )}

                              {cita.status === 'cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => actualizarEstado(cita.id, 'pending')}
                                  disabled={enProceso}
                                  className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 font-medium text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  Reactivar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: CUADRO MÉDICO DE ODONTÓLOGOS (ADMINISTRACIÓN Y ALTA DE ESPECIALISTAS)
         ========================================================================= */}
      {tabActiva === 'doctores' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Cuadro Médico de Especialistas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Alta y administración de odontólogos autorizados para atender consultas en Dental Blanc.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalDoctor(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Registrar Nuevo Odontólogo
            </button>
          </div>

          {/* Listado de odontólogos */}
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden">
            {odontologos.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-medium">
                No hay odontólogos registrados en el sistema.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Especialista</th>
                      <th className="py-3.5 px-4">Correo Institucional</th>
                      <th className="py-3.5 px-4">Cédula Profesional</th>
                      <th className="py-3.5 px-4 text-center">Citas Asignadas</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {odontologos.map((doc) => {
                      const numCitas = citas.filter((c) => c.dentist_id === doc.id).length;
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">#{doc.id}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-900">{doc.full_name}</p>
                            <span className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider">
                              Odontología General
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-700">{doc.email}</td>
                          <td className="py-4 px-4 font-mono text-slate-600">{doc.cedula || 'No registrada'}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                              {numCitas} citas
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Activo
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => desactivarDoctor(doc)}
                              className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Desactivar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 2: GESTIÓN DE SERVICIOS ODONTOLÓGICOS (CRUD)
         ========================================================================= */}
      {tabActiva === 'servicios' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Catálogo de Servicios y Tarifas</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Crea, modifica precios, edita descripciones y activa/desactiva tratamientos ofrecidos a los pacientes.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setModalServicio({
                  modo: 'create',
                  datos: { name: '', description: '', price: '', is_active: true },
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Crear Nuevo Servicio
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/50 overflow-hidden">
            {cargandoServicios ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Cargando servicios clínicos...
              </div>
            ) : servicios.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No hay servicios registrados en la base de datos.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4"># ID</th>
                      <th className="py-3.5 px-4">Nombre del Tratamiento</th>
                      <th className="py-3.5 px-4">Descripción</th>
                      <th className="py-3.5 px-4">Tarifa (COP)</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {servicios.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">#{s.id}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{s.name}</td>
                        <td className="py-4 px-4 text-slate-600 max-w-md">{s.description}</td>
                        <td className="py-4 px-4 font-black text-sky-700">{formatearPrecio(s.price)}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              s.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {s.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setModalServicio({
                                  modo: 'edit',
                                  datos: { ...s },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[11px] border border-sky-200 cursor-pointer"
                            >
                              Editar
                            </button>
                            {s.is_active && (
                              <button
                                type="button"
                                onClick={() => alternarEstadoServicio(s)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[11px] border border-red-200 cursor-pointer"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Servicio */}
      {modalServicio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {modalServicio.modo === 'create' ? 'Crear Nuevo Servicio Clínico' : `Editar Servicio #${modalServicio.datos.id}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalServicio(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={guardarServicio} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Nombre del Tratamiento
                </label>
                <input
                  type="text"
                  required
                  value={modalServicio.datos.name}
                  onChange={e =>
                    setModalServicio({
                      ...modalServicio,
                      datos: { ...modalServicio.datos, name: e.target.value },
                    })
                  }
                  placeholder="Ej: Ortodoncia con Brackets Autoligados"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Descripción Clínica
                </label>
                <textarea
                  rows={3}
                  required
                  value={modalServicio.datos.description}
                  onChange={e =>
                    setModalServicio({
                      ...modalServicio,
                      datos: { ...modalServicio.datos, description: e.target.value },
                    })
                  }
                  placeholder="Describe los beneficios y detalles del procedimiento..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Tarifa en Pesos Colombianos (COP)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={modalServicio.datos.price}
                  onChange={e =>
                    setModalServicio({
                      ...modalServicio,
                      datos: { ...modalServicio.datos, price: e.target.value },
                    })
                  }
                  placeholder="Ej: 150000"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="servicioActivo"
                  checked={modalServicio.datos.is_active}
                  onChange={e =>
                    setModalServicio({
                      ...modalServicio,
                      datos: { ...modalServicio.datos, is_active: e.target.checked },
                    })
                  }
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="servicioActivo" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Tratamiento activo y visible para los pacientes
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalServicio(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: GESTIÓN DE ARTÍCULOS DE BLOG (CRUD)
         ========================================================================= */}
      {tabActiva === 'blogs' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Artículos y Consejos de Salud Oral</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Publica contenido educativo, consejos de higiene y novedades para mantener informados a tus pacientes.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setModalBlog({
                  modo: 'create',
                  datos: {
                    title: '',
                    excerpt: '',
                    content: '',
                    author: `Dr(a). ${usuario?.full_name || 'Especialista'}`,
                    is_active: true,
                  },
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Crear Nuevo Artículo
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/50 overflow-hidden">
            {cargandoBlogs ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Cargando artículos...
              </div>
            ) : blogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No hay artículos de blog creados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4"># ID</th>
                      <th className="py-3.5 px-4">Título del Artículo</th>
                      <th className="py-3.5 px-4">Autor</th>
                      <th className="py-3.5 px-4">Fecha</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {blogs.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">#{b.id}</td>
                        <td className="py-4 px-4 font-bold text-slate-900 max-w-xs">{b.title}</td>
                        <td className="py-4 px-4 text-slate-600">{b.author}</td>
                        <td className="py-4 px-4 text-slate-500">{b.date}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              b.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {b.is_active ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setModalBlog({
                                  modo: 'edit',
                                  datos: { ...b },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[11px] border border-sky-200 cursor-pointer"
                            >
                              Editar
                            </button>
                            {b.is_active && (
                              <button
                                type="button"
                                onClick={() => alternarEstadoBlog(b)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[11px] border border-red-200 cursor-pointer"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Artículo de Blog */}
      {modalBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {modalBlog.modo === 'create' ? 'Publicar Nuevo Artículo' : `Editar Artículo #${modalBlog.datos.id}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalBlog(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={guardarBlog} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Título del Artículo
                </label>
                <input
                  type="text"
                  required
                  value={modalBlog.datos.title}
                  onChange={e =>
                    setModalBlog({
                      ...modalBlog,
                      datos: { ...modalBlog.datos, title: e.target.value },
                    })
                  }
                  placeholder="Ej: 5 Claves para Cuidar tu Sonrisa"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  required
                  value={modalBlog.datos.author}
                  onChange={e =>
                    setModalBlog({
                      ...modalBlog,
                      datos: { ...modalBlog.datos, author: e.target.value },
                    })
                  }
                  placeholder="Ej: Dr. Santiago Sotelo"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Resumen Corto (Excerpt)
                </label>
                <textarea
                  rows={2}
                  required
                  value={modalBlog.datos.excerpt}
                  onChange={e =>
                    setModalBlog({
                      ...modalBlog,
                      datos: { ...modalBlog.datos, excerpt: e.target.value },
                    })
                  }
                  placeholder="Breve introducción que se muestra en la tarjeta del blog..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Contenido Completo
                </label>
                <textarea
                  rows={7}
                  required
                  value={modalBlog.datos.content}
                  onChange={e =>
                    setModalBlog({
                      ...modalBlog,
                      datos: { ...modalBlog.datos, content: e.target.value },
                    })
                  }
                  placeholder="Redacta los párrafos explicativos del artículo dental..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="blogActivo"
                  checked={modalBlog.datos.is_active}
                  onChange={e =>
                    setModalBlog({
                      ...modalBlog,
                      datos: { ...modalBlog.datos, is_active: e.target.checked },
                    })
                  }
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="blogActivo" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Artículo publicado y visible para la comunidad
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalBlog(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: INFORMACIÓN DE LA CLÍNICA (SOBRE NOSOTROS)
         ========================================================================= */}
      {tabActiva === 'nosotros' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/50 p-6 sm:p-10">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">Configuración Institucional de la Clínica</h3>
            <p className="text-xs text-slate-500 mt-1">
              Edita la misión, visión, valores corporativos y canales de atención de Dental Blanc que ven los usuarios.
            </p>
          </div>

          {cargandoInfo ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              Consultando información institucional...
            </div>
          ) : (
            <form onSubmit={guardarInfoClinica} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Misión Institucional
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={infoClinica.mision}
                    onChange={e => setInfoClinica({ ...infoClinica, mision: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Visión Estratégica
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={infoClinica.vision}
                    onChange={e => setInfoClinica({ ...infoClinica, vision: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Valores Corporativos
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={infoClinica.valores}
                    onChange={e => setInfoClinica({ ...infoClinica, valores: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Teléfono / PBX de Atención
                  </label>
                  <input
                    type="text"
                    required
                    value={infoClinica.telefono}
                    onChange={e => setInfoClinica({ ...infoClinica, telefono: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Dirección de la Sede
                  </label>
                  <input
                    type="text"
                    required
                    value={infoClinica.direccion}
                    onChange={e => setInfoClinica({ ...infoClinica, direccion: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Correo Electrónico de Contacto
                  </label>
                  <input
                    type="email"
                    required
                    value={infoClinica.email_contacto}
                    onChange={e => setInfoClinica({ ...infoClinica, email_contacto: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={guardandoInfo}
                  className="px-6 py-3 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {guardandoInfo ? 'Guardando Cambios...' : 'Guardar Información Institucional'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Modal: Registrar Nuevo Odontólogo Especialista */}
      {modalDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-slate-300 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Nuevo Odontólogo Especialista</h3>
                  <p className="text-xs text-slate-500">Registra un nuevo especialista médico en el sistema</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDoctor(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={guardarDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nombre Completo del Especialista
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Dr. Camilo Torres"
                  value={formDoctor.full_name}
                  onChange={(e) => setFormDoctor({ ...formDoctor, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="camilo@dentalblanc.com"
                    value={formDoctor.email}
                    onChange={(e) => setFormDoctor({ ...formDoctor, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Cédula / Registro Médico
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 1040506070"
                    value={formDoctor.cedula}
                    onChange={(e) => setFormDoctor({ ...formDoctor, cedula: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Contraseña Inicial
                  </label>
                  <input
                    type="password"
                    placeholder="Dental123! (por defecto)"
                    value={formDoctor.password}
                    onChange={(e) => setFormDoctor({ ...formDoctor, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formDoctor.fecha_nacimiento}
                    onChange={(e) => setFormDoctor({ ...formDoctor, fecha_nacimiento: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalDoctor(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoDoctor}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {guardandoDoctor ? 'Guardando...' : 'Guardar Odontólogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
