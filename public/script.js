const socket = io();
let role = 'Spectator'; // Everyone starts as a spectator
let currentScene = '';

socket.on('connect', () => {
    console.log(`✅ Connected to WebSocket server: ${socket.id}`);
    socket.emit('ping'); // Test if server responds
});

socket.on('pong', () => {
    console.log("🔁 Pong received - WebSocket is active.");
});

socket.on('disconnect', () => {
    console.log("❌ Disconnected from WebSocket server");
});

document.getElementById('ready-checkbox').addEventListener('change', function () {
    let isReady = this.checked;
    console.log(`📢 Player (${role}) clicked "I'm Ready": ${isReady}`);
    socket.emit('playerReady', isReady);
});

document.getElementById('start-button').addEventListener('click', () => {
    console.log("⏳ Start game button clicked.");
    socket.emit('startGame');
});

document.getElementById('quit-to-menu-button').addEventListener('click', () => {
    console.log("🔄 Quit to menu clicked.");
    socket.emit('quitToMenu');
});

socket.on('assignRole', (assignedRole) => {
    role = assignedRole;
    console.log(`🎭 Assigned role: ${role}`);
    document.getElementById('role').textContent = `You are ${role}`;
});

socket.on('updateConnectionStatus', ({ players, spectators }) => {
    console.log('🔄 Updating UI with new connection status:', players, spectators);

    const scottStatus = document.getElementById('scott-status');
    const chrisStatus = document.getElementById('chris-status');
    const startButton = document.getElementById('start-button');

    const scott = Object.values(players).find(p => p.role === 'Scott');
    const chris = Object.values(players).find(p => p.role === 'Chris');

    scottStatus.textContent = scott ? 
        `Scott: ${scott.ready ? 'Ready ✔️' : 'Connected'}` : 
        'Scott: Waiting...';
    
    chrisStatus.textContent = chris ? 
        `Chris: ${chris.ready ? 'Ready ✔️' : 'Connected'}` : 
        'Chris: Waiting...';

    startButton.disabled = !(scott?.ready && chris?.ready);
});

// 🔥 Update Spectator Count in UI
socket.on('updateSpectators', (spectatorCount) => {
    console.log(`👀 Spectators: ${spectatorCount}`);
    document.getElementById('spectator-count').textContent = `Spectators: ${spectatorCount}`;
});

socket.on('startGame', () => {
    console.log("✅ Game started.");
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game').style.display = 'block';
});

socket.on('resetGame', () => {
    console.log("🔄 Resetting game UI.");
    document.getElementById('title-screen').style.display = 'block';
    document.getElementById('game').style.display = 'none';
});
