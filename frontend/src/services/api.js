// ==========================================
// SERVICIO DE COMUNICACIÓN (api.js)
// ==========================================
// Este archivo funciona como un "Mensajero" exclusivo de nuestra clínica.
// En lugar de escribir fetch(...) mil veces en toda la app, 
// este mensajero sabe a qué puerta tocar y siempre lleva la Llave digital (Token).

// Aquí definimos dónde vive el cerebro de nuestra aplicación web (el Backend o FastAPI).
export const API_URL = 'http://localhost:8000/api';

export const apiService = {
  // Función para TRAER DATOS (Consultar algo que ya existe, como la lista de servicios).
  async get(endpoint, token = null) {
    // endpoint es la pieza del mapa que falta (Ej: "/services").
    // Preparamos nuestro paquete diciéndole que hablamos en JSON.
    const headers = { 'Content-Type': 'application/json' };
    
    // Si tenemos una llave digital prestada, la mostramos en la puerta (Authorization).
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Le pedimos al navegador que haga el "fetch" (viaje a internet/local) a la unión de URL+endopint.
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    
    // Si la puerta responde con un error HTTP (Ej: 404 No encontrado o 500 Dañado), disparamos una queja
    if (!response.ok) {
        throw await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    }
    
    // Si todo va bien, develvemos los datos abriendo el archivo JSON (la cajita de regalos de FastAPI).
    return response.json();
  },

  // Función para ENVIAR DATOS (Guardar una Cita o un Usuario nuevo).
  async post(endpoint, data, token = null, isFormUrlEncoded = false) {
    const headers = {};
    
    // A veces mandamos datos normales (JSON) y a veces mandamos datos como si fueran
    // un papel físico tradicional desde un botón HTML (Form Url Encoded: solo lo usamos en Login).
    if (!isFormUrlEncoded) {
        headers['Content-Type'] = 'application/json';
    } else {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    
    // Mostrar la llave del usuario si la tenemos:
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Empacamos el mensaje: O pasa crudo (FormUrl) o se vuelve texto empacado (JSON.stringify)
    const body = isFormUrlEncoded ? data : JSON.stringify(data);

    // Hacemos el viaje, pero indicando MÈTODO POST (La convención de que estamos entregando algo nuevo)
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body,
    });

    // Validar si FastAPI nos cerró la puerta en la cara con algún error "detail: ...":
    if (!response.ok) {
        const err = await response.json();
        // Disparamos un Crash y mostramos la explicación roja "detail" que envió Python, 
        // o si no la hay, un error por defecto:
        throw new Error(err.detail || 'Ha ocurrido un error en el servidor, llame al Sena');
    }
    return response.json();
  }
};
