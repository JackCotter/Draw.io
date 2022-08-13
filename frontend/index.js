//const { socket } = require("dgram");
const GRID_SIZE = 20;

const socket = io('http://localhost:8080');

socket.on('paint', paintGame);

const BG_COLOUR = '#231f20';
const DRAWING_COLOUR = '#666666';

const gameScreen = document.getElementById('gameScreen');

let dragging = false;
let canvas, ctx;

function init() {
    gameScreen.style.display = "block";

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    socket.emit('newGame');

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

function drag (e){
    if (dragging === true) {

        socket.emit('drag', e);
        //ctx.fillStyle = DRAWING_COLOUR;
        //ctx.fillRect(e.x - 40, e.y - 85, 5, 5);
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

function paintGame(state){
    state = JSON.parse(state);

    ctx.fillStyle = DRAWING_COLOUR;
    //console.log(state);
    for(let cell in state.player.paint){
        ctx.fillRect(cell.x, cell.y, 5, 5);
    }
}

init();