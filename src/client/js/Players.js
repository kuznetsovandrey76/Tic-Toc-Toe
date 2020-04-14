class Players {
    constructor(self, opponent) {
        this.self       = self
        this.opponent   = opponent;
    }

    static create(self, opponent) {
        return new Players(self, opponent)
    }

    // Переход хода
    update() {
        const self      = document.querySelector(`.player${this.self.playerNumber}`)
        const opponent  = document.querySelector(`.player${this.opponent.playerNumber}`)

        if(!this.self.canStep) {
            self.classList.remove(`player${this.self.playerNumber}__arrow`)
            opponent.classList.add(`player${this.opponent.playerNumber}__arrow`)            
        } else {
            opponent.classList.remove(`player${this.opponent.playerNumber}__arrow`)
            self.classList.add(`player${this.self.playerNumber}__arrow`)
        }    
        
        self.firstChild.classList.add(`player-you`)

        self.firstChild.textContent     = this.self.name
        opponent.firstChild.textContent = this.opponent.name
    }

    waiting() {
        let opponentNumber = this.self.playerNumber == 1 ? 2 : 1
        const opponent  = document.querySelector(`.player${opponentNumber}`)
        opponent.firstChild.textContent = ''
    }
}

module.exports = Players;