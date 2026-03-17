export const AppointmentForm = ({ services, formData, submitStatus, onChange, onSubmit }) => {
    return (
        <section className="appointment-section">
            <div className="form-container">
                <h2 className="section-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Agendar Cita
                </h2>
                
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="service_id">Servicio Requerido</label>
                        <select 
                            id="service_id" 
                            name="service_id" 
                            className="form-input"
                            value={formData.service_id} 
                            onChange={onChange} 
                            required
                        >
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="date">Fecha</label>
                            <input 
                                type="date" 
                                id="date" 
                                name="date" 
                                className="form-input" 
                                value={formData.date} 
                                onChange={onChange} 
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="time">Hora</label>
                            <input 
                                type="time" 
                                id="time" 
                                name="time" 
                                className="form-input" 
                                value={formData.time} 
                                onChange={onChange} 
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={submitStatus === 'submitting'}>
                        {submitStatus === 'submitting' ? 'Procesando...' : 'Confirmar Cita'}
                    </button>

                    {submitStatus === 'success' && (
                        <div className="success-message">
                            ¡Cita agendada con éxito! Revisa tu perfil.
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="success-message" style={{ color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#f87171' }}>
                            Ocurrió un error al agendar la cita.
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
};
