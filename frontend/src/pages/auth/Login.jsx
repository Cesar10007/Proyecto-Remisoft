import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import "./Auth.css";

function Login({ onClose }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, contrasena });
      const { token, user, rol } = response.data;
      const rolNormalizado = String(rol).toUpperCase();

      localStorage.setItem('token', token);
      localStorage.setItem('rol', rolNormalizado);
      localStorage.setItem('user', JSON.stringify(user));

      // Cerrar el modal antes de navegar
      onClose?.();

      if (rolNormalizado === 'SUPERADMIN')      navigate('/superadmin');
      else if (rolNormalizado === 'GERENTE')    navigate('/gerente');
      else if (rolNormalizado === 'MESERO')     navigate('/mesero');
      else if (rolNormalizado === 'REPARTIDOR') navigate('/repartidor');
      else navigate('/');

    } catch (err) {
      if (err.response?.status === 401)       setError('Credenciales incorrectas');
      else if (err.response?.status === 422)  setError('Revisa los datos ingresados');
      else                                    setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2 className="auth-title">Bienvenido</h2>
        <p className="auth-subtitle">Ingresa tus credenciales para continuar</p>
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

        <div className="form-group password-toggle-wrapper">
          <label className="form-label">Contraseña</label>
          <div className="password-input-wrapper">           {/* ← agregar este div */}
            <input
              className="form-input password-toggle-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-toggle-btn"
            >
              <span className="material-symbols-outlined password-toggle-icon">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>                                              {/* ← cerrar aquí */}
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary auth-btn"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;