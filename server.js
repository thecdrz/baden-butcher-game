const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {
  scott: { id: null, ready: false },
  chris: { id: null, ready: false }
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Assign roles dynamically
  if (!players.scott.id) {
    players.scott.id = socket.id;
    socket.emit('assignRole', 'Scott');
  } else if (!players.chris.id) {
    players.chris.id = socket.id;
    socket.emit('assignRole', 'Chris');
  } else {
    socket.emit('assignRole', 'Spectator'); // If more than 2 players connect
  }

  io.emit('updateConnectionStatus', players);

  // Handle readiness
  socket.on('playerReady', (isReady) => {
    if (socket.id === players.scott.id) {
      players.scott.ready = isReady;
    } else if (socket.id === players.chris.id) {
      players.chris.ready = isReady;
    }

    io.emit('updateConnectionStatus', players);

    // **Ensure game starts immediately when both are ready**
    if (players.scott.ready && players.chris.ready) {
      io.emit('startGame');
    }
  });

  // Handle game start request
  socket.on('startGame', () => {
    if (players.scott.ready && players.chris.ready) {
      io.emit('startGame');
    }
  });

  // Handle menu reset
  socket.on('quitToMenu', () => {
    players = {
      scott: { id: null, ready: false },
      chris: { id: null, ready: false }
    };
    io.emit('resetGame');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.id === players.scott.id) {
      players.scott = { id: null, ready: false };
    } else if (socket.id === players.chris.id) {
      players.chris = { id: null, ready: false };
    }
    io.emit('updateConnectionStatus', players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
