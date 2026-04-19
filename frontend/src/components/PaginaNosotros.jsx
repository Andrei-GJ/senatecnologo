// PaginaNosotros.jsx - Diseño Institucional
export function PaginaNosotros() {
  return (
    <section className="py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Sobre Nosotros</h2>
          <div className="mt-2 h-1.5 w-20 bg-sky-500 sm:mx-auto rounded-full" />
          <p className="mt-6 text-lg leading-8 text-slate-600">
            En Dental Blanc, estamos comprometidos con ofrecer atención odontológica de primer nivel, combinando experiencia, tecnología avanzada y una atención cálida y humana. Nuestro equipo de profesionales trabaja día a día para que tu sonrisa sea el reflejo de tu salud.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">Misión</h3>
            <p className="text-slate-500 line-clamp-4">Brindar servicios de salud oral de la más alta calidad, con un enfoque integral y personalizado, asegurando la comodidad y satisfacción de cada paciente.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">Visión</h3>
            <p className="text-slate-500 line-clamp-4">Ser la clínica odontológica de referencia por nuestra excelencia médica, innovación tecnológica y el compromiso genuino con el bienestar de nuestra comunidad.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">Valores</h3>
            <p className="text-slate-500 line-clamp-4">Ética profesional, empatía con nuestros pacientes, innovación constante, responsabilidad y un compromiso inquebrantable con la calidad del servicio.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
