import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-reset-link', { email });
      setEnviado(true);
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Ingresa un correo electrónico válido.');
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-page">
      <div className="auth-form">
        <p className="reset-page-logo">Remi<span>Soft</span></p>

        {!enviado ? (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Recuperar contraseña</h2>
              <p className="auth-subtitle">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <div className={`forgot-input-wrapper ${error ? 'input-error' : ''}`}>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                  />
                  {error && (
                    <span className="material-symbols-outlined forgot-input-icon">
                      warning
                    </span>
                  )}
                </div>
                {error && <p className="forgot-field-error">{error}</p>}
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-btn"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>

            <button className="auth-link" onClick={() => navigate('/')}>
              ← Volver al inicio
            </button>
          </>
        ) : (
          <div className="forgot-success">
            <div className="forgot-success-icon">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <h2 className="forgot-success-title">¡Enlace enviado!</h2>
            <p className="forgot-success-msg">
              Te hemos enviado las instrucciones a tu correo.
            </p>
            <button
              className="btn btn-primary auth-btn"
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;