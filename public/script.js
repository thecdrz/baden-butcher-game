const socket = io();
let role = '';
let currentScene = '';

document.getElementById('ready-checkbox').addEventListener('change', (e) => {
    if (role !== 'Spectator') {
        socket.emit('playerReady', e.target.checked);
    }
});

document.getElementById('start-button').addEventListener('click', () => {
    if (role !== 'Spectator') {
        socket.emit('startGame');
    }
});

document.getElementById('quit-to-menu-button').addEventListener('click', () => {
    socket.emit('quitToMenu');
    document.getElementById('title-screen').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('connection-status').style.display = 'block';
    document.getElementById('ready-checkbox').checked = false;
});

socket.on('assignRole', (assignedRole) => {
    role = assignedRole;
    document.getElementById('role').textContent = `You are ${role}`;
    
    // Spectators cannot interact with the game
    if (role === 'Spectator') {
        document.getElementById('ready-checkbox').disabled = true;
        document.getElementById('start-button').disabled = true;
    }
});

socket.on('updateConnectionStatus', (players) => {
    console.log('Updating UI with new connection status:', players);

    const scottStatus = document.getElementById('scott-status');
    const chrisStatus = document.getElementById('chris-status');
    const startButton = document.getElementById('start-button');

    scottStatus.textContent = players.scott.id ? 
        `Scott: ${players.scott.ready ? 'Ready ✔
