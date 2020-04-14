// Подключаем стили и изображения
import '@client/css/style.scss'
import '@client/img/paper.png'

const Constants = require('@shared/Constants');
const Render    = require('./Render') 
const Action    = require('./Action') 
const Game      = require('./Game') 

const socket    = require('socket.io-client')();
const render    = Render.create();

const promise   = new Promise((resolve, reject) => {
    
    render.createLogin()

    // Обработка поля для входа
    Action.create(socket, `.${Constants.ACTION_LOGIN}`)

    // Присоединение полльзователя к комнате
    socket.on('CONNECT_TO_ROOM', (data) => {
        
        const dont_waiting_winner = data.winner == data.youWinner

        // Проверяем сколько игроков подключено к комнате
        if (data.playersNumber > 1 && dont_waiting_winner) {         
            const field = render.createField()

            // Поле для ходов создается впервые
            if( field ) {
                const game = Game.create(socket);
                resolve(game);
            } 
            
        } else {
            render.createWaiting()
        }
    })
});


promise
    .then((game) => { 
        render.clearWaiting()
        game.init()
        
        // Окончание игры
        socket.on('GAME_OVER', (data) => {
            render.gameOver(data.winner)
            game.end()
            
        })
    })

