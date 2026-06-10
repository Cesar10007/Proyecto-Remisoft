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
      await api.post('/forgot-password', { email });
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

        {!enviado ? (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Recuperar contraseña</h2>
              <p className="auth-subtitle">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary auth-btn"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>

            <button
              className="auth-link"
              onClick={() => navigate('/')}
            >
              ← Volver al inicio
            </button>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Revisa tu correo</h2>
              <p className="auth-subtitle">
                Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
            </div>

            <button
              className="btn btn-primary auth-btn"
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;