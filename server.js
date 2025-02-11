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

const players = {};
const spectators = new Set(); // Store spectators

io.on('connection', (socket) => {
    console.log(`🟢 New Connection: ${socket.id} - Total Users Connected: ${Object.keys(players).length + spectators.size + 1}`);

    let assignedRole = 'Spectator';

    // Assign roles dynamically only if not taken
    if (!Object.values(players).some(p => p.role === 'Scott')) {
        players[socket.id] = { id: socket.id, role: 'Scott', ready: false };
        assignedRole = 'Scott';
    } else if (!Object.values(players).some(p => p.role === 'Chris')) {
        players[socket.id] = { id: socket.id, role: 'Chris', ready: false };
        assignedRole = 'Chris';
    } else {
        spectators.add(socket.id);
    }

    console.log(`🎭 Assigned role to ${socket.id}: ${assignedRole}`);
    socket.emit('assignRole', assignedRole);
    io.emit('updateConnectionStatus', { players, spectators: [...spectators] });

    // Debug: Ensure connections are counted properly
    socket.on('ping', () => {
        console.log(`🔁 Ping received from ${socket.id}`);
        socket.emit('pong');
    });

    // Handle readiness updates
    socket.on('playerReady', (isReady) => {
        console.log(`📢 Player ${socket.id} clicked "I'm Ready": ${isReady}`);

        if (players[socket.id]) {
            players[socket.id].ready = isReady;
        } else {
            console.log(`🚫 Spectator ${socket.id} clicked Ready (Ignored)`);
        }

        console.log(`🔵 Readiness Updated:`, players);
        io.emit('updateConnectionStatus', { players, spectators: [...spectators] });
    });

    // Start game when both players are ready
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

    // Reset the game
    socket.on('quitToMenu', () => {
        console.log(`🔄 Game reset requested.`);
        Object.keys(players).forEach(id => {
            players[id].ready = false;
        });
        io.emit('resetGame');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id}`);

        if (players[socket.id]) {
            console.log(`❌ ${players[socket.id].role} left the game.`);
            delete players[socket.id];
        } else {
            spectators.delete(socket.id);
        }

        io.emit('updateConnectionStatus', { players, spectators: [...spectators] });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
