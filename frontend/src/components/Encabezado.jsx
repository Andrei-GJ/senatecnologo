// Encabezado.jsx
// Muestra la barra azul superior con el nombre de la clínica
// y el botón "Cerrar Sesión" si el usuario ya inició sesión.

export function Encabezado({ sesionActiva, alCerrarSesion }) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Dental Blanc</h1>
        <p>Clínica Odontológica Especializada</p>
      </div>

      {sesionActiva && (
        <button
          onClick={alCerrarSesion}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Cerrar Sesión
        </button>
      )}
    </header>
  );
}
