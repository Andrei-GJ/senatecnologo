import { useState, useEffect, useMemo } from 'react';

// Formato de moneda para Colombia (COP)
function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio || 0);
}

// Formato de fecha en español
function formatearFecha(fechaStr) {
  if (!fechaStr) return 'Fecha por definir';
  try {
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return fecha.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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

// Componente Badge de Estado con microbordes y contraste semántico
function BadgeEstado({ status }) {
  const configs = {
    pending: {
      label: 'Pendiente',
      clases: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      icono: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
          <polyline points="12 6 12 12 16 14" strokeWidth="2"></polyline>
        </svg>
      ),
    },
    confirmed: {
      label: 'Confirmada',
      clases: 'bg-sky-50 text-sky-700 border border-sky-200/60',
      icono: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
        </svg>
      ),
    },
    completed: {
      label: 'Completada',
      clases: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      icono: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
    cancelled: {
      label: 'Cancelada',
      clases: 'bg-slate-100 text-slate-500 border border-slate-200',
      icono: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
          <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2"></line>
          <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2"></line>
        </svg>
      ),
    },
  };

  const actual = configs[status] || configs.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${actual.clases}`}>
      {actual.icono}
      {actual.label}
    </span>
  );
}

// Modal de confirmación para cancelar cita
function ModalConfirmacion({ cita, onConfirmar, onCerrar, procesando }) {
  if (!cita) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"></line>
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"></line>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 text-center">¿Deseas cancelar esta cita?</h3>
        <p className="mt-2 text-sm text-slate-500 text-center">
          Estás por cancelar tu cita de <strong className="text-slate-800">{cita.service_name}</strong> programada para el{' '}
          <span className="font-semibold text-slate-700">{formatearFecha(cita.date)}</span> a las{' '}
          <span className="font-semibold text-slate-700">{formatearHora(cita.time)}</span>.
        </p>
        <p className="mt-2 text-xs text-slate-400 text-center">
          El turno quedará liberado para otros pacientes que lo necesiten.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Mantener Cita
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando ? 'Cancelando...' : 'Sí, Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Tarjeta individual de cita
function TarjetaCita({
  cita,
  onSolicitarCancelacion,
  onDescargarPdf,
  descargandoPdf,
  esAgendaMedica,
}) {
  const puedeCancelar = (cita.status === 'pending' || cita.status === 'confirmed') && !esAgendaMedica;

  return (
    <div className="bg-white shadow-md border-2 border-slate-300 rounded-2xl p-6 transition-all hover:shadow-lg hover:border-sky-500 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold text-sky-700 tracking-wider uppercase">
              Turno #{cita.id}
            </span>
            <h4 className="text-lg font-bold text-slate-900 leading-snug mt-0.5">
              {cita.service_name}
            </h4>
          </div>
          <BadgeEstado status={cita.status} />
        </div>

        {/* Detalles de fecha, hora y odontólogo tratante */}
        <div className="bg-slate-100/90 rounded-xl p-3.5 space-y-2.5 border border-slate-300">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="capitalize">{formatearFecha(cita.date)}</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
              <polyline points="12 6 12 12 16 14" strokeWidth="2"></polyline>
            </svg>
            <span>{formatearHora(cita.time)}</span>
          </div>

          {/* Odontólogo tratante (para vista de pacientes) */}
          {!esAgendaMedica && (
            <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium pt-1 border-t border-slate-200/60">
              <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {cita.dentist_name ? (
                <span>
                  Odontólogo: <strong className="text-slate-900 font-semibold">{cita.dentist_name.startsWith('Dr') ? cita.dentist_name : `Dr. ${cita.dentist_name}`}</strong>
                </span>
              ) : (
                <span className="text-slate-500">
                  Odontólogo: <span className="italic text-slate-400">Por asignar</span>
                </span>
              )}
            </div>
          )}

          {/* Información del paciente (si es vista de agenda del odontólogo) */}
          {esAgendaMedica && (
            <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium pt-1 border-t border-slate-200/60">
              <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>
                Paciente: <strong className="text-slate-900 font-semibold">{cita.client_name || 'Paciente'}</strong>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
            <span className="text-slate-500">Valor Estimado:</span>
            <span className="font-bold text-slate-900">{formatearPrecio(cita.service_price)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-[11px] text-slate-400">
          Agendada el {cita.created_at ? cita.created_at.split('T')[0] : 'recientemente'}
        </span>

        <div className="flex items-center gap-2">
          {/* Botón Descargar Comprobante PDF */}
          <button
            type="button"
            onClick={() => onDescargarPdf(cita.id)}
            disabled={descargandoPdf}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100/90 py-1.5 px-3 rounded-lg transition-colors border border-sky-200/60 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            title="Descargar Comprobante Oficial en PDF"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{descargandoPdf ? 'Descargando...' : 'Comprobante (PDF)'}</span>
          </button>

          {puedeCancelar && (
            <button
              type="button"
              onClick={() => onSolicitarCancelacion(cita)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 px-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Cancelar Cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Vista principal de Mis Citas para el paciente y Agenda Médica para el Odontólogo
export function MisCitas({
  token,
  usuario,
  esAgendaMedica = false,
  apiBaseUrl,
  onIrAgendar,
}) {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [citaACancelar, setCitaACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [descargandoPdfId, setDescargandoPdfId] = useState(null);

  // Descargar comprobante oficial en formato PDF
  async function descargarComprobante(citaId) {
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
          // Mantener mensaje genérico
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
      setError(err.message || 'No fue posible descargar el comprobante de cita.');
    } finally {
      setDescargandoPdfId(null);
    }
  }

  // Cargar citas al montar
  useEffect(() => {
    let cancelado = false;

    async function cargarCitas() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${apiBaseUrl}/appointments`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('No fue posible cargar tus citas odontológicas.');
        }

        const datos = await res.json();
        if (!cancelado) {
          setCitas(datos);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || 'Error de conexión con el servidor.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    if (token) {
      cargarCitas();
    } else {
      setCargando(false);
    }

    return () => {
      cancelado = true;
    };
  }, [token, apiBaseUrl]);

  // Manejar cancelación de cita vía PATCH /api/appointments/{id}/cancel
  async function confirmarCancelacion() {
    if (!citaACancelar) return;
    setCancelando(true);
    try {
      const res = await fetch(`${apiBaseUrl}/appointments/${citaACancelar.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'No se pudo cancelar la cita.');
      }

      const citaActualizada = await res.json();
      setCitas(prevCitas =>
        prevCitas.map(c => (c.id === citaActualizada.id ? citaActualizada : c))
      );

      setCitaACancelar(null);
      setMensajeExito(`Tu cita para ${citaActualizada.service_name} fue cancelada exitosamente.`);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelando(false);
    }
  }

  // Filtrado de citas
  const citasFiltradas = useMemo(() => {
    const lista = Array.isArray(citas) ? citas : [];
    if (filtroEstado === 'todas') return lista;
    return lista.filter(c => c.status === filtroEstado);
  }, [citas, filtroEstado]);

  // Conteos para tabs
  const conteoPendientes = useMemo(() => (Array.isArray(citas) ? citas.filter(c => c.status === 'pending').length : 0), [citas]);
  const conteoConfirmadas = useMemo(() => (Array.isArray(citas) ? citas.filter(c => c.status === 'confirmed').length : 0), [citas]);

  // Estado de carga inicial
  if (cargando) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-72 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-white rounded-2xl border border-slate-100 p-6 animate-pulse space-y-4">
              <div className="h-4 w-24 bg-slate-100 rounded"></div>
              <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-24 bg-slate-50 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className={`text-xs font-bold uppercase tracking-widest ${esAgendaMedica ? 'text-teal-600' : 'text-sky-600'}`}>
            {esAgendaMedica ? 'Agenda Médica Profesional' : 'Portal del Paciente'}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {esAgendaMedica ? 'Mi Agenda de Consultas' : 'Mis Citas Odontológicas'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {esAgendaMedica
              ? 'Supervisa tus pacientes asignados, horarios de atención y emite comprobantes clínicos.'
              : 'Consulta el historial, estado y detalles de tus turnos clínicos programados.'}
          </p>
        </div>

        {!esAgendaMedica && (
          <button
            type="button"
            onClick={onIrAgendar}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-100 hover:bg-sky-600 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" strokeLinecap="round"></line>
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" strokeLinecap="round"></line>
            </svg>
            Agendar Nueva Cita
          </button>
        )}
      </div>

      {/* Banner de mensaje de éxito */}
      {mensajeExito && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200/70 p-4 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>{mensajeExito}</span>
          </div>
          <button
            onClick={() => setMensajeExito(null)}
            className="text-emerald-600 hover:text-emerald-900 text-sm font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Banner de error */}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200/70 p-4 text-red-700 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"></line>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"></line>
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 text-sm font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Filtros rápidos por estado */}
      {citas.length > 0 && (
        <div className="flex items-center gap-2 pb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFiltroEstado('todas')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filtroEstado === 'todas'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Todas ({citas.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('pending')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filtroEstado === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Pendientes ({conteoPendientes})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('confirmed')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filtroEstado === 'confirmed'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Confirmadas ({conteoConfirmadas})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('completed')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filtroEstado === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Completadas
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('cancelled')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filtroEstado === 'cancelled'
                ? 'bg-slate-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Canceladas
          </button>
        </div>
      )}

      {/* Estado vacío si no hay citas registradas */}
      {citas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100/90 p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className={`h-16 w-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border ${
            esAgendaMedica ? 'bg-teal-50 text-teal-600 border-teal-100/80' : 'bg-sky-50 text-sky-500 border-sky-100/80'
          }`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {esAgendaMedica ? 'No tienes citas asignadas en tu agenda' : 'No tienes citas agendadas'}
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            {esAgendaMedica
              ? 'Cuando la administración te asigne pacientes o consultas clínicas, aparecerán detalladas aquí.'
              : 'Da el primer paso hacia una salud oral impecable. Agenda tu turno con nuestros especialistas en segundos.'}
          </p>
          {!esAgendaMedica && (
            <button
              type="button"
              onClick={onIrAgendar}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Agendar Valoración Gratuita
            </button>
          )}
        </div>
      ) : citasFiltradas.length === 0 ? (
        /* Estado vacío del filtro seleccionado */
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
          No tienes citas en estado <strong className="text-slate-700 capitalize">{filtroEstado}</strong>.
        </div>
      ) : (
        /* Cuadrícula responsiva de citas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citasFiltradas.map(cita => (
            <TarjetaCita
              key={cita.id}
              cita={cita}
              onSolicitarCancelacion={c => setCitaACancelar(c)}
              onDescargarPdf={descargarComprobante}
              descargandoPdf={descargandoPdfId === cita.id}
              esAgendaMedica={esAgendaMedica}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      <ModalConfirmacion
        cita={citaACancelar}
        onCerrar={() => setCitaACancelar(null)}
        onConfirmar={confirmarCancelacion}
        procesando={cancelando}
      />
    </div>
  );
}
