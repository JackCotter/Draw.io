const { initGame, addPaint } = require('./game');
const { makeid } = require('./utils');

const GAME_TIME = 10000;

const io = require('socket.io')();

const state = {};
const clientRooms = {};

io.on('connection', client => {

    client.on('drag', handleDrag);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('playerNumber', 1);
    }

    function handleJoinGame(roomName){
        const room = io.sockets.adapter.rooms[roomName];

        let allUsers;
        if (room){
            allUsers = room.sockets;
        }

        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        } else {
            clientRooms[client.id] = roomName;

            client.emit('gameCode', roomName);

            client.join(roomName);
            client.number = 2;
            client.emit('playerNumber', 2);

            startGameInterval(roomName);
        }
    }

    function startGameInterval(roomName) {
        setTimeout(function(){
            client.emit('gameOver', state[roomName]);
        }, GAME_TIME);
    }

    function handleDrag(data) {
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        currentPlayer = state[roomName].players[client.number - 1];
        //addPaint(currentPlayer, data);
        currentPlayer.paint.push({...data})
        //stringplayer = JSON.stringify(state.player);
        //console.log(currentPlayer);
        //client.emit('paint', stringplayer);
    }

})

io.listen(8080);