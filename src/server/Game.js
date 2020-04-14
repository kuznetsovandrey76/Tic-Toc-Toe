const Player = require('./Player')
const Constants = require('../shared/Constants')

class Game {
    // clients: Map - Все подкдюченные socket
    // playersID: [] - socket.id всех подключенных игроков { Распределение по комнатам } 
    // players: Map - socket.id: String -> { class Players - id, name, room, playerNumber, socketID, canStep, winner }
    // rooms: Map - roomNumber: Number -> {} 
    //      players: Set - socket.id в данной комнате
    //      steps: [] - Поле для ходов 
    //      gameStatus: Object
    //          status: String - 
    //              'Init room', 'Start game', 'Waiting other player', 'Pause. 1 players connection', 'Pause. 2 players connection'
    //          winner: Boolean - Есть ли победитель в комнате
    constructor() {
        this.clients   = new Map()
        this.playersID = []
        this.players   = new Map()
        this.rooms     = new Map()
    }

    // Добавить игрока
    addPlayer(socket, name) {
        this.clients.set(socket.id, socket)

        // Обновляю id Player для socket room 
        if(this.playersID.indexOf(undefined) != -1) {
            this.playersID.splice(this.playersID.indexOf(undefined), 1, socket.id)
        } else {
            this.playersID.push(socket.id)
        }

        // id: Number - Player id
        const id = this.playersID.indexOf(socket.id)
        const roomNumber = Math.floor(this.playersID.indexOf(socket.id) / 2 + 1)

        if( this.rooms.has(roomNumber) ) {
            const playersInRoom = this.rooms.get(roomNumber).players
            playersInRoom.add(socket.id)

            if ( !this.rooms.get(roomNumber).gameStatus.winner ) {
                this.rooms.get(roomNumber).gameStatus = {status: 'Start game', winner: false}
            }

        } else {
            const stepsField  = new Array(19);
            for (let i=0; i < stepsField.length; i++) {
                stepsField[i] = new Array(19)
            }

            this.rooms.set(roomNumber, {
                players: new Set([socket.id]),
                steps: stepsField,
                gameStatus: {status: 'Init room', winner: false}
            })
        }

        if ( this.rooms.get(roomNumber).gameStatus.winner ) {
            this.rooms.get(roomNumber).gameStatus = {status: 'Pause. 2 players connection', winner: true}
        }

        const playerNumber  = this.playersID.indexOf(socket.id) % 2 + 1
        const canStep       = playerNumber == 1 ? true : false

        this.players.set(socket.id, Player.create(id, name, roomNumber, playerNumber, socket.id, canStep))
    }

    // Удалить игрока
    removePlayer(socketID) {
        this.clearField(this.players.get(socketID).room)

        if ( this.clients.has(socketID) ) { this.clients.delete(socketID) }
        if (this.playersID.indexOf(socketID) != -1) { this.playersID[this.playersID.indexOf(socketID)] = undefined }

        if (this.players.has(socketID)) {
          const roomNumber = this.players.get(socketID).room   
          const currentRoom = this.rooms.get(roomNumber)
          const playersInRoom = currentRoom.players

          if (playersInRoom.size > 1) {

            // Один из игроков отключился и есть победитель
            if ( currentRoom.gameStatus.winner ) {
                currentRoom.gameStatus = {status: 'Pause. 1 players connection', winner: true}
            
            } else {
                currentRoom.gameStatus = {status: 'Waiting other player', winner: false}
                
                this.clearField(roomNumber)
            }

            playersInRoom.delete(socketID)
          }  else {
            this.rooms.delete(roomNumber)
          }

          this.players.delete(socketID)
        }        
    }

    // Повторяющийся код -------
    updateCanStep(socketID) {
        const currentRoom = this.players.get(socketID).room
        const playersInRoom = this.rooms.get(currentRoom).players

        let self = null;
        let opponent = null;

        playersInRoom.forEach((socketID_inRoom) => {
            if (socketID_inRoom == socketID) { self = this.players.get(socketID_inRoom) } 
            else { opponent = this.players.get(socketID_inRoom) }
        })

        // ----------
        self.canStep = true
    }

    // Добавляю ход на поле
    addStep(coords, socketID) {
        const currentRoom   = this.players.get(socketID).room
        const playersInRoom = this.rooms.get(currentRoom).players

        let self     = null
        let opponent = null

        playersInRoom.forEach((socketID_inRoom) => {
            if (socketID_inRoom == socketID) { self = this.players.get(socketID_inRoom) } 
            else { opponent = this.players.get(socketID_inRoom) }
        })

        // Доступна возможность ходить
        if( self.canStep && opponent ) {
            let checkStepField = this.rooms.get(currentRoom).steps[coords.x-1][coords.y-1]
            
            if ( !checkStepField ) {
                this.rooms.get(currentRoom).steps[coords.x-1][coords.y-1] = socketID
    
                // Проверка на выигрыш 
                let checkWin = this.checkWin.bind(this)
                
                if (checkWin(coords.x, coords.y, socketID) ) {
                    const roomNumber = this.players.get(socketID).room   
                    this.rooms.get(roomNumber).gameStatus = {status: 'Pause. 2 players connection', winner: true}
                    
                    console.log(roomNumber, this.rooms.get(roomNumber).gameStatus)

                    this.players.get(self.socketID).winner = true

                    // Отправляю данные клиентам - победил, проиграл
                    this.clients.get(self.socketID).emit('GAME_OVER', {
                        winner: self.winner
                    })
                    this.clients.get(opponent.socketID).emit('GAME_OVER', {
                        winner: opponent.winner
                    })
                }    

                try {                    
                    // Передача хода другому игроку
                    this.players.get(opponent.socketID).canStep = self.canStep      
                    this.players.get(self.socketID).canStep     = !self.canStep

                } catch (err) {
                    console.log(err)
                }

            } else {
                console.log('Сюда уже сходили')
            } 
        }
    }

    // Отправка данных клиенту
    sendState() {    
        this.clients.forEach((client, socketID) => {
            const currentPlayer = this.players.get(socketID)
            let opponentPlayer = null

            const currentRoom = this.rooms.get(currentPlayer.room)
            const playersInRoom = currentRoom.players

            if (playersInRoom.size > 1) {
                for (let socketID of playersInRoom) {
                    if (socketID != currentPlayer.socketID) {
                        opponentPlayer = this.players.get(socketID)
                    }
                }
            }           

            this.clients.get(socketID).emit('UPDATE', {
                self        : currentPlayer,
                opponent    : opponentPlayer,
                steps       : currentRoom.steps,
                gameStatus  : currentRoom.gameStatus
            })
        })
    }

    // Очистить поле для ходов
    clearField(roomNumber) {
        let defaultArray = new Array(19);
        for (let i=0; i < defaultArray.length; i++) {
            defaultArray[i] = new Array(19)
        }
        this.rooms.get(roomNumber).steps = defaultArray
    }

    checkWin (cellX, cellY, socketID) {
        // Перезаписываю контекст
        const that = this
        let result
        
        // Проверка линий по четырем направлениям 
        result = result || checkLine(cellX, cellY, -1, 0)     // horiz
        result = result || checkLine(cellX, cellY, -1, -1)    // -45deg
        result = result || checkLine(cellX, cellY, 0, -1)     // vert
        result = result || checkLine(cellX, cellY, 1, -1)     // 45deg              

        // Проверка ячейки на уход за границу и не занята ли она другим игроком
        function checkCell (x, y) {
            if (x < 1 || y < 1 || x > 19 || y > 19 || 
                that.rooms.get(that.players.get(socketID).room)
                    .steps[x-1][y-1] != socketID) {
                        return false
            } 
            return true
        }

        function checkLine (x, y, dx, dy) {
            let score = 0;
            
            // Для проверки уходим максимально возможно влево && || вверх
            while (checkCell(x + dx, y + dy)) { 
                x += dx;
                y += dy
            }
            
            // Начинаем отсчет от крайней левой && || верхней ячейки
            while (checkCell(x, y)) { 
                x -= dx;
                y -= dy
                score++;
            }

            if ( score >= Constants.SCORE ) return true;
            return false  
        }

        return result;
    }
}

module.exports = Game;