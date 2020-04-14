const Constants = require('./src/shared/Constants')
const Game      = require('./src/server/Game')

const express   = require('express')
const chalk     = require('chalk');

const PORT      = process.env.PORT || Constants.PORT;

const app       = express();
const server    = require('http').createServer(app);
const io        = require('socket.io').listen(server);
const game      = new Game();

app.use(express.static('dist'));


setInterval(() => {
    game.sendState()
}, 1000 / Constants.FPS)

server.listen(PORT, () => { console.log(chalk.yellow(`http://localhost:${PORT}`)) })


io.on('connection', ( socket ) => {

    function connectToRoom(socketID, roomNumber) {
        io.to(socketID).emit('CONNECT_TO_ROOM', {
            playersNumber: game.rooms.get(roomNumber).players.size,
            winner: game.rooms.get(roomNumber).gameStatus.winner,
            youWinner: game.players.get(socketID).winner
        })
    }

    socket.on('NEW_PLAYER', (name) => {      
        game.addPlayer(socket, name)
        
        const roomNumber = game.players.get(socket.id).room        
        const currentRoom = game.rooms.get(roomNumber)

        console.log(roomNumber, currentRoom.gameStatus)

        currentRoom.players.forEach(socketID => { connectToRoom(socketID, roomNumber) })
    })

    socket.on('STEPS', data => { game.addStep(data, socket.id) })

    socket.on('UPDATE_CAN_STEP', () => { game.updateCanStep(socket.id) })

    socket.on('CHECK', () => {
        const roomNumber = game.players.get(socket.id).room
        const currentRoom = game.rooms.get(roomNumber)

        let opponentID = null
        currentRoom.players.forEach(element => {
            if ( element != socket.id ) { opponentID = element }
            game.players.get(element).winner = false
        })

        game.clearField(roomNumber)   
        currentRoom.gameStatus.winner = false 
        
        if ( opponentID ) {
            currentRoom.gameStatus.status = 'Start game'
            connectToRoom(opponentID, roomNumber)
        } 
        else { 
            currentRoom.gameStatus.status = 'Waiting other player' 
            io.to(socket.id).emit('CHECK_TO_ClIENT')
        }

        console.log(roomNumber, currentRoom.gameStatus)
   })

    // Убрать поле ожидания 


    socket.on('disconnect', () => { 
        try {
            const roomNumber = game.players.get(socket.id).room
            
            game.removePlayer(socket.id)

            const currentRoom = game.rooms.get(roomNumber) 
            const gameStatus = currentRoom ? currentRoom.gameStatus : 'room close'
            console.log(roomNumber, gameStatus)

        } catch(err) { console.log(chalk.bgRed(`Error: ${err.message}`)) }
    })
})