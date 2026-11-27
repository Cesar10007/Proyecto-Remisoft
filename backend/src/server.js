import 'dotenv/config'
import { exigirEntorno } from './config/entorno.js'
import app from './app.js'

try {
  exigirEntorno()
} catch (error) {
  console.error('\n[RemiSoft] El servidor no arranca: la configuración del entorno no es segura.')
  console.error(error.message)
  console.error('\nGenera un secreto y guárdalo en el archivo .env de la raíz:')
  console.error('  $secreto = -join ((1..32) | ForEach-Object { \'{0:x2}\' -f (Get-Random -Max 256) })')
  console.error('  Add-Content .env "JWT_SECRET=$secreto"')
  console.error('\nEn Docker, el compose también exige DB_ROOT_PASSWORD, DB_PASSWORD y JWT_SECRET.')
  process.exit(1)
}

const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || '0.0.0.0'

app.listen(port, host, () => {
  console.log(`RemiSoft Express escuchando en http://${host}:${port}`)
})
