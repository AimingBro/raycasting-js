const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    render() {
        stroke("#222");
        for(let i = 0; i < MAP_NUM_ROWS; i++) {
            for(let j = 0; j < MAP_NUM_COLS; j++){
                let tileX = j * TILE_SIZE;
                let tileY = i * TILE_SIZE;
                let tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                fill(tileColor)
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE); //사각형을 titleX, titleY좌표에서 TILE_SIZE*TILE_SIZE만큼 그린다.
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 3; //반지름
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if back, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 2 * (Math.PI / 180);
    }
    update(){
        //update player position & direction
        this.rotationAngle += this.turnDirection * this.rotationSpeed;

        let moveStep = this.walkDirection * this.moveSpeed
        this.x += moveStep * Math.cos(this.rotationAngle);
        this.y += moveStep * Math.sin(this.rotationAngle);
    }
    render(){
        noStroke();
        fill("red");
        circle(this.x, this.y, this.radius);
        stroke("red");
        line(
            this.x,
            this.y,
            this.x + Math.cos(this.rotationAngle) * 30,
            this.y + Math.sin(this.rotationAngle) * 30
        );
    }
}

let grid = new Map();
let player = new Player();

function keyPressed(){
    if(keyCode == UP_ARROW){
        player.walkDirection = +1;
    } else if(keyCode == DOWN_ARROW){
        player.walkDirection = -1;
    } else if(keyCode == RIGHT_ARROW){
        player.turnDirection = +1;
    } else if(keyCode == LEFT_ARROW){
        player.turnDirection = -1;
    }
}

function keyReleased(){
    if(keyCode == UP_ARROW){
        player.walkDirection = 0;
    } else if(keyCode == DOWN_ARROW){
        player.walkDirection = 0;
    } else if(keyCode == RIGHT_ARROW){
        player.turnDirection = 0;
    } else if(keyCode == LEFT_ARROW){
        player.turnDirection = 0;
    }
}

// initialize all object
function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

// update all game object before render next frame
function update() {
    player.update();
}

// render all object frame by frame
function draw() {
    update();
    grid.render();
    player.render();
}
