

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

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', () => {
    console.log(newGameBtn);
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
            x: data.x - 40,
            y: data.y - 85,
            colour: DRAWING_COLOUR,
        }

        ctx.fillStyle = DRAWING_COLOUR;
        ctx.fillRect(paintData.x, paintData.y, 5, 5);

        socket.emit('drag', paintData);
        
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
    player = JSON.parse(player);

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
    gameActive = false;
}