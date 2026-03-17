// ==========================================
// FORMULARIO DE INGRESO / REGISTRO (AuthForm.jsx)
// ==========================================
// Este archivo dibuja (renderiza) los recuadros donde el paciente 
// escribe su correo, contraseña, etc. para registrarse o entrar.

export const AuthForm = ({ authMode, authForm, authError, onAuthChange, onAuthSubmit, onToggleMode }) => {
    return (
        <section className="appointment-section">
            <div className="form-container">
                {/* Título dinámico que cambia si estamos en "login" o si estamos en "register" */}
                <h2 className="section-title">
                    {authMode === 'login' ? 'Iniciar Sesión' : 'Registro de Paciente'}
                </h2>
                
                {/* Si ocurre un error (ej. contraseña incorrecta), mostramos un cuadro de error en color rojo */}
                {authError && (
                    <div style={{ color: 'red', marginBottom: '1rem', background: '#ffebee', padding: '10px', borderRadius: '5px' }}>
                        {authError}
                    </div>
                )}
                
                {/* onAuthSubmit es la función que se ejecuta cuando el usuario presiona "Ingresar" o "Registrarme" */}
                <form onSubmit={onAuthSubmit}>
                    
                    {/* 👇 Si estamos en modo "Registro", mostramos LOS CAMPOS EXTRA que no se piden en el login normal */}
                    {authMode === 'register' && (
                        <>
                            {/* CAMPO DE NOMBRE COMPLETO */}
                            <div className="form-group">
                                <label className="form-label">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    name="full_name" 
                                    className="form-input" 
                                    value={authForm.full_name} 
                                    onChange={onAuthChange} 
                                    placeholder="Ej. Juan Pérez"
                                    required 
                                />
                            </div>

                            {/* CAMPO DE CÉDULA DE CIUDADANÍA (Añadido según la lista de tareas pendientes / TO DO) */}
                            <div className="form-group">
                                <label className="form-label">Cédula de Ciudadanía</label>
                                <input 
                                    type="number" 
                                    name="cedula" 
                                    className="form-input" 
                                    value={authForm.cedula} 
                                    onChange={onAuthChange} 
                                    placeholder="Sin puntos ni comas"
                                    required 
                                />
                            </div>

                            {/* CAMPO DE FECHA DE NACIMIENTO (Añadido según lista de tareas) */}
                            <div className="form-group">
                                <label className="form-label">Fecha de Nacimiento</label>
                                <input 
                                    type="date" 
                                    name="fecha_nacimiento" 
                                    className="form-input" 
                                    value={authForm.fecha_nacimiento} 
                                    onChange={onAuthChange} 
                                    required 
                                />
                            </div>
                        </>
                    )}
                    {/* 👆 Fin de los campos especiales de Registro */}

                    {/* CAMPO DE CORREO ELECTRÓNICO (Se pide tanto en login como en registro) */}
                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <input 
                            type="email" 
                            name="email" 
                            className="form-input" 
                            value={authForm.email} 
                            onChange={onAuthChange} 
                            placeholder="paciente@correo.com"
                            required 
                        />
                    </div>

                    {/* CAMPO DE CONTRASEÑA */}
                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="form-input" 
                            value={authForm.password} 
                            onChange={onAuthChange} 
                            placeholder="********"
                            required 
                        />
                    </div>

                    <button type="submit" className="btn-submit">
                        {authMode === 'login' ? 'Ingresar' : 'Registrarme'}
                    </button>
                </form>
                
                {/* Texto pequeño en la parte inferior para cambiar entre pantallas */}
                <p 
                    style={{ marginTop: '1rem', textAlign: 'center', cursor: 'pointer', color: 'var(--primary-color)' }} 
                    onClick={onToggleMode}
                >
                    {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </p>
            </div>
        </section>
    );
};
