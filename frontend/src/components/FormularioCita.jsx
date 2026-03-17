// FormularioCita.jsx
// Muestra el formulario para agendar una cita con fecha, hora y servicio.

export function FormularioCita({
  servicios,
  servicioElegido, fechaCita, horaCita,
  estado,
  alCambiarServicio, alCambiarFecha, alCambiarHora,
  alEnviar,
}) {
  return (
    <section className="appointment-section">
      <div className="form-container">
        <h2 className="section-title">Agendar Cita</h2>

        <form onSubmit={alEnviar}>

          <div className="form-group">
            <label className="form-label">Servicio Requerido</label>
            <select className="form-input"
              value={servicioElegido} onChange={alCambiarServicio} required>
              {servicios.map(function (s) {
                return <option key={s.id} value={s.id}>{s.name}</option>;
              })}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input"
                value={fechaCita} onChange={alCambiarFecha} required />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input type="time" className="form-input"
                value={horaCita} onChange={alCambiarHora} required />
            </div>
          </div>

          <button type="submit" className="btn-submit"
            disabled={estado === 'submitting'}>
            {estado === 'submitting' ? 'Procesando...' : 'Confirmar Cita'}
          </button>

          {estado === 'success' && (
            <div className="success-message">¡Cita agendada con éxito!</div>
          )}

          {estado === 'error' && (
            <div className="success-message"
              style={{ color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#f87171' }}>
              Ocurrió un error al agendar la cita.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
