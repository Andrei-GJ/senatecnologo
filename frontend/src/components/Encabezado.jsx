// Encabezado.jsx - Diseño Clínico y Moderno

export function Encabezado({ sesionActiva, alCerrarSesion, alAbrirLogin }) {
  return (
    <header className="sticky top-0 z-50 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-[5%] shadow-sm flex items-center justify-between">
      
      {/* Lado Izquierdo: Marca */}
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 flex items-center justify-center bg-sky-500 rounded-xl shadow-lg shadow-sky-100">
          <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 12c.5-2 1.5-3 2.5-3s2 1 2.5 3c.5 2 1.5 3 2.5 3s2-1 2.5-3c.5-2 1.5-3 2.5-3s2 1 2.5 3"/>
            <path d="M12 3c-5 0-8 6-8 12 0 4.4 3.6 6 8 6s8-1.6 8-6c0-6-3-12-8-12z"/>
          </svg>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">DENTAL BLANC</h1>
          <span className="text-[10px] font-bold text-sky-500 tracking-widest uppercase">Especialistas</span>
        </div>
      </div>

      {/* Navegación Central (Limpios) */}
      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors">Servicios</a>
        <a href="#" className="text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors">Nosotros</a>
        <a href="#" className="text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors">Blog</a>
      </nav>

      {/* Acciones Derecha */}
      <div className="flex items-center gap-4">
        {sesionActiva ? (
          <div className="flex items-center gap-3">
             <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900">Mi Cuenta</p>
                <button onClick={alCerrarSesion} className="text-[10px] font-bold text-red-400 uppercase hover:text-red-600 transition-colors">Cerrar Sesión</button>
             </div>
             <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             </div>
          </div>
        ) : (
          <button 
            onClick={alAbrirLogin}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Ingresar
          </button>
        )}
      </div>
    </header>
  );
}
