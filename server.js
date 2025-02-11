const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'));

const players = {}; // Stores assigned players (Scott & Chris)
const spectators = new Set(); // Stores all spectators

io.on('connection', (socket) => {
    console.log(`🟢 New Connection: ${socket.id} - Total Users: ${Object.keys(players).length + spectators.size + 1}`);

    // Everyone starts as a spectator
    spectators.add(socket.id);
    console.log(`👀 ${socket.id} joined as a spectator.`);
    
    // Send updated player & spectator count to all clients
    io.emit('updateConnectionStatus', { players, spectators: [...spectators] });

    // Send the initial spectator count
    io.emit('updateSpectators', spectators.size);

    // Handle when a user clicks "I'm Ready"
    socket.on('playerReady', (isReady) => {
        console.log(`📢 Player ${socket.id} clicked "I'm Ready": ${isReady}`);

        // If they are clicking "I'm Ready" for the first time, assign them a role if available
        if (isReady && spectators.has(socket.id)) {
            if (!Object.values(players).some(p => p.role === 'Scott')) {
                players[socket.id] = { id: socket.id, role: 'Scott', ready: true };
                spectators.delete(socket.id);
                console.log(`🧑‍🎤 ${socket.id} is now Scott.`);
            } else if (!Object.values(players).some(p => p.role === 'Chris')) {
                players[socket.id] = { id: socket.id, role: 'Chris', ready: true };
                spectators.delete(socket.id);
                console.log(`🧑‍🎤 ${socket.id} is now Chris.`);
            } else {
                console.log(`🚫 ${socket.id} clicked Ready but Scott & Chris are already taken.`);
            }
        } else if (players[socket.id]) {
            // If they are already a player, update their readiness
            players[socket.id].ready = isReady;
        }

        // Update all clients with new spectator and player info
        io.emit('updateConnectionStatus', { players, spectators: [...spectators] });
        io.emit('updateSpectators', spectators.size);
    });

    // Handle Game Start
    socket.on('startGame', () => {
        console.log(`⏳ Start game request received from ${socket.id}`);

        const scott = Object.values(players).find(p => p.role === 'Scott');
        const chris = Object.values(players).find(p => p.role === 'Chris');

        if (scott?.ready && chris?.ready) {
            console.log("✅ Both players ready. Starting game...");
            io.emit('startGame');
        } else {
            console.log("❌ Cannot start game - not all players are ready.");
        }
    });

    // Handle Game Reset
    socket.on('quitToMenu', () => {
        console.log(`🔄 Game reset requested.`);
        Object.keys(players).forEach(id => {
            players[id].ready = false;
        });
        io.emit('resetGame');
    });

    // Handle Disconnects
    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id}`);

        if (players[socket.id]) {
            console.log(`❌ ${players[socket.id].role} left the game.`);
            delete players[socket.id];
        } else {
            spectators.delete(socket.id);
        }

        // Update all clients
        io.emit('updateSpectators', spectators.size);
        io.emit('updateConnectionStatus', { players, spectators: [...spectators] });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
