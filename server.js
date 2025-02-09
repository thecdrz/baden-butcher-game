const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {
    scott: { id: null, connected: false, ready: false },
    chris: { id: null, connected: false, ready: false }
};
let spectators = new Set();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Assign Scott/Chris or Spectator
    if (!players.scott.connected) {
        players.scott.id = socket.id;
        players.scott.connected = true;
        socket.emit('assignRole', 'Scott');
    } else if (!players.chris.connected) {
        players.chris.id = socket.id;
        players.chris.connected = true;
        socket.emit('assignRole', 'Chris');
    } else {
        spectators.add(socket.id);
        socket.emit('assignRole', 'Spectator');
    }

    io.emit('updateConnectionStatus', { players, spectatorCount: spectators.size });

    // Handle readiness (only Scott/Chris can affect the game)
    socket.on('playerReady', (isReady) => {
        if (players.scott.id === socket.id) {
            players.scott.ready = isReady;
        } else if (players.chris.id === socket.id) {
            players.chris.ready = isReady;
        }
        io.emit('updateConnectionStatus', { players, spectatorCount: spectators.size });
    });

    // Handle choices (only Scott/Chris)
    socket.on('playerChoice', (choice) => {
        if (players.scott.id === socket.id || players.chris.id === socket.id) {
            io.emit('updateGame', { player: socket.id, choice });
        }
    });

    // Handle disconnects
    socket.on('disconnect', () => {
        if (players.scott.id === socket.id) {
            players.scott.connected = false;
            players.scott.ready = false;
            players.scott.id = null;
        } else if (players.chris.id === socket.id) {
            players.chris.connected = false;
            players.chris.ready = false;
            players.chris.id = null;
        } else {
            spectators.delete(socket.id);
        }
        io.emit('updateConnectionStatus', { players, spectatorCount: spectators.size });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});