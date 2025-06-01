#!/usr/bin/env node

/**
 * Servidor WebSocket para Yjs
 * Este servidor maneja la sincronización de documentos Yjs para la edición colaborativa
 */

const WebSocket = require('ws')
const http = require('http')
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection

const port = process.env.PORT || 1234
const host = process.env.HOST || 'localhost'

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Servidor Yjs para edición colaborativa\n')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req, {
    gc: true, // Habilitar recolección de basura
    pingTimeout: 30000, // 30 segundos de timeout para ping
    docName: req.url.slice(1).split('?')[0] // Nombre del documento desde la URL
  })
})

server.listen(port, host, () => {
  console.log(`Servidor Yjs ejecutándose en: http://${host}:${port}`)
})

// Manejar cierre limpio
process.on('SIGINT', () => {
  console.log('Cerrando servidor Yjs...')
  wss.close(() => {
    console.log('Servidor WebSocket cerrado')
    process.exit(0)
  })
})
