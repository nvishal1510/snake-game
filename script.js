const canvas = document.querySelector("canvas")
canvas.width = 1000
canvas.height = 750
const ctx = canvas.getContext("2d")
ctx.strokeStyle = "#000000"

const square_thickness = 50
const r = square_thickness / 2
const vel_mag = 1

let fruit = undefined

let is_pause = false
let is_game_over = false

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
    this.dir = dir
}

function get_nearest_sq_center(x, y)
{
    return new Point(Math.floor(x / square_thickness) * square_thickness + r,
        Math.floor(y / square_thickness) * square_thickness + r)
}

function create_fruit()
{
    let fruit_coincides_with_snake = false
    do
    {
        // fruit = new Piece(Math.floor(Math.random() * canvas.width / square_thickness) * square_thickness + r,
        //     Math.floor(Math.random() * canvas.height / square_thickness) * square_thickness + r, 0, 0)
        let fruit_point = get_nearest_sq_center(Math.random() * canvas.width, Math.random() * canvas.height)
        fruit = new Piece(fruit_point.x, fruit_point.y, 0, 0)
        for (let i = 0; i < snake.pieces.length; i++)
        {
            let nearest_sq_center = snake.pieces[i].get_near_sq_center();
            if (fruit.x === nearest_sq_center.x && fruit.y === nearest_sq_center.y)
                fruit_coincides_with_snake = true
        }
    }
    while (fruit_coincides_with_snake)
    return fruit
}

function pause_resume()
{
    if (is_game_over)
        return
    is_pause = !is_pause
    if (!is_pause)
        play()
}

function reset()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    snake.reset()
    init()
    is_pause = true
    is_game_over = false
}

function game_over()
{
    console.log("Method: game_over()")
    is_game_over = true
    is_pause = true
    alert(`Your score is ${snake.pieces.length - 2} points`)
}

function Piece(x, y, vx, vy)
{
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.dir = Math.sign(-vy) * Math.atan(vy / vx)

    this.get_next_square_center = function ()
    {
        switch (this.dir)
        {
            //get the edge that is being crossed and add or subtract r based on piece movement direction
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

    this.get_near_sq_center = function ()
    {
        return get_nearest_sq_center(this.x, this.y)
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

const snake =
    {
        pieces: [],

        //stack that maintains the list of turns to be taken by each piece
        turns: [],

        eaten_piece: undefined,

        is_colliding: function ()
        {
            //snake head - snake collision (legal closes distance between two circles is while turning equal to square_thickness/sqrt(2) )
            for (let i = 1; i < this.pieces.length; i++)
                if (Math.sqrt((this.pieces[i].x - this.pieces[0].x) ** 2 + (this.pieces[i].y - this.pieces[0].y) ** 2) < square_thickness / 2 ** 0.5)
                {
                    console.log(`dist = ${Math.sqrt((this.pieces[i].x - this.pieces[0].x) ** 2 + (this.pieces[i].y - this.pieces[0].y) ** 2)}`)
                    return true
                }

            //snake head - boundary collision
            return this.pieces[0].x + r > canvas.width || this.pieces[0].x - r < 0 || this.pieces[0].y + r > canvas.height || this.pieces[0].y - r < 0
        },

        update_eating: function ()
        {
            if (Math.sqrt((fruit.x - this.pieces[0].x) ** 2 + (fruit.y - this.pieces[0].y) ** 2) < square_thickness)
                if (this.eaten_piece === undefined)
                {
                    let last_piece = this.pieces.slice(-1)[0]
                    this.eaten_piece = new Piece(last_piece.get_near_sq_center().x, last_piece.get_near_sq_center().y, last_piece.vx, last_piece.vy)
                }
            if (this.pieces[0].x === fruit.x && this.pieces[0].y === fruit.y)
            {
                this.pieces.push(this.eaten_piece)
                this.eaten_piece = undefined
                fruit = undefined
            }
            if (this.eaten_piece !== undefined)
                this.eaten_piece.draw()
        },

        update: function ()
        {
            this.update_eating();
            for (let i = 0; i < this.pieces.length; i++)
                this.pieces[i].update()
            draw_grid()
        },

        reset: function ()
        {
            this.pieces = []
            this.turns = []
            this.eaten_piece = undefined
        }

    };

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
            break
        case "p":
            pause_resume()
            break
        case "r":
            if (is_pause)
                reset()
    }
    if (is_pause)
        return
    if (turn_dir === undefined)
        return
    console.log("turn_dir = " + turn_dir / Math.PI)

    let first_piece = snake.pieces[0]
    let snake_dir = Math.sign(-first_piece.vy) * Math.atan(first_piece.vy / first_piece.vx)
    //if snake_dir and turn_dir are in same direction or exactly opposite direction, then return
    if ([0, 1, 2].includes(Math.abs(snake_dir - turn_dir) / Math.PI))
        return

    let turn_point = first_piece.get_next_square_center()
    // if more than one turns are given at the same square, last one is considered
    let last_turn = snake.turns.slice(-1)[0]
    if (last_turn !== undefined)
        if (turn_point.x === last_turn.x && turn_point.y === last_turn.y)
            snake.turns.pop()
    snake.turns.push(new Turn(turn_point.x, turn_point.y, turn_dir));

})

function init()
{
    // fruit = new Piece(275, 25, 0, 0);
    snake.pieces.push(new Piece(square_thickness + r, 0 + r, vel_mag, 0))
    snake.pieces.push(new Piece(0 + r, 0 + r, vel_mag, 0))
    create_fruit()
    for (let i = 0; i < snake.pieces.length; i++)
        snake.pieces[i].draw()
    fruit.draw()
    draw_grid();
    console.log("Initialised")
}

function play()
{
    if (is_pause)
        return
    if (snake.is_colliding())
    {
        game_over()
        return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    snake.update()
    if (fruit === undefined)
        create_fruit()
    fruit.draw()
    window.requestAnimationFrame(play)
}

init()
play()
