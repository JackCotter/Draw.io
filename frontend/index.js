

const socket = io('http://localhost:8080');

socket.on('paint', paintGame);
socket.on('playerNumber', setPlayerNumber);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);

const BG_COLOUR = '#231f20';
const DRAWING_COLOUR = '#666666';
const PIXEL_DENSITY = 100;

let dragging = false;
let gameActive = false;
let canvas, ctx;
let playerNumber;
let previousPixel = {
    x:0, y:0, start: true
}

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', () => {
    socket.emit('newGame');
    init();
});

joinGameBtn.addEventListener('click', () => {
    console.log('joining' + gameCodeInput.value)
    socket.emit('joinGame', gameCodeInput.value);
    init();
});


function setPlayerNumber(number) {
    playerNumber = number;
}

function handleGameCode(gameCode){
    console.log(gameCode);
    gameCodeDisplay.innerText = gameCode;
}

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = "block";


    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gameActive = true;

    document.addEventListener('keydown', keydown);
    document.addEventListener('mousedown', mousedown);
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', drag);
}

function mousedown() {
    dragging = true;
}

function mouseup() {
    dragging = false;
}

function drag (data){
    if (dragging === true && gameActive === true) {

        let paintData = {
            x: data.offsetX,
            y: data.offsetY,
            colour: DRAWING_COLOUR,
        }

        fillInPrevPixels(paintData, previousPixel);

        previousPixel.x = paintData.x;
        previousPixel.y = paintData.y;

        ctx.fillStyle = DRAWING_COLOUR;
        ctx.fillRect(paintData.x, paintData.y, 5, 5);

        socket.emit('drag', paintData);
        
    }
}


function fillInPrevPixels(currPixel, prevPixel) {
    if (prevPixel.start = false) {
        Xlength = currPixel.x - prevPixel.x;
        Ylength = currPixel.y - prevPixel.y;
        Xdelta = Math.ceil(Xlength/PIXEL_DENSITY);
        Ydelta = Math.ceil(Ylength/PIXEL_DENSITY);
        for(let i = 0; i<PIXEL_DENSITY; i++) {
            currPixel.x += Xdelta;
            currPixel.y += Ydelta;
            ctx.fillStyle = '#111111'; 
            ctx.fillRect(currPixel.x, currPixel.y, 5, 5);
            socket.emit('drag', currPixel);
        }
    }else{
        prevPixel.start = false;
    }
}

function keydown(e) {
    socket.emit('keydown', e.keyCode);

}

function click(e) {
    //console.log(e);
    ctx.fillStyle = DRAWING_COLOUR;
    ctx.fillRect(e.x, e.y, 5, 5);
    //socket.emit('drag', e);
}

function paintGame(player){

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

    canvas.height = 1200;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    paintGame(state.players[0]);
    paintGame(state.players[1]);
    gameActive = false;
}