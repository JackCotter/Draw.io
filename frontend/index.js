

const socket = io('http://localhost:8080');

socket.on('paint', paintGame);
socket.on('playerNumber', setPlayerNumber);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);

const BG_COLOUR = '#231f20';
const DRAWING_COLOUR = '#666666';

let dragging = false;
let gameActive = false;
let canvas, ctx;
let playerNumber;
let previousPixel = null;

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

        ctx.fillStyle = DRAWING_COLOUR;
        ctx.fillRect(paintData.x, paintData.y, 5, 5);

        socket.emit('drag', paintData);
        
    }
}

function fillInPrevPixels(paintData, prevPixel) {
    if (prevPixel) {
        if (!(((prevPixel.x - paintData.x <= 1) && (prevPixel.x - paintData.x >=-1)) && ((prevPixel.y - paintData.y <= 1) && (prevPixel.y - paintData.y >=-1)))) {
            if(prevPixel.x - paintData.x < 0){
                newX = paintData.x - 1;
            }else if(prevPixel.x - paintData.x > 0){
                newX = paintData.x + 1;
            }else{
                newX = paintData.x;
            }

            if(prevPixel.y - paintData.y < 0){
                newY = paintData.y - 1;
            }else if(prevPixel.y - paintData.y > 0){
                newY = paintData.y + 1;
            }else {
                newY = paintData.y;
            }

            fillInPrevPixels({newX, newY}, prevPixel);
        }
    }
    ctx.fillStyle = DRAWING_COLOUR; console.log(paintData);
    ctx.fillRect(paintData.x, paintData.y, 5, 5);

    socket.emit('drag', paintData);
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