import { formatPrice } from '../utils/formatters';

export const ServiceList = ({ loading, services }) => {
    return (
        <section className="services-section">
            <h2 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Nuestros Servicios
            </h2>
            
            {loading ? (
                <div className="loading">Cargando servicios...</div>
            ) : (
                <div className="services-grid">
                    {services.map(service => (
                        <div key={service.id} className="service-card">
                            <h3 className="service-name">{service.name}</h3>
                            <p className="service-description">{service.description}</p>
                            <div className="service-price">{formatPrice(service.price)}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
