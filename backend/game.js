module.exports = {
    initGame,
    addPaint,
    gameOverDisplay,
}

function initGame() {
    const state = createGameState();
    return state;
}

function createGameState() {
    return {
        players: [{
            paint: [
                {x: 50,y: 50, colour: "#222222"},
                {x: 80,y: 80, colour: "#222222"},
            ],
        },{
            paint:[
                {x: 50,y: 50, colour: "#222222"},
                {x: 80,y: 80, colour: "#222222"},
            ]
        }]
    }
}

function addPaint(player, data){
    player.paint.push(...data);
}

function gameOverDisplay(state) {
    state.players[1].paint.forEach( (pixel) => {
        pixel.y = pixel.y+600;
    })
}