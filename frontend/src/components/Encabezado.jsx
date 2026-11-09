// Encabezado.jsx - Diseño Clínico con Control de Identidad y Roles

export function Encabezado({
  sesionActiva,
  usuario,
  alCerrarSesion,
  alAbrirLogin,
  vistaActual,
  alCambiarVista,
}) {
  const esAdmin = usuario?.role === 'admin';
  const esDentista = usuario?.role === 'dentist';
  const esPaciente = usuario && !esAdmin && !esDentista;
  const primerNombre = usuario?.full_name ? usuario.full_name.split(' ')[0] : 'Usuario';

  return (
    <header className="sticky top-0 z-50 h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-[5%] shadow-xs flex items-center justify-between">
      {/* Lado Izquierdo: Marca */}
      <div
        className="flex items-center gap-2.5 cursor-pointer select-none"
        onClick={() => alCambiarVista('inicio')}
      >
        <div className="h-10 w-10 flex items-center justify-center bg-sky-500 rounded-xl shadow-lg shadow-sky-100">
          <svg
            className="text-white"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 12c.5-2 1.5-3 2.5-3s2 1 2.5 3c.5 2 1.5 3 2.5 3s2-1 2.5-3c.5-2 1.5-3 2.5-3s2 1 2.5 3" />
            <path d="M12 3c-5 0-8 6-8 12 0 4.4 3.6 6 8 6s8-1.6 8-6c0-6-3-12-8-12z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">DENTAL BLANC</h1>
          <span className="text-[10px] font-bold text-sky-500 tracking-widest uppercase">Especialistas</span>
        </div>
      </div>

      {/* Navegación Central */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8">
        <button
          onClick={() => alCambiarVista('inicio')}
          className={`text-sm font-semibold transition-colors ${
            vistaActual === 'inicio' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'
          }`}
        >
          Inicio
        </button>
        <button
          onClick={() => alCambiarVista('servicios')}
          className={`text-sm font-semibold transition-colors ${
            vistaActual === 'servicios' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'
          }`}
        >
          Servicios
        </button>
        <button
          onClick={() => alCambiarVista('nosotros')}
          className={`text-sm font-semibold transition-colors ${
            vistaActual === 'nosotros' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'
          }`}
        >
          Nosotros
        </button>
        <button
          onClick={() => alCambiarVista('blog')}
          className={`text-sm font-semibold transition-colors ${
            vistaActual === 'blog' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'
          }`}
        >
          Blog
        </button>

        {/* Enlace a Mis Citas (para pacientes) */}
        {sesionActiva && esPaciente && (
          <button
            onClick={() => alCambiarVista('mis-citas')}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
              vistaActual === 'mis-citas'
                ? 'bg-sky-50 text-sky-600 font-bold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Mis Citas
          </button>
        )}

        {/* Enlace a Mi Agenda Médica (para odontólogos) */}
        {sesionActiva && esDentista && (
          <button
            onClick={() => alCambiarVista('agenda')}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
              vistaActual === 'agenda' || vistaActual === 'mis-citas'
                ? 'bg-teal-600 text-white font-bold shadow-sm'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/60'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Mi Agenda Médica
          </button>
        )}

        {/* Enlace al Panel Administrativo (para admin) */}
        {sesionActiva && esAdmin && (
          <button
            onClick={() => alCambiarVista('admin')}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
              vistaActual === 'admin'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Panel Admin
          </button>
        )}
      </nav>

      {/* Acciones Derecha */}
      <div className="flex items-center gap-3">
        {/* Acceso rápido móvil para Mis Citas, Agenda o Admin */}
        {sesionActiva && esPaciente && (
          <button
            onClick={() => alCambiarVista('mis-citas')}
            className={`md:hidden p-2 rounded-xl text-xs font-semibold flex items-center gap-1 ${
              vistaActual === 'mis-citas' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-700'
            }`}
            title="Mis Citas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        )}

        {sesionActiva && esDentista && (
          <button
            onClick={() => alCambiarVista('agenda')}
            className={`md:hidden p-2 rounded-xl text-xs font-semibold flex items-center gap-1 ${
              vistaActual === 'agenda' || vistaActual === 'mis-citas' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700'
            }`}
            title="Mi Agenda Médica"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        )}

        {sesionActiva && esAdmin && (
          <button
            onClick={() => alCambiarVista('admin')}
            className={`md:hidden p-2 rounded-xl text-xs font-semibold flex items-center gap-1 ${
              vistaActual === 'admin' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
            }`}
            title="Panel Admin"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        )}

        {sesionActiva && usuario ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="flex items-center justify-end gap-1.5">
                <p className="text-xs font-bold text-slate-900">Hola, {primerNombre}</p>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    esAdmin
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      : esDentista
                      ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                      : 'bg-sky-50 text-sky-700 border border-sky-200/60'
                  }`}
                >
                  {esAdmin ? 'Admin' : esDentista ? 'Odontólogo' : 'Paciente'}
                </span>
              </div>
              <button
                onClick={alCerrarSesion}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
              >
                Cerrar Sesión
              </button>
            </div>
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                esAdmin
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : esDentista
                  ? 'bg-teal-100 text-teal-700 border border-teal-200'
                  : 'bg-sky-100 text-sky-700 border border-sky-200'
              }`}
              title={usuario.full_name}
            >
              {usuario.full_name ? usuario.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        ) : (
          <button
            onClick={alAbrirLogin}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-sky-600 transition-all active:scale-95 shadow-md shadow-slate-200"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Ingresar
          </button>
        )}
      </div>
    </header>
  );
}
