const Constants = require('@shared/Constants');

class Render {
    constructor(container) {
        this.container = container;
    }

    static create() {
        const body = document.querySelector('body')
        const render = new Render(body)
        return render;
    }

    // Поле для ввода имени игрока
    createLogin() {
        const login = document.createElement('div');
        login.className = "login";
        this.container.append(login)

        const h1 = document.createElement('h1');
        h1.className = "login-header";
        h1.textContent = 'Tic Tac Toe';
        login.append(h1)    

        const alert = document.createElement('p');
        alert.className = "login-alert";
        alert.textContent = 'Имя должно содержать больше 2-х символов';
        login.append(alert)

        const input = document.createElement('input');
        input.className = "login-input";
        input.placeholder = "Your name";
        input.autocomplete = "off";
        input.autofocus = "autofocus";
        input.maxLength = 16;
        login.append(input)

        const button = document.createElement('button');
        button.className = Constants.ACTION_LOGIN;
        button.textContent = 'Play';
        login.append(button)
    }

    // Поле для ходов
    createField() {
        const field = document.querySelector('.field')
        
        // Поле еще не создано
        if ( !field ) {
            this.container.style.overflow = 'visible';
    
            this.container.style.display = "flex";
            this.container.style.flexDirection = "column";
            this.container.style.alignItems = "center";
            this.container.style.justifyContent = "center";
            this.container.style.backgroundColor = "teal";
    
            const field = document.createElement('div');
            field.className = "field";
            this.container.append(field)
            
            const canvas = document.createElement('canvas');
            canvas.width = Constants.CANVAS_SIZE + Constants.CANVAS_BORDER
            canvas.height = Constants.CANVAS_SIZE + Constants.CANVAS_BORDER
            canvas.className = "field-canvas";
            field.append(canvas)   
    
            const div_players = document.createElement('div');
            div_players.className = "players";
            field.append(div_players)
            
            for (let i = 1; i < 3; i++) {
                const div_player = document.createElement('div');
                div_player.className = `player player${i} player${i}__arrow`;
                div_players.append(div_player)
    
                const player_name = document.createElement('p');
                player_name.className = `player${i}-name`;
                div_player.append(player_name)        
            }
    
    
            const img = document.createElement('img');
            img.src = './img/paper.png'
            img.className = "field-paper";
            field.append(img)
    
            return true;
        }

        return false;
    }

    // Поле ожидания
    createWaiting() {
        this.container.style.overflow = 'hidden';
        const waiting = document.createElement('div');
        waiting.className = "waiting";
        this.container.append(waiting)

        const alert = document.createElement('p');
        alert.className = "waiting-alert";
        alert.textContent = `Ждем подключения второго игрока`;
        waiting.append(alert)
    }

    clearWaiting() {
        this.container.style.overflow = 'visible';
        const waiting = document.querySelector('.waiting')
        if (waiting) waiting.parentNode.removeChild(waiting)       
    }

    gameOver(winner) {
        const result = winner ? 'Поздравляем! Вы выиграли.' : 'Увы. Вы проиграли.' 

        this.container.style.overflow = 'hidden';
        const waiting = document.createElement('div');
        waiting.className = "waiting";
        this.container.append(waiting)

        const alert = document.createElement('p');
        alert.className = "waiting-alert";
        alert.innerHTML = `${result} <span class="${Constants.ACTION_RESTART}">Начать заново?</span>`;
        waiting.append(alert)
    }
}

module.exports = Render;