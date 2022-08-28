

const socket = io();
socket.on('connect', () => {
    console.log(socket.id);
});

socket.on('paint', paintGame);
socket.on('playerNumber', setPlayerNumber);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('gameInstructions', handleGameInstructions);
socket.on('newRound', handleNewRound);
socket.on('gameStart', init);
socket.on('timeLeft', updateTime)

const BG_COLOUR = '#f7f0f0';
const DRAWING_COLOUR = '#666666';
const GUIDE_COLOUR = '#f21111'
const PIXEL_DENSITY = 10;
const GAME_TIME = 10000;

let dragging = false;
let gameActive = false;
let canvas, ctx, canvas2, ctx2;
let playerNumber, instructions;
let currentColour = DRAWING_COLOUR;
let previousPixel = {
    x: 0, y: 0, start: true, colour:currentColour
}

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameInstructions = document.getElementById('gameInstructions');
const defaultButton = document.getElementById('default');
const greenButton = document.getElementById('green');
const blueButton = document.getElementById('blue');
const redButton = document.getElementById('red');
const brownButton = document.getElementById('brown');
const timer = document.getElementById('timer');
const waitingScreen = document.getElementById('waitingScreen');

    defaultButton.addEventListener('click', () => {
        currentColour = '#666666';
    });

    greenButton.addEventListener('click', () => {
        currentColour = '#00ff99';
    });

    blueButton.addEventListener('click', () => {
        currentColour = '#00ffff';
    });

    redButton.addEventListener('click', () => {
        currentColour = '#ff0000';
    });

    brownButton.addEventListener('click', () => {
        currentColour = '#663300';
    });

    newGameBtn.addEventListener('click', () => {
        socket.emit('newGame');
        setupWaitingScreen();
    });

    joinGameBtn.addEventListener('click', () => {
        console.log('joining' + gameCodeInput.value)
        socket.emit('joinGame', gameCodeInput.value);
    });


function setPlayerNumber(number) {
    playerNumber = number;
}

function setupWaitingScreen() {
    initialScreen.style.display = 'none';
    waitingScreen.style.display = 'block';
}

function handleGameCode(gameCode) {
    console.log(gameCode);
    gameCodeDisplay.innerText = gameCode;
}

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    waitingScreen.style.display = 'none';

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas2 = document.getElementById('canvas2');
    ctx2 = canvas2.getContext('2d');

    canvas2.style.display = 'none';

    canvas.width = 600;
    canvas.height = 300;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gameActive = true;

    document.addEventListener('mousedown', mousedown);
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', drag);
    drawGameInstructions();
    startTimer();
}

function mousedown() {
    dragging = true;
}

function mouseup() {
    dragging = false;
    previousPixel.start = true;
}

function isOutsideOfCanvas(data) {
        return (data.x > canvas.width || data.x < 0 || data.y > canvas.height || data.y < 0);
}

function drag(data) {
    if (dragging === true && gameActive === true) {

        let paintData = {
            x: data.offsetX,
            y: data.offsetY,
            colour: currentColour,
        }

        if (isOutsideOfCanvas(paintData)) {
            previousPixel.start = true;
            return;
        }

        fillInPrevPixels(paintData.x, paintData.y, previousPixel.x, previousPixel.y, previousPixel.start, currentColour);


        previousPixel.x = paintData.x;
        previousPixel.y = paintData.y;
        previousPixel.colour = paintData.colour;


        ctx.fillStyle = currentColour;
        ctx.fillRect(paintData.x, paintData.y, 5, 5);

        socket.emit('drag', paintData);

    }
}


function fillInPrevPixels(currPixelX, currPixelY, prevPixelX, prevPixelY, start, currColour) {
    if (start === false) {
        Xlength = currPixelX - prevPixelX;
        Ylength = currPixelY - prevPixelY;
        Xdelta = (Xlength / PIXEL_DENSITY);
        Ydelta = (Ylength / PIXEL_DENSITY);
        console.log(Xdelta);console.log(Ydelta);
        for (let i = 0; i < PIXEL_DENSITY; i++) {
        currPixelX += Xdelta;
        currPixelY += Ydelta;
        ctx.fillStyle = currColour;
        ctx.fillRect(currPixelX, currPixelY, 5, 5);
        socket.emit('drag', {x:currPixelX, y:currPixelY, colour: currColour});
        }
    } else {
        previousPixel.start = false;
    }
}


function handleGameInstructions(currentInstructions) {
    instructions = currentInstructions;
}

function drawGameInstructions() {
    gameInstructions.innerText = instructions;
    if(instructions === "head") {
        ctx.fillStyle = GUIDE_COLOUR;
        ctx.fillRect(275, 290, 5, 10);
        ctx.fillRect(325, 290, 5, 10);
    }else if(instructions === "legs") {
        ctx.fillStyle = GUIDE_COLOUR;
        ctx.fillRect(275, 0, 5, 10);
        ctx.fillRect(325, 0, 5, 10);
    }
}

function click(e) {
    //console.log(e);
    ctx.fillStyle = DRAWING_COLOUR;
    ctx.fillRect(e.x, e.y, 5, 5);
        //socket.emit('drag', e);
}

function paintGame(player, ctx) {

    player.paint.forEach(cell => {
        ctx.fillStyle = cell.colour;
        ctx.fillRect(cell.x, cell.y, 5, 5);
    });

}

function handleUnknownGame() {
    reset();
    alert("Unknown game code");
}

function handleTooManyPlayers() {
    reset();
    alert("This game is already in progress");
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}

function handleGameOver(state) {
    console.log(state);
    gameInstructions.innerText = "nothing!";
    defaultButton.style.display = 'none';
    greenButton.style.display = 'none';
    blueButton.style.display = 'none';
    redButton.style.display = 'none';
    brownButton.style.display = 'none';
    canvas2.style.display = 'flex';
    canvas.style.display = 'flex';

    canvas.height = 600;
    canvas2.height = canvas2.width = 600;

    ctx2.fillStyle = BG_COLOUR;
    ctx2.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    paintGame(state.players[0], ctx);
    paintGame(state.players[1], ctx);
    paintGame(state.players[2], ctx2);
    paintGame(state.players[3], ctx2);

    gameActive = false;
}

function handleNewRound() {
    if(gameInstructions.innerText === "head") {
        handleGameInstructions("legs");
    } else if(gameInstructions.innerText === "legs") {
        handleGameInstructions("head");
    } 
    
    init();
}

function updateTime(currentTime) {
    timer.innerText = currentTime;
    if (currentTime < 0) {
        timer.innerText = "Round Over!";
    }
}