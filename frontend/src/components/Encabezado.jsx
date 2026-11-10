// Encabezado.jsx - Diseño Clínico con Control de Identidad y Roles
import { useState, useRef, useEffect } from 'react';

export function Encabezado({
  sesionActiva,
  usuario,
  alCerrarSesion,
  alAbrirLogin,
  vistaActual,
  alCambiarVista,
}) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const headerRef = useRef(null);

  const esAdmin = usuario?.role === 'admin';
  const esDentista = usuario?.role === 'dentist';
  const esPaciente = usuario && !esAdmin && !esDentista;
  const primerNombre = usuario?.full_name ? usuario.full_name.split(' ')[0] : 'Usuario';

  // Cerrar menú al hacer clic por fuera
  useEffect(() => {
    function handleClickAfuera(e) {
      if (menuMovilAbierto && headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuMovilAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickAfuera);
    document.addEventListener('touchstart', handleClickAfuera);
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
      document.removeEventListener('touchstart', handleClickAfuera);
    };
  }, [menuMovilAbierto]);

  function navegar(vista) {
    setMenuMovilAbierto(false);
    alCambiarVista(vista);
  }

  function manejarCerrarSesion() {
    setMenuMovilAbierto(false);
    alCerrarSesion();
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="h-20 px-[5%] flex items-center justify-between">
        {/* Lado Izquierdo: Marca */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => navegar('inicio')}
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
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">DENTAL BLANC</h1>
            <span className="text-[9px] sm:text-[10px] font-bold text-sky-500 tracking-widest uppercase">Especialistas</span>
          </div>
        </div>

        {/* Navegación Central (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => navegar('inicio')}
            className={`text-sm font-semibold transition-colors ${
              vistaActual === 'inicio' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => navegar('servicios')}
            className={`text-sm font-semibold transition-colors ${
              vistaActual === 'servicios' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'
            }`}
          >
            Servicios
          </button>
          <button
            onClick={() => navegar('nosotros')}
            className={`text-sm font-semibold transition-colors ${
              vistaActual === 'nosotros' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'
            }`}
          >
            Nosotros
          </button>
          <button
            onClick={() => navegar('blog')}
            className={`text-sm font-semibold transition-colors ${
              vistaActual === 'blog' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'
            }`}
          >
            Blog
          </button>

          {/* Enlace a Mis Citas (para pacientes) */}
          {sesionActiva && esPaciente && (
            <button
              onClick={() => navegar('mis-citas')}
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
              onClick={() => navegar('agenda')}
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
              onClick={() => navegar('admin')}
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Acceso rápido móvil para Mis Citas, Agenda o Admin */}
          {sesionActiva && esPaciente && (
            <button
              onClick={() => navegar('mis-citas')}
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
              onClick={() => navegar('agenda')}
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
              onClick={() => navegar('admin')}
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
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Info Desktop */}
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
                  type="button"
                  onClick={manejarCerrarSesion}
                  className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>

              {/* Avatar */}
              <button
                type="button"
                onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm md:cursor-default cursor-pointer transition-transform active:scale-95 ${
                  esAdmin
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : esDentista
                    ? 'bg-teal-100 text-teal-700 border border-teal-200'
                    : 'bg-sky-100 text-sky-700 border border-sky-200'
                }`}
                title={`${usuario.full_name || 'Usuario'} (Toca para ver menú)`}
              >
                {usuario.full_name ? usuario.full_name.charAt(0).toUpperCase() : 'U'}
              </button>

              {/* Botón directo de Cerrar Sesión en mobile */}
              <button
                type="button"
                onClick={manejarCerrarSesion}
                className="sm:hidden flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 transition-colors active:scale-95 cursor-pointer"
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={alAbrirLogin}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold hover:bg-sky-600 transition-all active:scale-95 shadow-md shadow-slate-200"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Ingresar</span>
            </button>
          )}

          {/* Botón menú hamburguesa para mobile */}
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
            title={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-label="Menú principal"
          >
            {menuMovilAbierto ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      {menuMovilAbierto && (
        <div className="md:hidden border-t border-slate-200/90 bg-white px-[5%] py-4 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Identidad del usuario si está autenticado */}
          {sesionActiva && usuario && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                  esAdmin
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : esDentista
                    ? 'bg-teal-100 text-teal-700 border border-teal-200'
                    : 'bg-sky-100 text-sky-700 border border-sky-200'
                }`}
              >
                {usuario.full_name ? usuario.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {usuario.full_name || 'Usuario'}
                </p>
                <span
                  className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    esAdmin
                      ? 'bg-purple-100 text-purple-700 border border-purple-200/60'
                      : esDentista
                      ? 'bg-teal-100 text-teal-700 border border-teal-200/60'
                      : 'bg-sky-100 text-sky-700 border border-sky-200/60'
                  }`}
                >
                  {esAdmin ? 'Administrador' : esDentista ? 'Odontólogo' : 'Paciente'}
                </span>
              </div>
            </div>
          )}

          {/* Enlaces de navegación */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => navegar('inicio')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                vistaActual === 'inicio' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => navegar('servicios')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                vistaActual === 'servicios' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Servicios
            </button>
            <button
              type="button"
              onClick={() => navegar('nosotros')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                vistaActual === 'nosotros' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Nosotros
            </button>
            <button
              type="button"
              onClick={() => navegar('blog')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                vistaActual === 'blog' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Blog
            </button>

            {/* Accesos de Rol en menú móvil */}
            {sesionActiva && esPaciente && (
              <button
                type="button"
                onClick={() => navegar('mis-citas')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                  vistaActual === 'mis-citas'
                    ? 'bg-sky-500 text-white font-bold'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/60'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Portal de Mis Citas
              </button>
            )}

            {sesionActiva && esDentista && (
              <button
                type="button"
                onClick={() => navegar('agenda')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                  vistaActual === 'agenda' || vistaActual === 'mis-citas'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/60'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Mi Agenda Médica
              </button>
            )}

            {sesionActiva && esAdmin && (
              <button
                type="button"
                onClick={() => navegar('admin')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                  vistaActual === 'admin'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Panel de Administración
              </button>
            )}
          </div>

          {/* Botón de Autenticación / Cerrar Sesión en menú móvil */}
          <div className="pt-2 border-t border-slate-100">
            {sesionActiva ? (
              <button
                type="button"
                onClick={manejarCerrarSesion}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar Sesión
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMenuMovilAbierto(false);
                  alAbrirLogin();
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-sky-600 transition-colors shadow-sm cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Ingresar al Portal
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
