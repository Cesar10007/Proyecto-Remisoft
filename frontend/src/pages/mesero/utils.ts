export const formatCOP = (valor: number) => {
  const signo = valor < 0 ? '-' : ''
  return `${signo}$${Math.abs(valor).toLocaleString('es-CO', { maximumFractionDigits: 2 })}`
}
