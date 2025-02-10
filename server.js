const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = new Map(); // Track all players and their readiness
let readyPlayers = new Set(); // Track players who are ready

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add player to the list
    players.set(socket.id, { ready: false });
    socket.emit('assignRole', 'Player'); // All players are treated equally

    // Broadcast updated status
    io.emit('updateConnectionStatus', { readyCount: readyPlayers.size });

    // Handle readiness
    socket.on('playerReady', (isReady) => {
        players.set(socket.id, { ready: isReady });

        if (isReady) {
            readyPlayers.add(socket.id);
        } else {
            readyPlayers.delete(socket.id);
        }

        // Start game if 2 players are ready
        if (readyPlayers.size >= 2) {
            io.emit('startGame');
        }

        // Broadcast updated status
        io.emit('updateConnectionStatus', { readyCount: readyPlayers.size });
    });

    // Handle disconnects
    socket.on('disconnect', () => {
        players.delete(socket.id);
        readyPlayers.delete(socket.id);

        // Broadcast updated status
        io.emit('updateConnectionStatus', { readyCount: readyPlayers.size });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});