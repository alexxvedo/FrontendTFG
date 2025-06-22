#!/usr/bin/env node

/**
 * Servidor WebSocket para Yjs - Colaboración en tiempo real
 * Usado para edición colaborativa de notas
 */

const WebSocket = require("ws");
const http = require("http");
const { setupWSConnection } = require("y-websocket/bin/utils");

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 1234;

// Crear servidor HTTP
const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Yjs WebSocket Server is running!");
});

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

console.log(`🚀 Yjs WebSocket Server iniciado en ws://${host}:${port}`);
console.log(`📝 Listo para colaboración en tiempo real`);

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`🔗 Nueva conexión: ${url.pathname}`);

  setupWSConnection(ws, req, {
    // Configuración adicional si es necesaria
    gc: true, // Garbage collection habilitado
  });
});

// Manejar cierre del servidor
process.on("SIGINT", () => {
  console.log("\n⏹️  Cerrando servidor Yjs WebSocket...");
  server.close(() => {
    console.log("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
});

// Iniciar servidor
server.listen(port, host, () => {
  console.log(
    `📡 Servidor HTTP/WebSocket escuchando en http://${host}:${port}`
  );
});
