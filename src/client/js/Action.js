const Constants = require('@shared/Constants');

class Action {
    constructor(socket) {
        this.socket = socket
    }

    static create(socket, element) {
        let HTMLelement = document.querySelector(element)
        const action = new Action(socket)
        action.eventHandlers(HTMLelement, status)
    }

    step(event) {
        let coords = {
            x: 0,
            y: 0
        }

        let coordX, coordY;
        [coordX, coordY] = [Math.floor(event.layerX / (Constants.CANVAS_SIZE / Constants.FIELDS) * 10),
                            Math.floor(event.layerY / (Constants.CANVAS_SIZE / Constants.FIELDS) * 10)]

        // Проверка на попадание в границу
        if(coordX % 10 && coordY % 10) {
            [coords.x, coords.y] = [Math.floor(coordX / 10) + 1, 
                                            Math.floor(coordY / 10) + 1]

            this.socket.emit('STEPS', {
                x: coords.x, 
                y: coords.y
            })
        }
    }

    checkLogin() {
        const login = document.querySelector('.login')
        const login_input = document.querySelector('.login-input')
        const login_alert = document.querySelector('.login-alert')
        const name = login_input.value
        if (name.length >= Constants.MIN_NAME_LENGTH) {
            login_alert.style.display = 'none';
            this.socket.emit('NEW_PLAYER', name);

            let opacity = 1;  
            let timer = setInterval(() => {    
                if(opacity <= 0.1) {		
                    clearInterval(timer);
                    login.parentNode.removeChild(login)	
                    
                }	
                login.style.opacity = opacity;     
                opacity -= opacity * 0.1;   
            }, 10)
        } else {
            login_alert.style.display = 'block'
        }
    }

    eventHandlers(element) {
        switch(element.className) {
            case Constants.ACTION_LOGIN:
                element.addEventListener('click', () => { this.checkLogin() })
                break
          
            case Constants.ACTION_RESTART:
                element.addEventListener('click', () => { this.socket.emit('CHECK') })
                break
          
            default:
                element.addEventListener('click', (event) => { this.step(event) })     
                break
          }
    }
}

module.exports = Action;