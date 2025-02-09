const socket = io();

let role = '';
let currentScene = '';
let isReady = false;
const backgroundMusic = document.getElementById('background-music');
let musicPlaying = false;

// Title Screen: Start Button
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    socket.emit('readyToPlay');
});

// Quit Game Button
document.getElementById('quit-game-button').addEventListener('click', () => {
    window.close();
});

// Quit to Menu Button
document.getElementById('quit-to-menu-button').addEventListener('click', () => {
    document.getElementById('game').style.display = 'none';
    document.getElementById('title-screen').style.display = 'block';
    socket.emit('quitToMenu');
});

// Ready Checkbox (Only for Scott and Chris)
const readySection = document.getElementById('ready-section');
const readyCheckbox = document.getElementById('ready-checkbox');
readyCheckbox.addEventListener('change', (event) => {
    isReady = event.target.checked;
    socket.emit('playerReady', isReady);
});

// Music Toggle
document.getElementById('music-toggle').addEventListener('click', () => {
    if (musicPlaying) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play();
    }
    musicPlaying = !musicPlaying;
});

// Assign Role
socket.on('assignRole', (assignedRole) => {
    role = assignedRole;
    document.getElementById('role').innerText = `You are ${role}`;

    // Show ready checkbox only for Scott and Chris
    if (role === 'Scott' || role === 'Chris') {
        readySection.style.display = 'block';
    } else {
        readySection.style.display = 'none';
    }
});

// Update Connection Status
socket.on('updateConnectionStatus', ({ players, spectatorCount }) => {
    const scottStatus = document.getElementById('scott-status');
    const chrisStatus = document.getElementById('chris-status');
    const spectatorCountElement = document.getElementById('spectator-count');
    const gameSpectatorCount = document.getElementById('game-spectator-count');

    // Update Scott
    if (players.scott.connected) {
        scottStatus.innerText = `Scott: ${players.scott.ready ? 'Ready' : 'Connected'}`;
        scottStatus.style.color = players.scott.ready ? 'green' : 'yellow';
    } else {
        scottStatus.innerText = 'Scott: Waiting...';
        scottStatus.style.color = 'red';
    }

    // Update Chris
    if (players.chris.connected) {
        chrisStatus.innerText = `Chris: ${players.chris.ready ? 'Ready' : 'Connected'}`;
        chrisStatus.style.color = players.chris.ready ? 'green' : 'yellow';
    } else {
        chrisStatus.innerText = 'Chris: Waiting...';
        chrisStatus.style.color = 'red';
    }

    // Update spectator count
    spectatorCountElement.innerText = `Spectators: ${spectatorCount}`;
    gameSpectatorCount.innerText = spectatorCount;

    // Auto-start game if both ready
    if (players.scott.ready && players.chris.ready) {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        startGame();
    }
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