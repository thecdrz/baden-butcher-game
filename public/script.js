const socket = io();
let role = 'Player';
let currentScene = '';
const backgroundMusic = document.getElementById('background-music');
let musicPlaying = false;

// Ready Checkbox
document.getElementById('ready-checkbox').addEventListener('change', (event) => {
    socket.emit('playerReady', event.target.checked);
});

// Update UI with ready count
socket.on('updateConnectionStatus', ({ readyCount, spectatorCount }) => {
    document.getElementById('ready-count').innerText = `Players Ready: ${readyCount}/2`;
    document.getElementById('spectator-count').innerText = spectatorCount;
});

// Start game when 2 players are ready
socket.on('startGame', () => {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    startGame();
});

// Chat functionality
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim()) {
        socket.emit('sendMessage', chatInput.value.trim());
        chatInput.value = '';
    }
});

socket.on('receiveMessage', (message) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Start Game Logic
function startGame() {
    currentScene = 'intro';
    updateScene();
    startBackgroundMusic();
}

// Background Music
function startBackgroundMusic() {
    if (!musicPlaying) {
        backgroundMusic.play()
            .then(() => musicPlaying = true)
            .catch(error => console.log('Autoplay blocked:', error));
    }
}

// Scene Updates
function updateScene(choice) {
    let sceneText = '';
    let choices = [];

    switch (currentScene) {
        case 'intro':
            sceneText = `It’s a quiet, foggy evening in the small town of Baden. You and your best friend have been inseparable for over 30 years. But tonight, something feels… off. The streets are empty, the air is thick with tension, and the legend of the Baden Butcher seems more real than ever. As you walk through the dimly lit streets, you hear footsteps behind you. The chase begins.`;
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

// Render Choices
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

// Send Choice to Server
function makeChoice(choice) {
    socket.emit('playerChoice', choice);
    currentScene = choice === 1 ? 'church' : 'alleyway';
    updateScene();
}