const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.25;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    hasWallAt(x, y){
        if(x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT){
            return true;
        }
        const mapGridIndexY = Math.floor(y / TILE_SIZE);
        const mapGridIndexX = Math.floor(x / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX] === 1;
    }
    render() {
        stroke("#222");
        for(let i = 0; i < MAP_NUM_ROWS; i++) {
            for(let j = 0; j < MAP_NUM_COLS; j++){
                let tileX = j * TILE_SIZE;
                let tileY = i * TILE_SIZE;
                let tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                fill(tileColor)
                rect(
                    ...([
                        tileX,
                        tileY,
                        TILE_SIZE,
                        TILE_SIZE
                    ].map((a)=> MINIMAP_SCALE_FACTOR * a))
                ); //사각형을 titleX, titleY좌표에서 TILE_SIZE*TILE_SIZE만큼 그린다.
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
        this.moveSpeed = 4.0;
        this.rotationSpeed = 3 * (Math.PI / 180);
    }
    update(){
        //update player position & direction
        this.rotationAngle += this.turnDirection * this.rotationSpeed;

        let moveStep = this.walkDirection * this.moveSpeed

        let newPlayerX = this.x + (moveStep * Math.cos(this.rotationAngle));
        let newPlayerY = this.y + (moveStep * Math.sin(this.rotationAngle));
        if(grid.hasWallAt(newPlayerX, newPlayerY) == false){
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    render(){
        noStroke();
        fill("red");
        circle(
            ...([
                this.x,
                this.y,
                this.radius
            ].map((a)=> MINIMAP_SCALE_FACTOR * a))
            );
        stroke("red");
        line(
            ...([
                this.x,
                this.y,
                this.x + Math.cos(this.rotationAngle) * 30,
                this.y + Math.sin(this.rotationAngle) * 30
            ].map((a)=> MINIMAP_SCALE_FACTOR * a))
        );
    }
}

class Ray {
    constructor(rayAngle){
        //nomalizeAngle : 각도를 0~2pi까지만 가지도록 함
        this.rayAngle = nomalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast(){
        let xintercept;
        let yintercept;
        let xstep;
        let ystep;
        /* HORIZONTAL RAY-GRID INTERSECTION CODE*/
        let foundHorzWallHit = false;
        let horzWallHitX = 0;
        let horzWallHitY = 0;
        // 플레이어가 바라보는 방향으로 광선을 캐스팅할 떄 가장 먼저 만나는 수평선의 x,y좌표
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        //xstpe(델타x), ystep(델타y) 계산
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        let nextHorzTouchX = xintercept;
        let nextHorzTouchY = yintercept;

        while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                break;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }

        /* VERTICAL RAY-GRID INTERSECTION CODE*/
        let foundVertwallHit = false;
        let vertWallHitX = 0;
        let vertWallHitY = 0;
        // 플레이어가 바라보는 방향으로 광선을 캐스팅할 떄 가장 먼저 만나는 수직선의 x,y좌표
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        //xstpe(델타x), ystep(델타y) 계산
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        let nextVertTouchX = xintercept;
        let nextVertTouchY = yintercept;

        while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
                foundVertwallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                break;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        // 수직 수평 방향의 벽과 마주친 거리를 각각 계산해서 가까운 걸로 캐스팅
        let horzHitDistance = (foundHorzWallHit) ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY) : Number.MAX_VALUE;
        let vertHitDistance = (foundVertwallHit) ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY) : Number.MAX_VALUE;
        if(horzHitDistance < vertHitDistance){
            this.wallHitX = horzWallHitX;
            this.wallHitY = horzWallHitY;
            this.distance = horzHitDistance;
            this.wasHitVertical = false;
        } else {
            this.wallHitX = vertWallHitX;
            this.wallHitY = vertWallHitY;
            this.distance = vertHitDistance;
            this.wasHitVertical = true;
        }
    }
    render(){
        stroke("yellowgreen")
        line(
            ...[
                player.x,
                player.y,
                this.wallHitX,
                this.wallHitY
            ].map(a=>MINIMAP_SCALE_FACTOR * a)
        );
    }
}

let grid = new Map();
let player = new Player();
let rays = [];

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

function castAllRays(){
    //start first ray subtracting half of the FOV
    let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    //loop all columns casting the rays
    for(let col = 0; col < NUM_RAYS; col++){
        let ray = new Ray(rayAngle);
        ray.cast();
        rays.push(ray);
        rayAngle += FOV_ANGLE / NUM_RAYS;
    }
}

function nomalizeAngle(angle){
    angle = angle % (2 * Math.PI);
    if(angle < 0){
        angle = (2* Math.PI) + angle;
    }
    return angle;
}

function render3DProjectedWalls(){
    //플레이어 -> 프로젝션 플레인, 플레이어 -> 실제 벽 위치 : 두 삼각형의 닮음을 이용
    for(let i = 0; i < NUM_RAYS; i++){
        let ray = rays[i];

        //fish eye 수정
        let corretWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

        let distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);
        let wallStriptHeight = (TILE_SIZE / corretWallDistance) * distanceProjectionPlane;

        //add the shade (투명도 조정)
        let alpha = 1.0; // 180 / corretWallDistance;
        //레이가 닿은 방향에 따라 다른 색을 보여줌
        let colorIntensity = ray.wasHitVertical ? 255 : 180;

        fill(`rgba(${colorIntensity}, ${colorIntensity}, ${colorIntensity}, ${alpha})`);
        noStroke();
        rect(
            i * WALL_STRIP_WIDTH,
            (WINDOW_HEIGHT / 2) - (wallStriptHeight / 2),
            WALL_STRIP_WIDTH,
            wallStriptHeight
        );
    }
}

function distanceBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

// initialize all object
function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

// update all game object before render next frame
function update() {
    player.update();
    castAllRays();
}

// render all object frame by frame
function draw() {
    clear("#111");
    update();

    render3DProjectedWalls();

    grid.render();
    for(ray of rays){
        ray.render();
    }
    player.render();
}
