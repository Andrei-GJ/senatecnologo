import { TarjetasServicios } from './TarjetasServicios';

export function PaginaServicios({ cargando, servicios, token, alAbrirLogin }) {
  const agendar = () => {
    if (!token) alAbrirLogin();
    else document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center pb-8 border-b border-slate-100 mb-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Catálogo de Servicios</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Explora nuestra amplia gama de tratamientos dentales especializados, diseñados para cuidar de tu salud y estética bucal.
          </p>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
           <TarjetasServicios cargando={cargando} servicios={servicios} />
           
           <div className="mt-16 bg-sky-50 rounded-3xl p-8 sm:p-12 text-center shadow-inner border border-sky-100">
             <h3 className="text-2xl font-bold text-slate-900 mb-4">¿No estás seguro de qué tratamiento necesitas?</h3>
             <p className="text-slate-600 mb-8 max-w-xl mx-auto">Inicia con una valoración o limpieza general, y nuestros especialistas te guiarán paso a paso en tu cuidado dental.</p>
             <button
                 onClick={agendar}
                 className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-sky-600 transition-all hover:scale-105 active:scale-95"
             >
                 {token ? 'Agendar mi Cita' : 'Inicia sesión para agendar'}
             </button>
           </div>
        </div>
    </div>
  );
}
