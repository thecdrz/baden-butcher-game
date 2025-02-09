const socket = io();

let role = '';
let currentScene = '';

// Show title screen initially
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    socket.emit('readyToPlay');
});

// Assign role and start the game
socket.on('assignRole', (assignedRole) => {
    role = assignedRole;
    document.getElementById('role').innerText = `You are ${role}`;
    updateConnectionStatus();
    startGame();
});

// Update connection status when Player 2 connects
socket.on('playerConnected', () => {
    updateConnectionStatus();
});

// Handle game updates
socket.on('updateGame', (data) => {
    console.log(`${data.player} chose: ${data.choice}`);
    updateScene(data.choice);
});

// Handle game full scenario
socket.on('gameFull', () => {
    document.getElementById('scene').innerText = 'The game is full. Please try again later.';
});

// Update connection status
function updateConnectionStatus() {
    const status = document.getElementById('connection-status');
    if (role === 'Scott') {
        status.innerText = 'Waiting for Chris to connect...';
    } else if (role === 'Chris') {
        status.innerText = 'Connected as Chris. Ready to play!';
    }
}

// Start the game
function startGame() {
    currentScene = 'intro';
    updateScene();
}

// Update the scene based on the current state
function updateScene(choice) {
    let sceneText = '';
    let choices = [];

    switch (currentScene) {
        case 'intro':
            sceneText = `It’s a quiet, foggy evening in the small town of Baden. You and your best friend, ${role === 'Scott' ? 'Chris' : 'Scott'}, have been inseparable for over 30 years. But tonight, something feels… off. The streets are empty, the air is thick with tension, and the legend of the Baden Butcher seems more real than ever. As you walk through the dimly lit streets, you hear footsteps behind you. The chase begins.`;
            choices = ['Head to the church', 'Take the alleyway'];
            break;
        case 'church':
            sceneText = 'You rush into the church, slamming the door behind you. The air inside is cold, and the faint sound of organ music echoes through the halls.';
            choices = ['Investigate the organ', 'Search for an exit'];
            break;
        case 'alleyway':
            sceneText = 'You sprint down the alleyway, but the footsteps grow louder. Suddenly, a shadow blocks your path.';
            choices = ['Confront the shadow', 'Turn back'];
            break;
        default:
            sceneText = 'The game has ended.';
    }

    document.getElementById('scene').innerText = sceneText;
    renderChoices(choices);
}

// Render choices as buttons
function renderChoices(choices) {
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.innerText = choice;
        button.onclick = () => makeChoice(index + 1);
        choicesDiv.appendChild(button);
    });
}

// Send player choice to the server
function makeChoice(choice) {
    socket.emit('playerChoice', choice);
    currentScene = choice === 1 ? 'church' : 'alleyway';
    updateScene();
}