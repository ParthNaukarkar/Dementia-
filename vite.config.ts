import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function portalSyncPlugin(): Plugin {
  const syncFile = path.resolve(__dirname, '.portal-sync-store.json')
  return {
    name: 'neurosaathi-portal-sync-middleware',
    configureServer(server) {
      server.middlewares.use('/api/sync-storage', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(syncFile)) {
              const data = fs.readFileSync(syncFile, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(data)
              return
            }
          } catch {}
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({}))
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            try {
              let existing: Record<string, any> = {}
              if (fs.existsSync(syncFile)) {
                try { existing = JSON.parse(fs.readFileSync(syncFile, 'utf-8')) } catch {}
              }
              const incoming = JSON.parse(body || '{}')
              const merged = { ...existing, ...incoming, _lastUpdated: Date.now() }
              fs.writeFileSync(syncFile, JSON.stringify(merged, null, 2), 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, timestamp: merged._lastUpdated }))
            } catch (err: any) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err?.message || 'Sync write failed' }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end('Method Not Allowed')
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    portalSyncPlugin(),
  ],
})
