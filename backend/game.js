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
            paint: [],
        },{
            paint:[]
        }]
    }
}

function addPaint(player, data){
    player.paint.push(...data);
}

function gameOverDisplay(state) {
    if(state){
        state.players[1].paint.forEach((pixel) => {
            pixel.y = pixel.y + 300;
        })
    }

}