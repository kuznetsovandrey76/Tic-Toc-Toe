const Draw = require('./Draw')
const Action = require('./Action')
const Players = require('./Players')
const Render = require('./Render') 
const render = Render.create();

const Constants = require('@shared/Constants');

class Game {
    constructor(socket, canvas, draw) {
        this.socket         = socket
        this.canvas         = canvas
        this.draw           = draw

        this.self           = null
        this.opponent       = null
        this.players        = null

        this.gameStatus     = null
    }

    static create(socket) {   

        const canvas = document.querySelector('canvas')
        const draw = Draw.create(canvas)
        Action.create(socket, Constants.ACTION_CANVAS)
        
        const game = new Game(socket, canvas, draw)
        return game;
        
    }
    

    init() {
        this.socket.on('UPDATE', this.onReceiveGameState.bind(this))
    }


    // state
    // self, opponent: {} - 
    //      id: number, 
    //      name: string, 
    //      room: number, 
    //      playerNumber: number, 1 || 2
    //      socketID: socket.id,
    //      canStep: boolean 
    // field: []
    onReceiveGameState(state) {
        this.self       = state.self
        this.opponent   = state.opponent
        this.steps      = state.steps
        this.gameStatus = state.gameStatus

        this.socket.on('CHECK_TO_ClIENT', () => {
            render.clearWaiting()        
            render.createWaiting()        
        })

        const players = Players.create(this.self, this.opponent)
        
        // Второй игрок подключился
        if (this.opponent) {
            this.updateStepField()

            if ( !(this.gameStatus.winner) )
            {
                // Если двое, то обновляю их данные и убираю поле waiting
                players.update()
                render.clearWaiting()
            }

        } else {
    
            players.waiting()            
            const waiting = document.querySelector('.waiting')
            if ( !waiting ) render.createWaiting()               
            this.socket.emit('UPDATE_CAN_STEP')
        }          
    }
    

            
    updateStepField() {
        // Отрисовка выстрелов
        for (let x = 0; x < Constants.FIELDS; x++) {
            for (let y = 0; y < Constants.FIELDS; y++) {
                const drawing = new Draw([x+1, y+1], this.canvas)

                if(this.steps[x][y]) {
                    // Проверка, кто сделал ход
                    const player = this.self.socketID == this.steps[x][y] ? 
                    this.self.playerNumber : this.opponent.playerNumber;
                    
                    drawing.clear() 
                    drawing.draw(player) 
                } else {
                    drawing.clear() 
                }
            }
        }
    }


    end() {
        Action.create(this.socket, `.${Constants.ACTION_RESTART}` )
    }
}

module.exports = Game;