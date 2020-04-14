class Player {
    /*
        id: Number           - id игрока
        name: String         - Имя игрока
        room: Number         - Комната в которую попадает игрок
        playerNumber: Number - (1 or 2)
        socketID: String     - socket.id игрока
        canStep: Boolean     - Право хода
        winner: Boolean      - Победил
    */
    constructor(id, name, room, playerNumber, socketID, canStep) {
        this.id           = id
        this.name         = name
        this.room         = room
        this.playerNumber = playerNumber
        this.socketID     = socketID
        this.canStep      = canStep
        this.winner       = false
    }

    static create(id, name, room, playerNumber, socketID, canStep) {
        const player = new Player(id, name, room, playerNumber, socketID, canStep)
        return player
    }
}

module.exports = Player;