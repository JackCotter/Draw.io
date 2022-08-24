const { initGame, addPaint, gameOverDisplay } = require('./game');
const { makeid } = require('./utils');

const TWO_PLAYER_DIRECTORY = '/';

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

app.get(TWO_PLAYER_DIRECTORY, (req,res) => {
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
        client.emit('gameInstructions', "head");
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
            client.emit('gameInstructions', "legs");

            startGameInterval(roomName);
        //}
    }

    function startGameInterval(roomName) {
        setTimeout(() => {
            io.sockets.in(roomName).emit("newRound");
            updateRoomNumbers(roomName);
        },GAME_TIME);
        
        setTimeout(() => {
            gameOverDisplay(state[roomName]);
            emitGameOver(roomName);
            state[roomName] = null;
        }, GAME_TIME*2);
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
        if(state.players === null || state === null){
            return;
        }
        currentPlayer = state[roomName].players[client.number - 1];
        //addPaint(currentPlayer, data);
        //console.log(currentPlayer)
        currentPlayer.paint.push({...data})
        //stringplayer = JSON.stringify(state.player);
        //console.log(currentPlayer);
        //client.emit('paint', stringplayer);
    }

});

async function updateRoomNumbers(roomName) {
    let roomUsers = await io.of(TWO_PLAYER_DIRECTORY).in(roomName).fetchSockets();
    roomUsers.forEach((client) => {
        client.number += 2;
    });
}

io.of(TWO_PLAYER_DIRECTORY).adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
});

io.of(TWO_PLAYER_DIRECTORY).adapter.on("leave-room", (room, id) => {
    console.log(`socket ${id} has left room ${room}`);
});

io.on('disconnection', () => {
    const roomName = clientRooms[client.id];
    socket.leave("room-" + roomName);
})

http.listen(port, () => {
    console.log('app listening on port ' + port);
})