const { initGame, addPaint } = require('./game');

const io = require('socket.io')();


io.on('connection', client => {
    const state = initGame();

    console.log(state.player.paint);

    //client.on('newGame', handleNewGame);
    client.on('drag', handleDrag);

    function handleNewGame() {
        console.log("new game");
        state = initGame();
        console.log("here it is" + state.player.paint);
    }

    function handleDrag(data) {
        //addPaint(state, data);
        state.player.paint.push({...data})
        stringplayer = JSON.stringify(state.player);
        //console.log(stringstate);
        client.emit('paint', stringplayer);
    }

})

io.listen(8080);