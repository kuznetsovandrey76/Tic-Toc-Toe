const Constants = require('@shared/Constants');

class Draw {
    constructor(coords, canvas) {
        this.drawCoords = [coords[0], coords[1]]
        this.canvas = canvas
        this.ctx = canvas.getContext("2d");
    }

    // Поле для ходов
    static create(canvas) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = Constants.CANVAS_BORDER_COLOR; 
        ctx.fillRect(0, 0, Constants.CANVAS_SIZE + Constants.CANVAS_BORDER, 
            Constants.CANVAS_SIZE + Constants.CANVAS_BORDER);
        
        // Вырезаю из поля квадраты для ходов 
        for (let i = 0; i < Constants.FIELDS; i++) {
            for (let j = 0; j < Constants.FIELDS; j++) {
                ctx.clearRect(Constants.CANVAS_BORDER + i * Constants.CANVAS_SIZE / Constants.FIELDS, 
                            Constants.CANVAS_BORDER + j * Constants.CANVAS_SIZE / Constants.FIELDS, 
                            Constants.CANVAS_SIZE / Constants.FIELDS - Constants.CANVAS_BORDER, 
                            Constants.CANVAS_SIZE / Constants.FIELDS - Constants.CANVAS_BORDER);
            }
        }
    }

    // Отрисовываем место выстрела
    draw(playerNumber) { 

        const SHEET_SIZE = Constants.CANVAS_SIZE / Constants.FIELDS
        const DRAW_X = this.drawCoords[0] - 1
        const DRAW_Y = this.drawCoords[1] - 1
        const BRDR = Constants.CANVAS_BORDER

        if (playerNumber == 1) {          
            this.ctx.beginPath();
            this.ctx.strokeStyle = Constants.PLAYER1_COLOR
            this.ctx.moveTo(
                DRAW_X * SHEET_SIZE + 2 + BRDR,  // x0
                DRAW_Y * SHEET_SIZE + 2 + BRDR); // y0
            this.ctx.lineTo(
                (DRAW_X + 1) * SHEET_SIZE - 2,  // x1
                (DRAW_Y + 1) * SHEET_SIZE - 2); // y1
            this.ctx.moveTo(
                (DRAW_X + 1) * SHEET_SIZE - 2,   // x1
                DRAW_Y * SHEET_SIZE + 2 + BRDR); // y0    
            this.ctx.lineTo(
                DRAW_X * SHEET_SIZE + 2 + BRDR,  // x0 
                (DRAW_Y + 1) * SHEET_SIZE - 2);  // y1
            this.ctx.stroke(); 
        } else {
            this.ctx.beginPath();
            this.ctx.strokeStyle = Constants.PLAYER2_COLOR
            this.ctx.arc(
                DRAW_X * SHEET_SIZE + (SHEET_SIZE / 2) + .5, // x0 
                DRAW_Y * SHEET_SIZE + (SHEET_SIZE / 2) + .5, // y0
                SHEET_SIZE / 3.5, // radius 
                0, 
                Math.PI * 2)
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    // Очистить поле
    clear() {
        this.ctx.clearRect(Constants.CANVAS_BORDER + (this.drawCoords[0] - 1) * Constants.CANVAS_SIZE / Constants.FIELDS, 
            Constants.CANVAS_BORDER + (this.drawCoords[1] - 1) * Constants.CANVAS_SIZE / Constants.FIELDS, 
            Constants.CANVAS_SIZE / Constants.FIELDS - Constants.CANVAS_BORDER, 
            Constants.CANVAS_SIZE / Constants.FIELDS - Constants.CANVAS_BORDER);
    }
}

module.exports = Draw;