export const formatCOP = (valor: number) => {
  const signo = valor < 0 ? '-' : ''
  return `${signo}$${Math.abs(valor).toLocaleString('es-CO')}`
}
 
export const ahora = () => {
  const d = new Date()
  return {
    fecha: d.toLocaleDateString('es-CO'),
    hora: d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
  }
}
 
export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  borderRadius: '8px',
  border: '1.5px solid var(--borde)',
  background: 'var(--bg)',
  fontSize: '0.95rem',
  color: 'var(--texto)',
  outline: 'none',
  boxSizing: 'border-box',
}