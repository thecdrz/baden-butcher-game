const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = new Map();
let readyPlayers = new Set();
let spectators = new Set();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Track connection
    players.set(socket.id, { ready: false });
    socket.emit('assignRole', 'Player');

    // Handle messages
    socket.on('sendMessage', (message) => {
        io.emit('receiveMessage', `Player ${socket.id.slice(0, 4)}: ${message}`);
    });

    // Handle readiness
    socket.on('playerReady', (isReady) => {
        players.set(socket.id, { ready: isReady });
        isReady ? readyPlayers.add(socket.id) : readyPlayers.delete(socket.id);
        
        // Update status
        io.emit('updateConnectionStatus', { 
            readyCount: readyPlayers.size,
            spectatorCount: spectators.size
        });

        // Start game when 2 players are ready
        if (readyPlayers.size >= 2) io.emit('startGame');
    });

    // Handle disconnects
    socket.on('disconnect', () => {
        players.delete(socket.id);
        readyPlayers.delete(socket.id);
        spectators.delete(socket.id);
        
        io.emit('updateConnectionStatus', { 
            readyCount: readyPlayers.size,
            spectatorCount: spectators.size
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});