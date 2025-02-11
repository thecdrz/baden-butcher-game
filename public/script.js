const socket = io("https://baden-butcher.onrender.com"); // Change this URL to match your Render deployment

let role = '';
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
    if (role !== 'Spectator') {
        let isReady = this.checked;
        console.log(`📢 Player (${role}) clicked "I'm Ready": ${isReady}`);
        socket.emit('playerReady', isReady);
    } else {
        console.log("🚫 Spectators cannot select Ready.");
    }
});

document.getElementById('start-button').addEventListener('click', () => {
    if (role !== 'Spectator') {
        console.log("⏳ Start game button clicked.");
        socket.emit('startGame');
    } else {
        console.log("🚫 Spectators cannot start the game.");
    }
});

document.getElementById('quit-to-menu-button').addEventListener('click', () => {
    console.log("🔄 Quit to menu clicked.");
    socket.emit('quitToMenu');
});

socket.on('assignRole', (assignedRole) => {
    role = assignedRole;
    console.log(`🎭 Assigned role: ${role}`);
    document.getElementById('role').textContent = `You are ${role}`;

    if (role === 'Spectator') {
        document.getElementById('ready-checkbox').disabled = true;
        document.getElementById('start-button').disabled = true;
    } else {
        document.getElementById('ready-checkbox').disabled = false; // 🔥 Ensure it's enabled for Chris
    }
});

socket.on('updateConnectionStatus', ({ players, spectators }) => {
    console.log('🔄 Updating UI with new connection status:', players);

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

    // 🔥 Ensure the checkbox is enabled for both players
    if (role === 'Scott' || role === 'Chris') {
        document.getElementById('ready-checkbox').disabled = false;
    }

    // 🔥 Ensure Chris's checkbox updates correctly
    if (role === 'Scott') {
        document.getElementById('ready-checkbox').checked = scott?.ready || false;
    } else if (role === 'Chris') {
        document.getElementById('ready-checkbox').checked = chris?.ready || false;
    }

    startButton.disabled = !(scott?.ready && chris?.ready);
});

socket.on('startGame', () => {
    if (role !== 'Spectator') {
        console.log("✅ Game started.");
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game').style.display = 'block';
    }
});

socket.on('resetGame', () => {
    console.log("🔄 Resetting game UI.");
    document.getElementById('title-screen').style.display = 'block';
    document.getElementById('game').style.display = 'none';
});
