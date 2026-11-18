import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * RNF-001.8 — OWASP A09 (Security Logging and Monitoring Failures).
 *
 * Formato: JSON estructurado, una línea por evento (JSON Lines).
 * Destinos: stdout (lo capturan los logs de Docker) y el archivo
 * backend/logs/auditoria.log.
 *
 * Reglas de seguridad:
 *  - Nunca se registran contraseñas, tokens ni hashes.
 *  - Los emails se enmascaran (RNF-001.8: "sin email completo").
 *  - Un fallo al escribir la auditoría NUNCA debe tumbar el flujo principal.
 */

// Se resuelve desde la ubicación del módulo (backend/src/utils) para que
// el log caiga siempre en backend/logs, sin importar desde dónde se ejecute.
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR_LOGS = path.resolve(AQUI, '../../logs');
const ARCHIVO = 'auditoria.log';

export function enmascararEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    return null;
  }

  const [usuario, dominio] = email.split('@');

  if (!usuario) {
    return null;
  }

  return `${usuario.slice(0, 1)}***@${dominio}`;
}

export function registrarAuditoria({
  evento,
  id_usuario = null,
  ip = null,
  endpoint = null,
  motivo = null,
  extra = null,
}) {
  const registro = {
    timestamp: new Date().toISOString(),
    level: 'security',
    event: evento,
    id_usuario: id_usuario ?? null,
    ip: ip ?? null,
    endpoint: endpoint ?? null,
    motivo: motivo ?? null,
    ...(extra ? { extra } : {}),
  };

  const linea = JSON.stringify(registro);

  // 1. Consola / Docker.
  console.log(linea);

  // 2. Archivo, sin bloquear la petición.
  try {
    fs.mkdirSync(DIR_LOGS, { recursive: true });
    fs.promises
      .appendFile(path.join(DIR_LOGS, ARCHIVO), `${linea}\n`, 'utf8')
      .catch((error) => {
        console.error(
          '[auditoria] no se pudo escribir el archivo de log:',
          error.message,
        );
      });
  } catch (error) {
    console.error(
      '[auditoria] no se pudo preparar el directorio de logs:',
      error.message,
    );
  }

  return registro;
}
