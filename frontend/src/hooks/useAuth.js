// ==========================================
// HERRAMIENTA DE AUTENTICACIÓN (useAuth.js)
// ==========================================
// Este archivo es un "Hook". En React, un hook es una función especial que nos permite 
// guardar la memoria de las cosas. Aquí guardamos la memoria de quién inició sesión.

import { useState } from 'react';
import { apiService } from '../services/api';

export const useAuth = () => {
    // 1. MEMORIA de estados: Variables que React recordará si la página cambia
    
    // El token es como una "llave digital" temporal. Si existe en la memoria, el usuario ya entró.
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    
    // authMode nos dice si estamos en la ventana de "Registro" o de "Login". Inicia por defecto en login
    const [authMode, setAuthMode] = useState('login'); 
    
    // authForm es el "Papel virtual" donde vamos anotando todo lo que el usuario digita en los campos.
    // También agregamos cédula (cedula) y fecha de nacimiento (fecha_nacimiento) según la lista TO DO.
    const [authForm, setAuthForm] = useState({ 
        email: '', 
        password: '', 
        full_name: '',
        cedula: '',
        fecha_nacimiento: ''
    });
    
    // authError almacena alertas rojas que mostraremos si algo falla (Ej: correo ya existe)
    const [authError, setAuthError] = useState(null);

    // =========================================================================

    // 2. FUNCIÓN PARA ESCRIBIR: Que se llama siempre que alguien teclea en un <input>
    const handleAuthChange = (e) => {
        // [e.target.name] significa que busca el nombre del campo (ej: 'email') y copia su texto actual (e.target.value)
        setAuthForm({ ...authForm, [e.target.name]: e.target.value });
    };

    // 3. FUNCIÓN PARA CAMBIAR DE PANTALLA: Alterna entre Modo "Registro" y Modo "Login"
    const toggleAuthMode = () => {
        setAuthMode(prevMode => (prevMode === 'login' ? 'register' : 'login'));
        setAuthError(null); // Borramos las alertas rojas al cambiar de ventana
    };

    // 4. FUNCIÓN PARA INICIAR SESIÓN (Comunicación con la base de datos/backend)
    const login = async () => {
        // Preparamos los datos como si fueran un formulario de inicio normal de Internet
        const formDataPayload = new URLSearchParams();
        formDataPayload.append('username', authForm.email);
        formDataPayload.append('password', authForm.password);

        try {
            // Utilizamos apiService para ir a la URL secreta: http://localhost:8000/api/login
            const data = await apiService.post('/login', formDataPayload, null, true);
            // Si funciona, nos da una "Llave digital" (access_token)
            setToken(data.access_token);
            // Guardamos la llave de repuesto en el navegador, para que si recarga la página, siga dentro
            localStorage.setItem('token', data.access_token);
        } catch (err) {
            // Si la clave no sirve, causamos un error que veremos como mensaje rojo en la pantalla
            throw new Error('Lo sentimos, tus credenciales son incorrectas.');
        }
    };

    // 5. FUNCIÓN PARA REGISTRAR (Crear un paciente nuevo en la clínica)
    const register = async () => {
        // Enviamos todos los datos (incluyendo la nueva cédula y fecha) a la URL de Registro
        await apiService.post('/register', {
            email: authForm.email,
            password: authForm.password,
            full_name: authForm.full_name,
            cedula: authForm.cedula,
            fecha_nacimiento: authForm.fecha_nacimiento
        });
        
        // Si todo sale perfecto en el registro:
        setAuthMode('login'); // 1. Cambiamos la vista a Iniciar sesión para obligarlo a entrar
        setAuthError('¡Registro exitoso! Ya puedes iniciar sesión.'); // 2. Le mostramos un aviso
        // 3. Reseteamos lo que había escrito pero le dejamos el correo puesto por comodidad
        setAuthForm({ email: authForm.email, password: '', full_name: '', cedula: '', fecha_nacimiento: '' }); 
    };

    // 6. FUNCIÓN SUPERVISORA: Esta se activa cuando el paciente aprieta el botón de "Ingresar" o "Registrarme"
    const handleAuthSubmit = async (e) => {
        e.preventDefault(); // Evitamos que el navegador se reinicie a lo bruto
        setAuthError(null); // Ocultamos los errores anteriores antes de volver a intentarlo

        try {
            if (authMode === 'register') {
                await register(); // Si estamos en registro, intentamos registrarlo
            } else {
                await login(); // Si estamos en login, intentamos iniciar sesión
            }
        } catch (err) {
            // Si cualquiera de los dos falla, el sistema agarra (*catch*) ese error y lo imprime en pantalla
            setAuthError(err.message);
        }
    };

    // 7. FUNCIÓN PARA CERRAR SESIÓN (Adiós paciente)
    const logout = () => {
        setToken(null); // Botamos la llave de la memoria temporal
        localStorage.removeItem('token'); // Botamos la llave que estaba guardadita en el navegador
    };

    // Al final, esta herramienta especial simplemente te "devuelve" como caja de regalo todo
    // lo que armó arriba para que el archivo `App.jsx` lo pueda usar a su antojo.
    return {
        token, authMode, authForm, authError,
        handleAuthChange, handleAuthSubmit, toggleAuthMode, logout
    };
};
