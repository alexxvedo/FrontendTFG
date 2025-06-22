const WebSocket = require("ws");
const http = require("http");
const { setupWSConnection } = require("y-websocket/bin/utils");

const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Yjs WebSocket server running");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req, {
    // You can configure authentication here if needed
    authenticate: async (request) => {
      // For now, we'll allow all connections
      return true;
    },
  });
});

const port = 1234;
server.listen(port, () => {
  console.log(`Yjs WebSocket server running on port ${port}`);
});
