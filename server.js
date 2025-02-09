const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Track connected players
let players = {};

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Assign roles (Scott or Chris)
    if (!players.scott) {
        players.scott = socket.id;
        socket.emit('assignRole', 'Scott');
    } else if (!players.chris) {
        players.chris = socket.id;
        socket.emit('assignRole', 'Chris');
        io.emit('playerConnected'); // Notify both players that Chris has connected
    } else {
        socket.emit('gameFull');
        socket.disconnect();
    }

    // Handle player choices
    socket.on('playerChoice', (choice) => {
        console.log(`Player ${socket.id} chose: ${choice}`);
        io.emit('updateGame', { player: socket.id, choice });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        if (players.scott === socket.id) {
            delete players.scott;
        } else if (players.chris === socket.id) {
            delete players.chris;
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});