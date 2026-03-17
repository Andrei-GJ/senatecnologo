// TarjetasServicios.jsx - Estilo Médico y Confiable

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio);
}

export function TarjetasServicios({ cargando, servicios }) {
  return (
    <section className="py-12" id="servicios">
      <div className="mb-10 text-left sm:text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Tratamientos Especializados</h2>
        <div className="mt-2 h-1.5 w-20 bg-sky-500 sm:mx-auto rounded-full" />
      </div>

      {cargando ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Descubriendo servicios...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 hover:-translate-y-2">
              
              {/* Icono Representativo */}
              <div className="mb-6 h-14 w-14 flex items-center justify-center rounded-2xl bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L12 12"/><path d="M12 22L12 12"/><path d="M22 12L12 12"/><path d="M2 12L12 12"/><path d="M19.07 4.93L12 12"/><path d="M4.93 19.07L12 12"/><path d="M19.07 19.07L12 12"/><path d="M4.93 4.93L12 12"/>
                </svg>
              </div>

              {/* Info del Servicio */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{servicio.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                  {servicio.description}
                </p>
                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Desde</span>
                  <span className="text-xl font-extrabold text-sky-600">
                    {formatearPrecio(servicio.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
