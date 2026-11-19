import { useVistaURL } from '../../../hook/useVistaURL'
import ResumenCaja from './ResumenCaja'
import AperturasCaja from './AperturasCaja'
import CierresCaja from './CierresCaja'
import ReportesCaja from './ReportesCaja'
import ArqueosCaja from './ArqueosCaja'
import GastosCaja from './GastosCaja'
import './Caja.css'

function Caja() {
  const [vista, setVista] = useVistaURL('caja', 'resumen', ['resumen', 'aperturas', 'cierres', 'reportes', 'arqueos', 'gastos'])

  const volver = () => setVista('resumen')

  if (vista === 'aperturas') return <AperturasCaja onBack={volver} />
  if (vista === 'cierres') return <CierresCaja onBack={volver} />
  if (vista === 'reportes') return <ReportesCaja onBack={volver} />
  if (vista === 'arqueos') return <ArqueosCaja onBack={volver} />
  if (vista === 'gastos') return <GastosCaja onBack={volver} />

  return <ResumenCaja onNavigate={setVista} />
}

export default Caja
