import { TarjetasServicios } from './TarjetasServicios';

export function PaginaServicios({ cargando, servicios, token, alAbrirLogin, alAgendar }) {
  const manejarAgendar = () => {
    if (!token) {
      alAbrirLogin();
    } else if (alAgendar) {
      alAgendar();
    } else {
      const el = document.getElementById('agendar');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-12 animate-in fade-in duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center pb-8 border-b border-slate-200/80 mb-6">
        <span className="inline-block rounded-full bg-sky-100 text-sky-800 px-3.5 py-1 text-xs font-bold tracking-wider uppercase mb-3 border border-sky-200">
          Catálogo Clínico
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Nuestros Tratamientos Odontológicos
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Procedimientos especializados con tecnología de última generación para cuidar de tu salud bucal y la estética de tu sonrisa.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <TarjetasServicios cargando={cargando} servicios={servicios} />

        {/* Banner de Llamado a la Acción */}
        <div className="mt-14 bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-sm shadow-slate-200/50">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            ¿Necesitas una valoración personalizada?
          </h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto text-sm sm:text-base">
            Agenda tu cita de diagnóstico inicial. Nuestros especialistas evaluarán tu caso y te propondrán el mejor plan de tratamiento.
          </p>
          <button
            onClick={manejarAgendar}
            className="rounded-xl bg-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-sky-700 transition-all hover:shadow-md active:scale-95 cursor-pointer"
          >
            {token ? 'Agendar mi Cita Médica' : 'Iniciar Sesión para Agendar'}
          </button>
        </div>
      </div>
    </div>
  );
}
