import { useState, useEffect } from 'react';

// PaginaNosotros.jsx - Diseño Institucional Conectado a la API
export function PaginaNosotros({ apiBaseUrl = 'http://localhost:8000/api' }) {
  const [info, setInfo] = useState({
    mision: 'Brindar servicios de salud oral de la más alta calidad, con un enfoque integral y personalizado, asegurando la comodidad y satisfacción de cada paciente.',
    vision: 'Ser la clínica odontológica de referencia por nuestra excelencia médica, innovación tecnológica y el compromiso genuino con el bienestar de nuestra comunidad.',
    valores: 'Ética profesional, empatía con nuestros pacientes, innovación constante, responsabilidad y un compromiso inquebrantable con la calidad del servicio.',
    telefono: '+57 (601) 300-9999',
    direccion: 'Calle 127 # 19A - 44, Consultorio 502, Bogotá D.C.',
    email_contacto: 'contacto@dentalblanc.com',
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    fetch(`${apiBaseUrl}/clinic-info`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar la información de la clínica');
        return res.json();
      })
      .then(datos => {
        if (!cancelado && datos) {
          setInfo(datos);
        }
      })
      .catch(() => {
        // Mantiene valores predeterminados seguros
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [apiBaseUrl]);

  return (
    <section className="py-16 sm:py-20 animate-in fade-in duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-sky-100 text-sky-800 px-3.5 py-1 text-xs font-bold tracking-wider uppercase mb-3 border border-sky-200">
            Nuestra Esencia
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Sobre Nosotros
          </h2>
          <div className="mt-3 h-1.5 w-16 bg-sky-500 mx-auto rounded-full" />
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600">
            En Dental Blanc combinamos experiencia clínica, tecnología odontológica avanzada y un trato humano y cercano. Nuestro compromiso es transformar sonrisas cuidando tu salud integral.
          </p>
        </div>

        {/* Pilares Institucionales (Misión, Visión, Valores) */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Misión */}
          <div className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md hover:border-sky-500 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-5 border border-sky-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Misión</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {info.mision}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-sky-700">
              Excelencia en Salud Oral
            </div>
          </div>

          {/* Visión */}
          <div className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md hover:border-sky-500 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-5 border border-cyan-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Visión</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {info.vision}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-cyan-700">
              Liderazgo & Vanguardia
            </div>
          </div>

          {/* Valores */}
          <div className="bg-white p-7 rounded-2xl border-2 border-slate-300 shadow-md hover:border-sky-500 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 border border-emerald-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Valores</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {info.valores}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-emerald-700">
              Ética, Empatía y Calidad
            </div>
          </div>
        </div>

        {/* Tarjeta de Ubicación e Información de Contacto */}
        <div className="mt-10 bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sede Principal</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{info.direccion}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Línea de Atención</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{info.telefono}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{info.email_contacto}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
