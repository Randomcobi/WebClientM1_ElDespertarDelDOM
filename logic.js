const STORAGE_KEY = 'simon-dice-high-score';
const FLASH_MS = 450;
const GAP_MS = 200;
const PRESS_MS = 200;

const cells = document.querySelectorAll('.cell');
const startButton = document.querySelector('#start');
const statusText = document.querySelector('#status');
const roundText = document.querySelector('#round');
const highScoreText = document.querySelector('#high-score');
const resultPanel = document.querySelector('#result');
const finalScoreText = document.querySelector('#final-score');
const finalHighScoreText = document.querySelector('#final-high-score');
const recordMessage = document.querySelector('#record-message');

let sequence = [];
let playerStep = 0;
let acceptingInput = false;
let highScore = loadHighScore();

function loadHighScore() {
    try {
        return Number(localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
        return 0;
    }
}

function saveHighScore(score) {
    try {
        localStorage.setItem(STORAGE_KEY, String(score));
    } catch {
        // Sin almacenamiento: el récord solo dura lo que dure la página
    }
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function light(index, duration) {
    cells[index].classList.add('active');
    await wait(duration);
    cells[index].classList.remove('active');
}

async function playSequence() {
    acceptingInput = false;
    statusText.textContent = 'Memoriza la combinación…';
    await wait(600);

    for (const index of sequence) {
        await light(index, FLASH_MS);
        await wait(GAP_MS);
    }

    playerStep = 0;
    statusText.textContent = 'Tu turno';
    acceptingInput = true;
}

function nextRound() {
    sequence.push(Math.floor(Math.random() * cells.length));
    roundText.textContent = sequence.length;
    playSequence();
}

function startGame() {
    sequence = [];
    playerStep = 0;
    resultPanel.hidden = true;
    startButton.disabled = true;
    roundText.textContent = 0;
    nextRound();
}

async function endGame(wrongIndex) {
    acceptingInput = false;

    const score = sequence.length - 1;
    const isRecord = score > highScore;
    if (isRecord) {
        highScore = score;
        saveHighScore(highScore);
    }

    highScoreText.textContent = highScore;
    finalScoreText.textContent = score;
    finalHighScoreText.textContent = highScore;
    recordMessage.hidden = !isRecord;
    resultPanel.hidden = false;
    statusText.textContent = 'Has fallado';
    startButton.textContent = 'Jugar de nuevo';
    startButton.disabled = false;

    cells[wrongIndex].classList.add('wrong');
    await wait(700);
    cells[wrongIndex].classList.remove('wrong');
}

async function handleCellClick(event) {
    if (!acceptingInput) {
        return;
    }

    const index = Number(event.currentTarget.dataset.index);

    if (index !== sequence[playerStep]) {
        endGame(index);
        return;
    }

    light(index, PRESS_MS);
    playerStep++;

    if (playerStep === sequence.length) {
        acceptingInput = false;
        statusText.textContent = '¡Bien!';
        await wait(800);
        nextRound();
    }
}

highScoreText.textContent = highScore;
startButton.addEventListener('click', startGame);
cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
