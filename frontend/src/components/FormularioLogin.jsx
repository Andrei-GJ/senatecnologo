// FormularioLogin.jsx - Estilo Médico Amigable

export function FormularioLogin({
  modo,
  email, password, nombre, cedula, fechaNacimiento,
  error,
  alCambiarEmail, alCambiarPassword, alCambiarNombre,
  alCambiarCedula, alCambiarFechaNacimiento,
  alEnviar, alCambiarModo, alCerrar
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      
      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-[440px] bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Botón Cerrar */}
        <button 
          onClick={alCerrar}
          className="absolute top-8 right-8 h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {modo === 'login' ? 'Bienvenido de nuevo' : 'Crea tu Historia'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {modo === 'login' 
              ? 'Ingresa tus datos para continuar' 
              : 'Regístrate para agendar tu primera cita'}
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-center text-xs font-bold text-red-500 border border-red-100 flex items-center gap-2 justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <form onSubmit={alEnviar} className="space-y-4">
          {modo === 'register' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Nombre Completo</label>
                <input type="text" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none transition-all"
                  value={nombre} onChange={alCambiarNombre}
                  placeholder="Juan Pérez" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Cédula</label>
                  <input type="number" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
                    value={cedula} onChange={alCambiarCedula}
                    placeholder="123456" required />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Nacimiento</label>
                  <input type="date" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
                    value={fechaNacimiento} onChange={alCambiarFechaNacimiento}
                    required />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Correo Electrónico</label>
            <input type="email" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
              value={email} onChange={alCambiarEmail}
              placeholder="nombre@correo.com" required />
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Contraseña</label>
            <input type="password" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
              value={password} onChange={alCambiarPassword}
              placeholder="********" required />
          </div>

          <button type="submit" className="mt-4 w-full bg-sky-500 py-4 rounded-2xl text-sm font-extrabold uppercase tracking-widest text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-600 active:scale-[0.98]">
            {modo === 'login' ? 'Entrar ahora' : 'Crear mi Historia'}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <button 
            type="button"
            className="text-xs font-bold text-slate-400 hover:text-sky-500 transition-colors"
            onClick={alCambiarModo}
          >
            {modo === 'login' ? '¿Aún no eres paciente? Regístrate' : '¿Ya tienes cuenta? Ingresa aquí'}
          </button>
        </footer>
      </div>
    </div>
  );
}
