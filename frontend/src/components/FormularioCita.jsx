// FormularioCita.jsx - Agendamiento Clínico Directo sin Fricción ni Bloqueos

// Horarios hábiles y oficiales de atención en clínica Dental Blanc (07:00 a 19:00)
const HORARIOS_HABILITADOS = [
  { valor: '07:00', etiqueta: '07:00 AM' },
  { valor: '07:30', etiqueta: '07:30 AM' },
  { valor: '08:00', etiqueta: '08:00 AM' },
  { valor: '08:30', etiqueta: '08:30 AM' },
  { valor: '09:00', etiqueta: '09:00 AM' },
  { valor: '09:30', etiqueta: '09:30 AM' },
  { valor: '10:00', etiqueta: '10:00 AM' },
  { valor: '10:30', etiqueta: '10:30 AM' },
  { valor: '11:00', etiqueta: '11:00 AM' },
  { valor: '11:30', etiqueta: '11:30 AM' },
  { valor: '12:00', etiqueta: '12:00 PM' },
  { valor: '12:30', etiqueta: '12:30 PM' },
  { valor: '13:00', etiqueta: '01:00 PM' },
  { valor: '13:30', etiqueta: '01:30 PM' },
  { valor: '14:00', etiqueta: '02:00 PM' },
  { valor: '14:30', etiqueta: '02:30 PM' },
  { valor: '15:00', etiqueta: '03:00 PM' },
  { valor: '15:30', etiqueta: '03:30 PM' },
  { valor: '16:00', etiqueta: '04:00 PM' },
  { valor: '16:30', etiqueta: '04:30 PM' },
  { valor: '17:00', etiqueta: '05:00 PM' },
  { valor: '17:30', etiqueta: '05:30 PM' },
  { valor: '18:00', etiqueta: '06:00 PM' },
  { valor: '18:30', etiqueta: '06:30 PM' },
  { valor: '19:00', etiqueta: '07:00 PM' },
];

export function FormularioCita({
  servicios,
  servicioElegido,
  fechaCita,
  horaCita,
  nombrePaciente,
  emailPaciente,
  cedulaPaciente,
  estado,
  mensajeError,
  citaExitosa,
  sesionActiva,
  usuario,
  disponibilidadHoraria,
  onVerMisCitas,
  alCambiarServicio,
  alCambiarFecha,
  alCambiarHora,
  alCambiarNombre,
  alCambiarEmail,
  alCambiarCedula,
  alEnviar,
}) {
  const totalDentistas = disponibilidadHoraria?.total_dentists || 0;
  const busySlots = disponibilidadHoraria?.busy_slots || {};
  const horasDisponiblesBackend = disponibilidadHoraria?.available_hours;
  const citaExistentePaciente = disponibilidadHoraria?.patient_appointment_today;

  const ahora = new Date();
  const hoyStr = ahora.toLocaleDateString('en-CA');
  const horaActualStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

  // Filtrar estrictamente: las horas ocupadas, sin cupo médico o ya transcurridas hoy NO se pintan en la lista
  const horariosDisponibles = HORARIOS_HABILITADOS.filter((h) => {
    // Si no ha seleccionado fecha, NO pintar horas (previene agendar a ciegas)
    if (!fechaCita) return false;

    // Si la fecha elegida es hoy y la hora ya pasó, no pintar la hora
    if (fechaCita === hoyStr && h.valor <= horaActualStr) return false;

    // Si el paciente ya tiene una cita ese día, no se le pinta ninguna hora disponible
    if (citaExistentePaciente) return false;

    // Si el backend envió la lista calculada de horas libres, usarla directamente
    if (Array.isArray(horasDisponiblesBackend)) {
      return horasDisponiblesBackend.includes(h.valor);
    }

    if (!disponibilidadHoraria || totalDentistas === 0) return false;
    const ocupadas = busySlots[h.valor] || 0;
    return ocupadas < totalDentistas;
  });

  const turnosManana = horariosDisponibles.filter((h) => h.valor < '13:00');
  const turnosTarde = horariosDisponibles.filter((h) => h.valor >= '13:00');
  return (
    <section className="mx-auto w-full max-w-3xl bg-white p-8 sm:p-10 rounded-2xl shadow-md border-2 border-slate-300/90">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-3 h-12 w-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-200">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
          Agenda tu Cita Odontológica
        </h2>
        <p className="mt-1 text-sm text-slate-600 font-medium">
          {sesionActiva
            ? `Agendando para: ${usuario?.full_name || 'Paciente'} (${usuario?.email || ''})`
            : 'Agendamiento rápido en un solo paso • Sin necesidad de registrar cuenta previamente'}
        </p>
      </header>

      <form onSubmit={alEnviar} className="space-y-5">
        
        {/* Tratamiento Clínico */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Tratamiento Requerido
          </label>
          <div className="relative">
            <select 
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer shadow-xs"
              value={servicioElegido} 
              onChange={alCambiarServicio} 
              required
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — ${Number(s.price).toLocaleString('es-CO')} COP
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Fecha de Consulta
            </label>
            <input 
              type="date" 
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all shadow-xs"
              value={fechaCita} 
              onChange={alCambiarFecha} 
              required 
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Hora de Consulta
              </label>
              <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                07:00 AM a 07:00 PM
              </span>
            </div>
            <div className="relative">
              <select 
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                value={horaCita} 
                onChange={alCambiarHora} 
                disabled={!fechaCita || Boolean(citaExistentePaciente) || horariosDisponibles.length === 0}
                required
              >
                <option value="">
                  {!fechaCita
                    ? '-- Primero selecciona una fecha de consulta --'
                    : citaExistentePaciente
                    ? `-- Ya tienes cita programada para hoy (${citaExistentePaciente.time}) --`
                    : horariosDisponibles.length === 0
                    ? '-- No hay disponibilidad médica para esta fecha --'
                    : '-- Selecciona horario de atención --'}
                </option>
                {turnosManana.length > 0 && (
                  <optgroup label="Jornada Mañana (07:00 AM - 12:30 PM)">
                    {turnosManana.map((h) => (
                      <option key={h.valor} value={h.valor}>
                        {h.etiqueta}
                      </option>
                    ))}
                  </optgroup>
                )}
                {turnosTarde.length > 0 && (
                  <optgroup label="Jornada Tarde (01:00 PM - 07:00 PM)">
                    {turnosTarde.map((h) => (
                      <option key={h.valor} value={h.valor}>
                        {h.etiqueta}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Cita Previa para el Paciente en la misma fecha */}
        {citaExistentePaciente && (
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-900 text-xs sm:text-sm font-medium space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Ya tienes una consulta agendada para el {fechaCita}</span>
            </div>
            <p>
              Tienes el <strong>Turno #{citaExistentePaciente.id}</strong> programado a las <strong>{citaExistentePaciente.time}</strong> con el <strong>{citaExistentePaciente.dentist}</strong>.
            </p>
            <p className="text-[11px] text-amber-700">
              Por política de la clínica, solo se permite una consulta por paciente al día para garantizar una atención adecuada. Si deseas cancelarla o reprogramarla, dirígete a Mis Citas.
            </p>
          </div>
        )}

        {/* Datos de Contacto Directo (Solo si no ha iniciado sesión previa) */}
        {!sesionActiva && (
          <div className="pt-2 border-t border-slate-200/90 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                Datos del Paciente
              </span>
              <span className="text-[11px] text-slate-500">• Para confirmar tu turno y asignarte doctor</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={70}
                  placeholder="Solo letras (ej: Laura Martínez)"
                  value={nombrePaciente}
                  onChange={(e) => {
                    const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');
                    alCambiarNombre({ target: { value: soloLetras } });
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="laura@ejemplo.com"
                  value={emailPaciente}
                  onChange={alCambiarEmail}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Cédula / Teléfono
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  minLength={6}
                  maxLength={15}
                  placeholder="Solo números (ej: 1020304050)"
                  value={cedulaPaciente}
                  onChange={(e) => {
                    const soloDigitos = e.target.value.replace(/\D/g, '');
                    alCambiarCedula({ target: { value: soloDigitos } });
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botón de Confirmación Directa */}
        <button 
          type="submit" 
          disabled={estado === 'submitting' || Boolean(citaExistentePaciente)}
          className="mt-4 w-full bg-sky-600 py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white shadow-sm hover:bg-sky-700 transition-all hover:shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {estado === 'submitting' 
            ? 'Confirmando y Asignando Odontólogo...' 
            : citaExistentePaciente
              ? 'Ya Tienes Cita Agendada Para Este Día'
              : 'Confirmar Cita Odontológica'}
        </button>

        {/* Mensaje de Confirmación Exitosa */}
        {estado === 'success' && (
          <div className="rounded-xl bg-emerald-50 p-5 text-emerald-800 border-2 border-emerald-300 shadow-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>¡Tu cita ha sido confirmada con éxito!</span>
            </div>
            {citaExitosa && (
              <p className="text-xs text-emerald-700 leading-relaxed">
                Turno <strong>#{citaExitosa.id}</strong> agendado para el <strong>{citaExitosa.date}</strong> a las <strong>{citaExitosa.time}</strong> con el <strong>{citaExitosa.dentist_name || 'Dr. Santiago Sotelo'}</strong>.
              </p>
            )}
            {onVerMisCitas && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onVerMisCitas}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                >
                  Ver Mi Turno en Mis Citas →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de Error Seguro (Previene Pantalla en Blanco por Objetos JSX) */}
        {estado === 'error' && (
          <div className="rounded-xl bg-red-50 p-4 text-center text-xs sm:text-sm font-bold text-red-700 border-2 border-red-300 flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-600">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>
              {typeof mensajeError === 'string'
                ? mensajeError
                : (mensajeError && typeof mensajeError === 'object'
                    ? (mensajeError.message || mensajeError.detail || JSON.stringify(mensajeError))
                    : 'Hubo un error al procesar tu cita. Verifica la información e inténtalo de nuevo.')}
            </span>
          </div>
        )}
      </form>
    </section>
  );
}
