export const Header = ({ token, onLogout }) => {
    return (
        <header className="header">
            <div className="header-title">
                <h1>Dental Blanc</h1>
                <p>Clínica Odontológica Especializada</p>
            </div>
            {token && (
                <div>
                    <button 
                        onClick={onLogout} 
                        style={{
                            background: 'rgba(255,255,255,0.2)', 
                            border: 'none', 
                            color: 'white', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold'
                        }}>
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </header>
    );
};
