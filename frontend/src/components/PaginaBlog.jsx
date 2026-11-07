import { useState, useEffect } from 'react';

// PaginaBlog.jsx - Artículos de Salud Oral Conectados a la API
export function PaginaBlog({ alVerArticulo, apiBaseUrl = 'http://localhost:8000/api' }) {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    fetch(`${apiBaseUrl}/blogs`)
      .then(res => {
        if (!res.ok) throw new Error('No fue posible cargar los artículos.');
        return res.json();
      })
      .then(datos => {
        if (!cancelado) {
          setArticulos(datos || []);
        }
      })
      .catch(err => {
        if (!cancelado) {
          setError(err.message);
        }
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
            Educación y Salud Oral
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Blog Dental Blanc
          </h2>
          <div className="mt-3 h-1.5 w-16 bg-sky-500 mx-auto rounded-full" />
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600">
            Consejos de prevención, higiene y novedades en odontología estética de la mano de nuestros especialistas.
          </p>
        </div>

        {/* Estado de Carga */}
        {cargando && (
          <div className="mt-14 flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-10 w-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cargando artículos clínicos...
            </span>
          </div>
        )}

        {/* Mensaje de error si falla la conexión */}
        {error && !cargando && (
          <div className="mt-10 mx-auto max-w-md p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Listado de Artículos */}
        {!cargando && (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articulos.map(post => (
              <article
                key={post.id}
                onClick={() => alVerArticulo(post.id)}
                className="group relative flex flex-col bg-white rounded-2xl border-2 border-slate-300 shadow-md hover:shadow-lg hover:border-sky-500 transition-all duration-200 hover:-translate-y-1 p-6 cursor-pointer justify-between"
              >
                <div>
                  {/* Cabecera del Post con Icono Clínico */}
                  <div className="mb-5 bg-sky-50/80 rounded-xl h-44 w-full flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors border border-sky-100">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                    <time>{post.date}</time>
                    <span className="font-semibold text-slate-600">{post.author || 'Especialista Dental Blanc'}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-2.5 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sky-600 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Leer artículo completo
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
