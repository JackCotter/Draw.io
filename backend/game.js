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
            paint:[]
        },{
            paint: []
        }, {
            paint: []
        }, {
            paint: []
        }]
    }
}

function addPaint(player, data){
    player.paint.push(...data);
}

function gameOverDisplay(state) {
    if(state){
        console.log(state.players);
        state.players[1].paint.forEach((pixel) => {
            pixel.y = pixel.y + 300;
        });
        state.players[3].paint.forEach((pixel) => {
            pixel.y = pixel.y + 600;
        });
        state.players[2].paint.forEach((pixel) => {
            pixel.y = pixel.y + 900;
        });
    }

}