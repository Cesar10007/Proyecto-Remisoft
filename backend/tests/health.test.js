import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'

test('GET /health responde con el estado del backend', async () => {
  const server = app.listen(0)

  try {
    const address = server.address()
    const response = await fetch(`http://127.0.0.1:${address.port}/health`)
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.deepEqual(body, {
      status: 'RemiSoft Express online',
    })
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
})