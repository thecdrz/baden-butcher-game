const socket = io();
let role = '';
let currentScene = '';
const backgroundMusic = document.getElementById('background-music');
let musicPlaying = false;

// Show ready checkbox for ALL players (but only Scott/Chris matter)
document.getElementById('ready-checkbox').addEventListener('change', (event) => {
    socket.emit('playerReady', event.target.checked);
});

// Assign role (no UI hiding for spectators)
socket.on('assignRole', (assignedRole) => {
    role = assignedRole;
    document.getElementById('role').innerText = `You are ${role}`;
});

// Update UI (only Scott/Chris readiness is tracked)
socket.on('updateConnectionStatus', ({ players, spectatorCount }) => {
    const scottStatus = document.getElementById('scott-status');
    const chrisStatus = document.getElementById('chris-status');
    const spectatorCountElement = document.getElementById('spectator-count');

    // Update Scott
    scottStatus.innerText = players.scott.connected ? 
        `Scott: ${players.scott.ready ? 'Ready' : 'Connected'}` : 
        'Scott: Waiting...';
    scottStatus.style.color = players.scott.ready ? 'green' : (players.scott.connected ? 'yellow' : 'red');

    // Update Chris
    chrisStatus.innerText = players.chris.connected ? 
        `Chris: ${players.chris.ready ? 'Ready' : 'Connected'}` : 
        'Chris: Waiting...';
    chrisStatus.style.color = players.chris.ready ? 'green' : (players.chris.connected ? 'yellow' : 'red');

    // Update spectators
    spectatorCountElement.innerText = `Spectators: ${spectatorCount}`;

    // Start game if both ready
    if (players.scott.ready && players.chris.ready) {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        startGame();
    }
});

// Rest of the code (startGame, updateScene, etc.) remains the same