import { useState, useEffect } from 'react';

export function PaginaArticulo({ id, alVolver, apiBaseUrl = 'http://localhost:8000/api' }) {
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let cancelado = false;
    setCargando(true);
    setError(null);

    fetch(`${apiBaseUrl}/blogs/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Artículo no encontrado.');
        return res.json();
      })
      .then(datos => {
        if (!cancelado) {
          setArticulo(datos);
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
  }, [id, apiBaseUrl]);

  return (
    <article className="py-16 sm:py-20 animate-in fade-in duration-300">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        
        {/* Botón Volver */}
        <button
          onClick={alVolver}
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors bg-white border border-slate-200/90 hover:border-sky-300 py-2.5 px-4 rounded-xl shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a artículos
        </button>

        {cargando && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cargando artículo...
            </span>
          </div>
        )}

        {error && !cargando && (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm">
            <h3 className="text-lg font-bold text-red-600 mb-2">No se encontró el artículo</h3>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={alVolver}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Regresar al Blog
            </button>
          </div>
        )}

        {!cargando && articulo && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm shadow-slate-200/50">
            <header className="mb-8 pb-8 border-b border-slate-100 text-center">
              <span className="inline-block text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">
                {articulo.date}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {articulo.title}
              </h1>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>Por</span>
                <span className="font-bold text-slate-800">{articulo.author || 'Equipo Dental Blanc'}</span>
              </div>
            </header>

            {/* Contenido */}
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base space-y-5">
              {articulo.content.includes('<') ? (
                <div dangerouslySetInnerHTML={{ __html: articulo.content }} />
              ) : (
                articulo.content.split('\n\n').map((parrafo, i) => (
                  <p key={i} className="text-slate-600 leading-relaxed">
                    {parrafo}
                  </p>
                ))
              )}
            </div>

            {/* Pie del artículo */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 font-bold text-sm">
                  DB
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Dental Blanc Especialistas</div>
                  <div className="text-[11px] text-slate-400">Comprometidos con tu bienestar dental</div>
                </div>
              </div>
              <button
                onClick={alVolver}
                className="text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                ← Ver más publicaciones
              </button>
            </div>
          </div>
        )}

      </div>
    </article>
  );
}
