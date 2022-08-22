const { initGame, addPaint, gameOverDisplay } = require('./game');
const { makeid } = require('./utils');

const express = require('express');
const app = express();

const path = require('path');
const http = require('http').createServer(app);
const port = process.env.PORT || 8080;

const io = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
})

const GAME_TIME = 10000;

const state = {};
const clientRooms = {};

io.on('connection', client => {

    console.log(client.id);

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
        /*const room = io.sockets.adapter.rooms[roomName];

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
        } else {*/
            clientRooms[client.id] = roomName;

            client.emit('gameCode', roomName);

            client.join(roomName);
            client.number = 2;
            client.emit('playerNumber', 2);

            startGameInterval(roomName);
        //}
    }

    function startGameInterval(roomName) {
        setTimeout(() => {
            console.log(state[roomName])
            gameOverDisplay(state[roomName]);
            emitGameOver(roomName);
            state[roomName] = null;
        }, GAME_TIME);
    }

    function emitGameOver(roomName) {
        io.sockets.in(roomName)
            .emit('gameOver', state[roomName]);
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

});

io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
});

http.listen(port, () => {
    console.log('app listening on port ' + port);
})