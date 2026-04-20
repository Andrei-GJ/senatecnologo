import { useEffect } from 'react';

const ARTICULOS_COMPLETOS = {
  1: {
    title: '5 Consejos para un cepillado efectivo',
    date: '10 de Marzo, 2024',
    content: `
      <p>El cepillado dental es la base de una buena higiene oral, pero muchas veces no lo hacemos correctamente. Aquí te dejamos 5 consejos clave que puedes aplicar en tu rutina diaria:</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">1. Elige el cepillo adecuado</h3>
      <p>Utiliza siempre un cepillo de cerdas suaves. Las cerdas duras, lejos de limpiar mejor, pueden desgastar el esmalte de tus dientes e irritar seriamente las encías causando retracción gingival.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">2. Usa la técnica correcta</h3>
      <p>Coloca el cepillo en un ángulo de 45 grados apuntando hacia la encía y haz movimientos cortos, suaves y circulares o de barrido (de la encía hacia el diente). Evita frotar de lado a lado bruscamente como si estuvieras serruchando.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">3. Tómate tu tiempo</h3>
      <p>Un buen cepillado debe durar al menos 2 minutos completos. Imagina tu boca dividida en cuatro partes (cuadrantes) y dedica 30 segundos a cada uno de ellos para asegurarte de cubrir todas las superficies.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">4. No olvides la lengua</h3>
      <p>Las bacterias también se acumulan abundantemente en la superficie de la lengua, siendo una de las principales causas del mal aliento (halitosis). Cepíllala suavemente de atrás hacia adelante al finalizar.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">5. Renueva tu cepillo regularmente</h3>
      <p>Cambia tu cepillo de dientes o el cabezal de tu cepillo eléctrico cada 3 a 4 meses, o inmediatamente si notas que las cerdas están deshilachadas o dobladas. Un cepillo gastado no limpia correctamente.</p>
    `
  },
  2: {
    title: 'Mitos y verdades sobre el blanqueamiento dental',
    date: '25 de Febrero, 2024',
    content: `
      <p>El blanqueamiento dental es, sin duda, uno de los tratamientos estéticos más solicitados hoy en día. Sin embargo, existen muchos rumores sobre sus efectos secundarios. Vamos a desmentir los más comunes.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">Mito: El blanqueamiento daña el esmalte</h3>
      <p><strong>Completamente Falso.</strong> Los agentes blanqueadores profesionales (como el peróxido de hidrógeno o la carbamida), cuando son supervisados por un odontólogo profesional, abren los poros del esmalte para sacar la pigmentación, pero no lo destruyen ni lo desgastan.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">Verdad: Puede causar sensibilidad temporal</h3>
      <p><strong>Verdadero.</strong> Es muy común y totalmente normal experimentar sensibilidad al frío o calor durante el tratamiento y un par de días después. Esto es temporal y reversible.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">Mito: Cualquier persona puede hacerse un blanqueamiento</h3>
      <p><strong>Falso.</strong> Antes de un blanqueamiento, la boca debe estar 100% sana. Si hay caries, enfermedad periodontal, recesiones gingivales severas o coronas en los dientes frontales (porque este material no se blanquea), el tratamiento debe evaluarse o postergarse.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">Mito: Los remedios caseros como el bicarbonato son iguales</h3>
      <p><strong>Falso y peligroso.</strong> Frotar tus dientes con bicarbonato de sodio, jugo de limón o polvo de carbón activado es altamente abrasivo. Esto no "blanquea" mediante un proceso químico, sino que raspa el esmalte, causando daños permanentes irreparables.</p>
    `
  },
  3: {
    title: 'La importancia de la limpieza profesional',
    date: '14 de Febrero, 2024',
    content: `
      <p>Por más minucioso que seas con tu higiene oral, utilizando hilo dental y cepillándote después de cada comida, una visita de rutina para una limpieza profesional (profilaxis) es indispensable. ¿Por qué no basta con cuidarse en casa?</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">1. Elimina el sarro endurecido</h3>
      <p>A diferencia de la placa bacteriana (que es blanda y se remueve con el cepillado), el sarro es placa que se ha calcificado con los minerales de nuestra saliva. Una vez que se endurece, se adhiere fuertemente al diente como una piedra y <strong>no puede eliminarse con el cepillo</strong>. Se requiere de un profesional con instrumental ultrasónico.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">2. Previene la gingivitis y periodontitis</h3>
      <p>Ese sarro endurecido se aloja frecuentemente por debajo de la línea de las encías. Si no se remueve, el cuerpo reacciona inflamando la encía (sangrado) e iniciando un proceso de rechazo que deshace el hueso de soporte de los dientes. La limpieza profesional detiene a tiempo este proceso.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-8 mb-2">3. Remueve manchas superficiales</h3>
      <p>La limpieza incluye un pulido final utilizando pastas especiales que ayudan a suavizar la superficie del esmalte y remover manchas oscuras generadas por el consumo continuado de café, té, vino tinto o tabaco. Esto devuelve brillo a la sonrisa sin necesidad de aplicar químicos blanqueadores.</p>
    `
  }
};

export function PaginaArticulo({ id, alVolver }) {
  const articulo = ARTICULOS_COMPLETOS[id];

  // Desplazar al principio de la página al abrir un artículo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (!articulo) return null;

  return (
    <article className="py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-white">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        
        <button 
          onClick={alVolver}
          className="mb-10 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-sky-500 transition-colors border border-slate-200 hover:border-sky-200 py-2 px-4 rounded-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver a artículos
        </button>

        <header className="mb-12 text-center bg-slate-50 py-12 px-6 rounded-3xl border border-slate-100">
            <time className="text-xs font-bold text-sky-500 block mb-4 uppercase tracking-[0.2em]">{articulo.date}</time>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight mb-8">
                {articulo.title}
            </h1>
            <div className="h-1.5 w-24 bg-sky-500 mx-auto rounded-full" />
        </header>

        <div 
            className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: articulo.content }}
        />
        
        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 flex items-center justify-center bg-sky-100 text-sky-500 rounded-full">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-900">Dr. Equipo Dental Blanc</p>
                 <p className="text-xs text-slate-500">Especialistas en sonrisas</p>
               </div>
             </div>
             <button
                 onClick={alVolver}
                 className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-sky-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
             >
                 Leer más artículos
             </button>
        </div>

      </div>
    </article>
  );
}
