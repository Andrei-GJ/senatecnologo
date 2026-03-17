// ==========================================
// HERRAMIENTA DE CITAS MÉDICAS (useAppointments.js)
// ==========================================
// Otro archivo de función en React (Hook). Esta vez nos concentramos en
// cargar los servicios odontológicos y guardar las citas desde el servidor.

import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useAppointments = (token) => {
    // 1. MEMORIA PARA SERVICIOS: 
    // - "services" es la lista que vendrá de la base de datos (Ej: "Ortodoncia")
    // - "loading" es un aviso de que todavía estamos "buscando" en la red.
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 2. MEMORIA DEL FORMULARIO DE CITAS:
    // Guarda los 3 datos principales que digita el paciente al pedir su cita:
    // El ID numérico del servicio que escogió, en qué día y a qué hora.
    const [formData, setFormData] = useState({
        service_id: '',
        date: '',
        time: ''
    });
    
    // submitStatus es un semáforo [ null = quieto, 'submitting' = cargando, 'success' = verde, 'error' = rojo ]
    const [submitStatus, setSubmitStatus] = useState(null);

    // =========================================================================

    // 3. EVENTO ESPECIAL (useEffect): Este bloque se ejecuta SOLA UNA VEZ 
    // cuando la página web termina de ponerse bonita frente al paciente.
    useEffect(() => {
        // Al comenzar, salimos a buscar los servicios odontológicos con la lupa
        const fetchServices = async () => {
            try {
                // Le pedimos al servidor Backend todos los servicios
                const data = await apiService.get('/services');
                setServices(data); // Los guardamos en la memoria 'services'
                
                // Si la clínica ofrece al menos 1 servicio (ej: Limpieza Dental), se lo pre-seleccionamos
                // por defecto en la caja desplegable para que el paciente no empiece con un hueco.
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, service_id: data[0].id }));
                }
            } catch (err) {
                // Si el backend no contesta, le avisamos a los programadores
                console.error('Ops, falló la búsqueda de servicios:', err);
            } finally {
                // Si todo acaba (bien o mal), dejamos de mostrar el letrero "cargando..."
                setLoading(false);
            }
        };

        fetchServices();
        // El [] del final es un "candado" de React para asegurar que esto solo ocurra esa 1 vez.
    }, []); 

    // 4. FUNCIÓN PARA ESCRIBIR EN EL FORMULARIO DE CITA (Ej: cambia la fecha)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Si el paciente cambió el servicio (service_id), React lo recuerda como un *Número*, sino como *Texto* (Texto: "fecha")
        setFormData(prev => ({ ...prev, [name]: name === 'service_id' ? parseInt(value) : value }));
    };

    // 5. FUNCIÓN CENTRAL PARA HABLAR CON EL SERVIDOR Y GUARDAR LA CITA
    const submitAppointment = async (e) => {
        e.preventDefault(); // Detenemos al navegador, que le gusta reiniciarse cuando oprimes "submit"
        
        // Prendemos el semáforo amarrillo "submitting..."
        setSubmitStatus('submitting'); 
        
        try {
            // Mandamos los datos (formData) a la ruta "/appointments", ¡Pero con la "LLAVE DIGITAL" (Token)!
            // Así FastAPI sabe automáticamente "Quién" está agendando la cita.
            await apiService.post('/appointments', formData, token);
            
            // ¡Misión cumplida! Semáforo Verde
            setSubmitStatus('success');
            
            // Vamos a borrar con un borrador todo lo que escribió en el formulario excepto por 
            // el servicio por defecto. Así queda limpiecito para otra cita.
            setFormData({
                service_id: services[0]?.id || '',
                date: '',
                time: ''
            });
            
            // Un contador invisible de 5000 milisegundos (5 segundos) borrará el recuadro verde de éxito.
            setTimeout(() => setSubmitStatus(null), 5000);
        } catch (error) {
            // Si el backend falló o la red se cayó, semáforo rojo.
            console.error('El servidor rechazó la cita:', error);
            setSubmitStatus('error');
        }
    };

    // Al final, exportamos todas estas variables (que las herramientas juntaron)
    // para que "App.jsx" las dibuje en pantalla.
    return {
        services, loading, formData, submitStatus,
        handleInputChange, submitAppointment
    };
};
