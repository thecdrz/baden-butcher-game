const socket = io();
let role = '';
let currentScene = '';

// UI Elements
const connectionStatus = document.getElementById('connection-status');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game');
const titleScreen = document.getElementById('title-screen');

// Ready Checkbox
document.getElementById('ready-checkbox').addEventListener('change', (e) => {
  socket.emit('playerReady', e.target.checked);
});

// Start Game Button
startButton.addEventListener('click', () => {
  socket.emit('startGame');
});

// Quit to Menu Button
document.getElementById('quit-to-menu-button').addEventListener('click', () => {
  socket.emit('quitToMenu');
  titleScreen.style.display = 'block';
  gameContainer.style.display = 'none';
  connectionStatus.style.display = 'block';
  document.getElementById('ready-checkbox').checked = false;
});

// Server Events
socket.on('assignRole', (assignedRole) => {
  role = assignedRole;
  document.getElementById('role').textContent = `You are ${role}`;
});

socket.on('updateConnectionStatus', (players) => {
  const scottStatus = document.getElementById('scott-status');
  const chrisStatus = document.getElementById('chris-status');

  scottStatus.textContent = players.scott.id ? 
    `Scott: ${players.scott.ready ? 'Ready ✔️' : 'Connected'}` : 
    'Scott: Waiting...';
  
  chrisStatus.textContent = players.chris.id ? 
    `Chris: ${players.chris.ready ? 'Ready ✔️' : 'Connected'}` : 
    'Chris: Waiting...';

  startButton.disabled = !(players.scott.ready && players.chris.ready);
});

socket.on('startGame', () => {
  titleScreen.style.display = 'none';
  gameContainer.style.display = 'block';
  connectionStatus.style.display = 'none';
  currentScene = 'intro';
  updateScene();
});

socket.on('resetGame', () => {
  document.getElementById('scott-status').textContent = 'Scott: Waiting...';
  document.getElementById('chris-status').textContent = 'Chris: Waiting...';
});

// Game Logic
function updateScene() {
  // Your existing scene update logic
}

function makeChoice(choice) {
  // Your existing choice handling logic
}