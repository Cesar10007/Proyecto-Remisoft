import { useState } from 'react'
import ResumenCaja from './ResumenCaja'
import AperturasCaja from './AperturasCaja'
import CierresCaja from './CierresCaja'
import ReportesCaja from './ReportesCaja'
import ArqueosCaja from './ArqueosCaja'
import GastosCaja from './GastosCaja'
import './Caja.css'
 
interface CajaProps {
  nombreUsuario: string
}
 
function Caja({ nombreUsuario }: CajaProps) {
  const [vista, setVista] = useState('resumen')
 
  const volver = () => setVista('resumen')
 
  if (vista === 'aperturas') return <AperturasCaja nombreUsuario={nombreUsuario} onBack={volver} />
  if (vista === 'cierres') return <CierresCaja nombreUsuario={nombreUsuario} onBack={volver} />
  if (vista === 'reportes') return <ReportesCaja onBack={volver} />
  if (vista === 'arqueos') return <ArqueosCaja nombreUsuario={nombreUsuario} onBack={volver} />
  if (vista === 'gastos') return <GastosCaja nombreUsuario={nombreUsuario} onBack={volver} />
 
  return <ResumenCaja onNavigate={setVista} />
}
 
export default Caja