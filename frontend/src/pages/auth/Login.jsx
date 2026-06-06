import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
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

      if (rolNormalizado === 'SUPERADMIN') {
        navigate('/superadmin');
      } else if (rolNormalizado === 'GERENTE') {
        navigate('/gerente');
      } else if (rolNormalizado === 'MESERO') {
        navigate('/mesero');
      } else if (rolNormalizado === 'REPARTIDOR') {
        navigate('/repartidor');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas');
      } else if (err.response?.status === 422) {
        setError('Revisa los datos ingresados');
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}

export default Login;