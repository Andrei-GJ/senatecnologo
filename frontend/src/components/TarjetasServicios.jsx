// TarjetasServicios.jsx
// Muestra las tarjetas (cards) con los servicios que ofrece la clínica.
// Recibe la lista de servicios y un booleano que dice si aún están cargando.

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio);
}

export function TarjetasServicios({ cargando, servicios }) {
  return (
    <section className="services-section">
      <h2 className="section-title">Nuestros Servicios</h2>

      {cargando ? (
        <div className="loading">Cargando servicios...</div>
      ) : (
        <div className="services-grid">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="service-card">
              <h3 className="service-name">{servicio.name}</h3>
              <p className="service-description">{servicio.description}</p>
              <div className="service-price">{formatearPrecio(servicio.price)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
