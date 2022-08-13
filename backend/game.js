module.exports = {
    initGame,
    addPaint,
}

function initGame() {
    const state = createGameState();
    return state;
}

function createGameState() {
    return {
        player: {
            paint: [
                {x: 50,y: 50}
            ],
        }
    }
}

function addPaint(state, data){
    let paintData = {
        x: data.x - 40,
        y: data.y - 85,
    }
    state.player.paint.push(...paintData)
}