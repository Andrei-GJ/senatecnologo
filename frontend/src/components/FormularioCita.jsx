// FormularioCita.jsx - Gestión de Citas Médicas

export function FormularioCita({
  servicios,
  servicioElegido, fechaCita, horaCita,
  estado,
  alCambiarServicio, alCambiarFecha, alCambiarHora,
  alEnviar,
}) {
  return (
    <section className="mx-auto w-full max-w-3xl bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-sky-50 border border-slate-50">
      <header className="mb-10 text-center">
        <div className="mx-auto mb-4 h-14 w-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">Reserva tu Espacio</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">Selecciona el tratamiento y horario que mejor se adapte a ti</p>
      </header>

      <form onSubmit={alEnviar} className="space-y-6">
        
        {/* Servicio */}
        <div className="space-y-1.5">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tratamiento Requerido</label>
          <div className="relative">
            <select 
              className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-none cursor-pointer transition-all"
              value={servicioElegido} 
              onChange={alCambiarServicio} 
              required
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">¿Qué día prefieres?</label>
            <input 
              type="date" 
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-none transition-all"
              value={fechaCita} 
              onChange={alCambiarFecha} 
              required 
            />
          </div>
          <div className="space-y-1.5">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Hora de Atención</label>
            <input 
              type="time" 
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-none transition-all"
              value={horaCita} 
              onChange={alCambiarHora} 
              required 
            />
          </div>
        </div>

        {/* Botón de Envío */}
        <button 
          type="submit" 
          disabled={estado === 'submitting'}
          className="mt-4 w-full bg-sky-500 py-4 rounded-2xl text-sm font-extrabold uppercase tracking-widest text-white shadow-xl shadow-sky-100 transition-all hover:bg-sky-600 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
        >
          {estado === 'submitting' ? 'Asegurando tu cupo...' : 'Agendar mi Cita'}
        </button>

        {/* Mensajes de Estado */}
        {estado === 'success' && (
          <div className="duration-300 rounded-2xl bg-emerald-50 p-5 text-center text-sm font-bold text-emerald-600 border border-emerald-100 flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ¡Genial! Tu cita ha sido reservada con éxito.
          </div>
        )}

        {estado === 'error' && (
          <div className="duration-300 rounded-2xl bg-red-50 p-5 text-center text-sm font-bold text-red-500 border border-red-100 flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Lo sentimos, hubo un error. Inténtalo de nuevo.
          </div>
        )}
      </form>
    </section>
  );
}
