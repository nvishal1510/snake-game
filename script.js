const canvas = document.querySelector("canvas")
canvas.width = 1000
canvas.height = 750
const ctx = canvas.getContext("2d")

const square_thickness = 50
const r = square_thickness / 2
const vel_mag = 1

ctx.strokeStyle = "#000000"

function draw_grid()
{
    for (let x = 0; x < canvas.width; x += square_thickness)
    {
        ctx.beginPath()
        ctx.moveTo(x, 1)
        ctx.lineTo(x, canvas.height - 1)
        ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += square_thickness)
    {
        ctx.beginPath()
        ctx.moveTo(1, y)
        ctx.lineTo(canvas.width - 1, y)
        ctx.stroke()
    }
}

const Dir =
    {
        RIGHT: 0,
        UP: Math.PI / 2,
        LEFT: Math.PI,
        DOWN: 1.5 * Math.PI
    }

function Point(x, y)
{
    this.x = x
    this.y = y
}

function Turn(x, y, dir)
{
    this.x = x
    this.y = y
    // this.point = new Point(x, y)
    this.dir = dir
}

function Piece(x, y, vx, vy)
{
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.dir = Math.sign(-vy) * Math.atan(vy / vx)

    this.get_square_center = function ()
    {
        switch (this.dir)
        {
            //get the edge that is being crossed and add or subtract r based on direction
            case Dir.RIGHT:
                return new Point(square_thickness * Math.floor((this.x + r) / square_thickness) + r, this.y)
            case Dir.DOWN:
                return new Point(this.x, square_thickness * Math.floor((this.y + r) / square_thickness) + r)
            case Dir.LEFT:
                return new Point(square_thickness * Math.ceil((this.x - r) / square_thickness) - r, this.y)
            case Dir.UP:
                return new Point(this.x, square_thickness * Math.ceil((this.y - r) / square_thickness) - r)
        }
    }

    this.draw = function ()
    {
        ctx.beginPath()
        ctx.arc(this.x, this.y, r, 0, 2 * Math.PI)
        ctx.fillStyle = '#000000'
        ctx.fill()
    }

    this.update = function ()
    {
        for (let i = 0; i < snake.turns.length; i++)
            if (this.x === snake.turns[i].x && this.y === snake.turns[i].y)
            {
                console.log(this, "turning", snake.turns[i])
                switch (snake.turns[i].dir)
                {
                    case Dir.RIGHT:
                        [this.vx, this.vy] = [vel_mag, 0]
                        break
                    case Dir.LEFT:
                        [this.vx, this.vy] = [-vel_mag, 0]
                        break
                    case Dir.UP:
                        [this.vx, this.vy] = [0, -vel_mag]
                        break
                    case Dir.DOWN:
                        [this.vx, this.vy] = [0, vel_mag]
                        break
                    default:
                        console.log("An error occurred while turning")
                }
                this.dir = snake.turns[i].dir
                if (this === snake.pieces[snake.pieces.length - 1])
                    snake.turns.shift()
                break
            }

        this.x += this.vx
        this.y += this.vy
        this.draw()
    }

}

let snake =
    {
        pieces: [new Piece(square_thickness + r, 0 + r, vel_mag, 0), new Piece(0 + r, 0 + r, vel_mag, 0)],

        update: function ()
        {
            for (let i = 0; i < this.pieces.length; i++)
                this.pieces[i].update()
            draw_grid()
        },

        // TODO: configure adding piece
        // add_piece: function ()
        // {
        //     let last_piece = this.pieces.slice(-1)[0]
        //     let x = last_piece.x - Math.sign(last_piece.vx) * r
        //     let y = last_piece.y - Math.sign(last_piece.vy) * r
        //     this.pieces.push(new Piece(x, y, last_piece.vx, last_piece.vy))
        // },

        //stack that maintains the list of turns to be taken by each piece
        turns: []
    }

window.addEventListener("keydown", function (event)
{
    let turn_dir = undefined
    switch (event.key)
    {
        case "w":
            turn_dir = Dir.UP
            break
        case "a":
            turn_dir = Dir.LEFT
            break
        case "s":
            turn_dir = Dir.DOWN
            break
        case "d":
            turn_dir = Dir.RIGHT
            console.log("d keydown event")
    }
    if (turn_dir === undefined)
        return

    console.log("turn_dir = " + turn_dir / Math.PI)
    let first_piece = snake.pieces[0]
    let snake_dir = Math.sign(-first_piece.vy) * Math.atan(first_piece.vy / first_piece.vx)
    if ([0, 1, 2].includes(Math.abs(snake_dir - turn_dir) / Math.PI))
        return

    let turn_point = first_piece.get_square_center()
    // if more than one turns are given at the same square, last one is considered
    let last_turn = snake.turns.slice(-1)[0]
    if (last_turn !== undefined)
        if (turn_point.x === last_turn.x && turn_point.y === last_turn.y)
            snake.turns.pop()
    snake.turns.push(new Turn(turn_point.x, turn_point.y, turn_dir));

})

function init()
{
    for (let i = 0; i < snake.pieces.length; i++)
        snake.pieces[i].draw()
    draw_grid();
    console.log("Initialised")
}

function play()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    snake.update()
    window.requestAnimationFrame(play)
}

init()
play()