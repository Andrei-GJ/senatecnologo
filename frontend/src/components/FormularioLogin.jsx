// FormularioLogin.jsx - Estilo Médico con Alto Contraste y Cero Emojis

export function FormularioLogin({
  modo,
  email,
  password,
  nombre,
  cedula,
  fechaNacimiento,
  error,
  alCambiarEmail,
  alCambiarPassword,
  alCambiarNombre,
  alCambiarCedula,
  alCambiarFechaNacimiento,
  alEnviar,
  alCambiarModo,
  alCerrar,
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      
      {/* Contenedor del Modal con microbordes definidos */}
      <div className="relative w-full max-w-[440px] bg-white p-7 sm:p-9 rounded-2xl border border-slate-200/90 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Botón Cerrar */}
        <button 
          onClick={alCerrar}
          className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border border-slate-200"
          title="Cerrar ventana"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <header className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {modo === 'login' ? 'Acceso al Sistema' : 'Registro de Paciente'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {modo === 'login' 
              ? 'Ingresa tus credenciales para gestionar turnos y tratamientos' 
              : 'Diligencia tus datos para crear tu historia y agendar'}
          </p>
        </header>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-3.5 text-center text-xs font-semibold text-red-600 border border-red-200 flex items-center gap-2 justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {modo === 'login' && (
          <div className="mb-5 bg-slate-50/90 p-3 rounded-xl border border-slate-200/90">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Acceso Rápido de Prueba (Demo)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  alCambiarEmail({ target: { value: 'admin@dentalblanc.com' } });
                  alCambiarPassword({ target: { value: 'admin123' } });
                }}
                className="py-2 px-1 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 rounded-lg text-[11px] font-bold text-slate-700 border border-slate-200 shadow-xs transition-all text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  alCambiarEmail({ target: { value: 'dr.santiago@dentalblanc.com' } });
                  alCambiarPassword({ target: { value: 'dental123' } });
                }}
                className="py-2 px-1 bg-white hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 rounded-lg text-[11px] font-bold text-slate-700 border border-slate-200 shadow-xs transition-all text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>
                Doctor
              </button>
              <button
                type="button"
                onClick={() => {
                  alCambiarEmail({ target: { value: 'paciente@dentalblanc.com' } });
                  alCambiarPassword({ target: { value: 'paciente123' } });
                }}
                className="py-2 px-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded-lg text-[11px] font-bold text-slate-700 border border-slate-200 shadow-xs transition-all text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                Paciente
              </button>
            </div>
          </div>
        )}

        <form onSubmit={alEnviar} className="space-y-3.5">
          {modo === 'register' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
                  value={nombre}
                  onChange={(e) => {
                    const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');
                    alCambiarNombre({ target: { value: soloLetras } });
                  }}
                  placeholder="Solo letras (ej: Carlos Andrés Gómez)"
                  minLength={3}
                  maxLength={70}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Cédula / ID
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    minLength={6}
                    maxLength={15}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
                    value={cedula}
                    onChange={(e) => {
                      const soloDigitos = e.target.value.replace(/\D/g, '');
                      alCambiarCedula({ target: { value: soloDigitos } });
                    }}
                    placeholder="Solo números (ej: 1018234567)"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    F. Nacimiento
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
                    value={fechaNacimiento}
                    onChange={alCambiarFechaNacimiento}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
              value={email}
              onChange={alCambiarEmail}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
              value={password}
              onChange={alCambiarPassword}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-3 w-full bg-sky-600 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-xs hover:bg-sky-700 transition-all hover:shadow-sm active:scale-[0.99] cursor-pointer"
          >
            {modo === 'login' ? 'Iniciar Sesión' : 'Completar Registro'}
          </button>
        </form>

        <footer className="mt-6 text-center">
          <button 
            type="button"
            className="text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
            onClick={alCambiarModo}
          >
            {modo === 'login' ? '¿Aún no tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta activa? Inicia sesión'}
          </button>
        </footer>
      </div>
    </div>
  );
}
