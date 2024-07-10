const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const board = [];
let currentPiece;
let currentX;
let currentY;
let score = 0;
let time = 0;
let gameInterval;
let timerInterval;
let gameSpeed = 1000; // Velocidad inicial: 1 segundo
const backgroundMusic = document.getElementById('background-music');
const dropSound = document.getElementById('drop-sound');
const clearSound = document.getElementById('clear-sound');


const pieces = [
    { shape: [[1, 1, 1, 1]], color: 'cyan' },
    { shape: [[1, 1], [1, 1]], color: 'yellow' },
    { shape: [[1, 1, 1], [0, 1, 0]], color: 'purple' },
    { shape: [[1, 1, 1], [1, 0, 0]], color: 'blue' },
    { shape: [[1, 1, 1], [0, 0, 1]], color: 'orange' },
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'green' },
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'red' }
];

let bag = [];

function shuffleBag() {
    bag = [...pieces];
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
}

function getNextPiece() {
    if (bag.length === 0) {
        shuffleBag();
    }
    return bag.pop();
}

function initBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // Limpiar el tablero
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        board[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y][x] = 0;
            const cell = document.createElement('div');
            cell.id = `cell-${x}-${y}`;
            gameBoard.appendChild(cell);
        }
    }
}

function drawBoard() {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.getElementById(`cell-${x}-${y}`);
            cell.className = board[y][x] ? `block ${board[y][x]}` : '';
        }
    }
}

function createPiece() {
    currentPiece = getNextPiece();
    currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
}

function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const cell = document.getElementById(`cell-${currentX + x}-${currentY + y}`);
                if (cell) {
                    cell.classList.add('block', currentPiece.color);
                }
            }
        });
    });
}

function erasePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const cell = document.getElementById(`cell-${currentX + x}-${currentY + y}`);
                if (cell) {
                    cell.classList.remove('block', currentPiece.color);
                }
            }
        });
    });
}

function canMoveTo(newX, newY, newPiece) {
    for (let y = 0; y < newPiece.length; y++) {
        for (let x = 0; x < newPiece[y].length; x++) {
            if (newPiece[y][x]) {
                if (newY + y >= BOARD_HEIGHT || newX + x < 0 || newX + x >= BOARD_WIDTH || board[newY + y][newX + x]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function rotate() {
    const newPiece = currentPiece.shape[0].map((val, index) => 
        currentPiece.shape.map(row => row[index]).reverse()
    );
    if (canMoveTo(currentX, currentY, newPiece)) {
        erasePiece();
        eraseGhost();
        currentPiece.shape = newPiece;
        drawPiece();
        drawGhost();
    }
}

function moveDown() {
    if (canMoveTo(currentX, currentY + 1, currentPiece.shape)) {
        erasePiece();
        eraseGhost();
        currentY++;
        drawPiece();
        drawGhost();
    } else {
        freezePiece();
        drawBoard();
        clearLines();
        createPiece();
        drawGhost();
        if (!canMoveTo(currentX, currentY, currentPiece.shape)) {
            endGame();
        }
    }
}

function moveLeft() {
    if (canMoveTo(currentX - 1, currentY, currentPiece.shape)) {
        erasePiece();
        eraseGhost();
        currentX--;
        drawPiece();
        drawGhost();
    }
}

function moveRight() {
    if (canMoveTo(currentX + 1, currentY, currentPiece.shape)) {
        erasePiece();
        eraseGhost();
        currentX++;
        drawPiece();
        drawGhost();
    }
}

function freezePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentY + y][currentX + x] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        updateScore();
        drawBoard();
        playClearSound();
    }
}

function updateScore() {
    document.getElementById('score-value').textContent = score;
}

function drawGhost() {
    let ghostY = currentY;
    while (canMoveTo(currentX, ghostY + 1, currentPiece.shape)) {
        ghostY++;
    }
    
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const cell = document.getElementById(`cell-${currentX + x}-${ghostY + y}`);
                if (cell && !cell.classList.contains('block')) {
                    cell.classList.add('ghost');
                }
            }
        });
    });
}

function eraseGhost() {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.getElementById(`cell-${x}-${y}`);
            if (cell) {
                cell.classList.remove('ghost');
            }
        }
    }
}

function playBackgroundMusic() {
    backgroundMusic.play();
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function playDropSound() {
    dropSound.currentTime = 0;
    dropSound.play();
}

function playClearSound() {
    clearSound.currentTime = 0;
    clearSound.play();
}

function dropPiece() {
    while (canMoveTo(currentX, currentY + 1, currentPiece.shape)) {
        erasePiece();
        currentY++;
    }
    drawPiece();
    freezePiece();
    drawBoard();
    clearLines();
    createPiece();
    drawGhost();
    playDropSound();
    if (!canMoveTo(currentX, currentY, currentPiece.shape)) {
        endGame();
    }
}

function handleKeyPress(event) {
    switch(event.keyCode) {
        case 37: // Left arrow
            moveLeft();
            break;
        case 39: // Right arrow
            moveRight();
            break;
        case 40: // Down arrow
            moveDown();
            break;
        case 38: // Up arrow
            rotate();
            break;
        case 32: // Space
            dropPiece();
            break;
    }
}

function updateTimer() {
    time++;
    document.getElementById('timer-value').textContent = time;
    
    if (time % 30 === 0 && gameSpeed > 100) {
        gameSpeed = Math.max(100, gameSpeed - 100);
        clearInterval(gameInterval);
        gameInterval = setInterval(moveDown, gameSpeed);
        console.log("Velocidad aumentada. Nueva velocidad: " + gameSpeed);
    }
}

function startGame() {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-board').classList.remove('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    initGame();
    document.addEventListener('keydown', handleKeyPress);
    gameInterval = setInterval(moveDown, gameSpeed);
    timerInterval = setInterval(updateTimer, 1000);
    playBackgroundMusic();
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    stopBackgroundMusic();
    alert('Game Over! Tu puntuación: ' + score + '. Tiempo: ' + time + ' segundos');
    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('sidebar').classList.add('hidden');
}

function initGame() {
    initBoard();
    shuffleBag();
    createPiece();
    drawBoard();
    drawPiece();
    drawGhost();
    score = 0;
    time = 0;
    gameSpeed = 1000;
    updateScore();
    document.getElementById('timer-value').textContent = '0';
}

function restartGame() {
    stopBackgroundMusic();
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    initGame();
    gameInterval = setInterval(moveDown, gameSpeed);
    timerInterval = setInterval(updateTimer, 1000);
    playBackgroundMusic();
}

document.getElementById('restart-button').addEventListener('click', restartGame);
document.getElementById('start-button').addEventListener('click', startGame);