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
            <div key={servicio.id} className="group relative bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md hover:shadow-lg hover:border-sky-500 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between">
              
              <div>
                {/* Icono Representativo */}
                <div className="mb-5 h-12 w-12 flex items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-200 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 12c.5-2 1.5-3 2.5-3s2 1 2.5 3c.5 2 1.5 3 2.5 3s2-1 2.5-3c.5-2 1.5-3 2.5-3s2 1 2.5 3" />
                    <path d="M12 3c-5 0-8 6-8 12 0 4.4 3.6 6 8 6s8-1.6 8-6c0-6-3-12-8-12z" />
                  </svg>
                </div>

                {/* Info del Servicio */}
                <div className="space-y-2.5">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{servicio.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {servicio.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 flex items-center justify-between border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Desde</span>
                <span className="text-lg font-black text-sky-700">
                  {formatearPrecio(servicio.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
