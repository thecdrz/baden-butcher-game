const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static('public'));

// Track players
let players = {
    scott: { id: null, connected: false, ready: false },
    chris: { id: null, connected: false, ready: false }
};

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Assign Scott or Chris role
    if (!players.scott.connected) {
        players.scott.id = socket.id;
        players.scott.connected = true;
        socket.emit('assignRole', 'Scott');
    } else if (!players.chris.connected) {
        players.chris.id = socket.id;
        players.chris.connected = true;
        socket.emit('assignRole', 'Chris');
    } else {
        socket.emit('gameFull');
        socket.disconnect();
    }

    // Broadcast status to all players
    io.emit('updateConnectionStatus', players);

    // Handle readiness
    socket.on('playerReady', (isReady) => {
        if (players.scott.id === socket.id) {
            players.scott.ready = isReady;
        } else if (players.chris.id === socket.id) {
            players.chris.ready = isReady;
        }
        io.emit('updateConnectionStatus', players);
    });

    // Handle choices
    socket.on('playerChoice', (choice) => {
        io.emit('updateGame', { player: socket.id, choice });
    });

    // Handle quitting to menu
    socket.on('quitToMenu', () => {
        if (players.scott.id === socket.id) {
            players.scott.connected = false;
            players.scott.ready = false;
            players.scott.id = null;
        } else if (players.chris.id === socket.id) {
            players.chris.connected = false;
            players.chris.ready = false;
            players.chris.id = null;
        }
        io.emit('updateConnectionStatus', players);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (players.scott.id === socket.id) {
            players.scott.connected = false;
            players.scott.ready = false;
            players.scott.id = null;
        } else if (players.chris.id === socket.id) {
            players.chris.connected = false;
            players.chris.ready = false;
            players.chris.id = null;
        }
        io.emit('updateConnectionStatus', players);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});