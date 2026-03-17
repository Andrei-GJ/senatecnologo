import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    patient_name: '',
    service_id: '',
    date: '',
    time: ''
  })
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, service_id: data[0].id }))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching services:', err)
        setLoading(false)
      })
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'service_id' ? parseInt(value) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('submitting')
    
    try {
      const response = await fetch('http://localhost:8000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          patient_name: '',
          service_id: services[0]?.id || '',
          date: '',
          time: ''
        })
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting appointment:', error)
      setSubmitStatus('error')
    }
  }

  // Helper para formatear moneda en COP (Colombia)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <h1>Dental Blanc</h1>
          <p>Clínica Odontológica Especializada</p>
        </div>
      </header>

      <main className="main-content">
        <section className="services-section">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
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

        <section className="appointment-section">
          <div className="form-container">
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Agendar Cita
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="patient_name">Nombre del Paciente</label>
                <input 
                  type="text" 
                  id="patient_name"
                  name="patient_name"
                  className="form-input" 
                  placeholder="Ej. Juan Pérez"
                  value={formData.patient_name}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="service_id">Servicio Requerido</label>
                <select 
                  id="service_id"
                  name="service_id" 
                  className="form-input"
                  value={formData.service_id}
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitStatus === 'submitting'}
              >
                {submitStatus === 'submitting' ? 'Procesando...' : 'Confirmar Cita'}
              </button>

              {submitStatus === 'success' && (
                <div className="success-message">
                  ¡Cita agendada con éxito! Nos pondremos en contacto pronto.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="success-message" style={{color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#f87171'}}>
                  Ocurrió un error al agendar la cita.
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
