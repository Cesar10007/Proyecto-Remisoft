// Previsualización con la misma precisión de centavos y tasa (seis decimales) que la API.
export const ivaEnCentavos = (base: number, tasa: number) =>
  Math.round((base * Math.round(tasa * 1_000_000)) / 1_000_000)

export const formatCOP = (valor: number) => {
  const signo = valor < 0 ? '-' : ''
  return `${signo}$${Math.abs(valor).toLocaleString('es-CO', { maximumFractionDigits: 2 })}`
}
