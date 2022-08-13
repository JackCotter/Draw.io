const { initGame, addPaint } = require('./game');

const io = require('socket.io')();

const state = {};

io.on('connection', client => {

    client.on('newGame', handleNewGame);
    client.on('drag', handleDrag);

    function handleDrag(data) {
        //addPaint(state, data);
        let paintData = {
            x: data.x - 40,
            y: data.y - 85,
        }
        state.player.paint.push({...paintData})
        stringstate = JSON.stringify(state);
        client.emit('paint', stringstate);
    }

    function handleNewGame() {
        console.log("new game");
        state = initGame();
        console.log("here it is" + state.player.paint);
    }

})

io.listen(8080);