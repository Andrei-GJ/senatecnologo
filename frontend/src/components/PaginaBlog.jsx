// PaginaBlog.jsx - Estilo Artículos
export function PaginaBlog({ alVerArticulo }) {
  return (
    <section className="py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Nuestro Blog</h2>
          <div className="mt-2 h-1.5 w-20 bg-sky-500 sm:mx-auto rounded-full" />
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Consejos y novedades sobre salud dental, tratamientos e higiene para mantener una sonrisa sana y radiante.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 1, title: '5 Consejos para un cepillado efectivo', excerpt: 'Descubre los errores más comunes que la mayoría comete al cepillarse los dientes y cómo solucionarlos para lograr una higiene bucal perfecta.', date: '10 de Marzo, 2024' },
            { id: 2, title: 'Mitos y verdades sobre el blanqueamiento dental', excerpt: '¿Daña el esmalte? ¿Causa sensibilidad a largo plazo? Aclaramos todas tus dudas sobre este popular tratamiento estético.', date: '25 de Febrero, 2024' },
            { id: 3, title: 'La importancia de la limpieza profesional', excerpt: 'Una limpieza en casa no es suficiente. Te explicamos por qué acudir al odontólogo es clave para prevenir enfermedades y conservar tus dientes.', date: '14 de Febrero, 2024' }
          ].map(post => (
            <article 
              key={post.id} 
              onClick={() => alVerArticulo(post.id)}
              className="group relative flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 hover:-translate-y-2 p-6 cursor-pointer"
            >
               <div className="mb-4 bg-sky-50 rounded-xl h-48 w-full flex items-center justify-center text-sky-200 group-hover:bg-sky-100 group-hover:text-sky-400 transition-colors">
                 <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m3 15 2 2 4-4"/></svg>
               </div>
               <div className="flex items-center text-xs text-slate-400 mb-2">
                 <time dateTime={post.date}>{post.date}</time>
               </div>
               <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-3">{post.title}</h3>
               <p className="text-slate-500 line-clamp-3 text-sm leading-6 flex-1">{post.excerpt}</p>
               <div className="mt-4 pt-4 border-t border-slate-50">
                 <span className="text-sky-500 font-bold text-xs uppercase tracking-wider group-hover:text-sky-600 transition-colors">Leer más &rarr;</span>
               </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
