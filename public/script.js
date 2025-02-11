const socket = io();
let role = '';
let currentScene = '';

document.getElementById('ready-checkbox').addEventListener('change', (e) => {
    socket.emit('playerReady', e.target.checked);
});

document.getElementById('start-button').addEventListener('click', () => {
    socket.emit('startGame');
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
});

socket.on('updateConnectionStatus', (players) => {
    const scottStatus = document.getElementById('scott-status');
    const chrisStatus = document.getElementById('chris-status');
    const startButton = document.getElementById('start-button');

    scottStatus.textContent = players.scott.id ? 
        `Scott: ${players.scott.ready ? 'Ready ✔️' : 'Connected'}` : 
        'Scott: Waiting...';
    
    chrisStatus.textContent = players.chris.id ? 
        `Chris: ${players.chris.ready ? 'Ready ✔️' : 'Connected'}` : 
        'Chris: Waiting...';

    startButton.disabled = !(players.scott.ready && players.chris.ready);
});

socket.on('startGame', () => {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('connection-status').style.display = 'none';
    currentScene = 'intro';
    updateScene();
});

socket.on('resetGame', () => {
    document.getElementById('scott-status').textContent = 'Scott: Waiting...';
    document.getElementById('chris-status').textContent = 'Chris: Waiting...';
});

function updateScene() {
    // Your existing scene update logic
}

function makeChoice(choice) {
    // Your existing choice handling logic
}