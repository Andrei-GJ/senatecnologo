// FormularioLogin.jsx
// Muestra los campos de inicio de sesión o registro.

export function FormularioLogin({
  modo,
  email, password, nombre, cedula, fechaNacimiento,
  error,
  alCambiarEmail, alCambiarPassword, alCambiarNombre,
  alCambiarCedula, alCambiarFechaNacimiento,
  alEnviar, alCambiarModo,
}) {
  return (
    <section className="appointment-section">
      <div className="form-container">
        <h2 className="section-title">
          {modo === 'login' ? 'Iniciar Sesión' : 'Registro de Paciente'}
        </h2>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', background: '#ffebee', padding: '10px', borderRadius: '5px' }}>
            {error}
          </div>
        )}

        <form onSubmit={alEnviar}>

          {modo === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input type="text" className="form-input"
                  value={nombre} onChange={alCambiarNombre}
                  placeholder="Ej. Juan Pérez" required />
              </div>

              <div className="form-group">
                <label className="form-label">Cédula de Ciudadanía</label>
                <input type="number" className="form-input"
                  value={cedula} onChange={alCambiarCedula}
                  placeholder="Sin puntos ni comas" required />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Nacimiento</label>
                <input type="date" className="form-input"
                  value={fechaNacimiento} onChange={alCambiarFechaNacimiento}
                  required />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input type="email" className="form-input"
              value={email} onChange={alCambiarEmail}
              placeholder="paciente@correo.com" required />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-input"
              value={password} onChange={alCambiarPassword}
              placeholder="********" required />
          </div>

          <button type="submit" className="btn-submit">
            {modo === 'login' ? 'Ingresar' : 'Registrarme'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center', cursor: 'pointer', color: 'var(--primary-color)' }}
          onClick={alCambiarModo}>
          {modo === 'login'
            ? '¿No tienes cuenta? Regístrate'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
      </div>
    </section>
  );
}
