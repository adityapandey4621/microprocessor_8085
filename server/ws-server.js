/**
 * 8085 Microprocessor Simulator - Standalone WebSocket Collaboration Server
 * Designed for $0 Free Tier hosting on Render.com Node.js Service or Docker.
 */
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'mp8085-websocket' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({ server });

// Map of roomName -> Set of { ws, user }
const rooms = new Map();

function getRoom(roomName) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  return rooms.get(roomName);
}

function broadcastToRoom(roomName, message, senderWs = null) {
  const room = rooms.get(roomName);
  if (!room) return;

  const payload = JSON.stringify(message);
  for (const client of room) {
    if (client.ws !== senderWs && client.ws.readyState === 1) { // 1 = OPEN
      client.ws.send(payload);
    }
  }
}

function sendPresenceUpdate(roomName) {
  const room = rooms.get(roomName);
  if (!room) return;

  const users = Array.from(room).map(c => c.user || { name: 'Anonymous Student' });
  const message = {
    type: 'PRESENCE_UPDATE',
    room: roomName,
    count: users.length,
    users,
    timestamp: Date.now(),
  };

  const payload = JSON.stringify(message);
  for (const client of room) {
    if (client.ws.readyState === 1) {
      client.ws.send(payload);
    }
  }
}

wss.on('connection', (ws) => {
  let currentRoom = null;
  let clientObj = { ws, user: null };

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      switch (data.type) {
        case 'JOIN': {
          if (currentRoom) {
            const oldRoom = rooms.get(currentRoom);
            if (oldRoom) {
              oldRoom.delete(clientObj);
              sendPresenceUpdate(currentRoom);
            }
          }

          currentRoom = data.room || 'general';
          clientObj.user = data.user || { name: 'Student', id: Math.random().toString(36).substring(2, 9) };

          const room = getRoom(currentRoom);
          room.add(clientObj);

          ws.send(JSON.stringify({
            type: 'JOINED',
            room: currentRoom,
            user: clientObj.user,
          }));

          sendPresenceUpdate(currentRoom);
          break;
        }

        case 'LEAVE': {
          if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
              room.delete(clientObj);
              sendPresenceUpdate(currentRoom);
            }
            currentRoom = null;
          }
          break;
        }

        case 'CURSOR':
        case 'CODE_CHANGE':
        case 'REGISTER_SYNC': {
          if (currentRoom) {
            broadcastToRoom(currentRoom, {
              ...data,
              sender: clientObj.user,
              timestamp: Date.now(),
            }, ws);
          }
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          break;
        }
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid WebSocket payload' }));
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.delete(clientObj);
        sendPresenceUpdate(currentRoom);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`[8085-WS] Collaboration WebSocket server listening on port ${PORT}`);
});
