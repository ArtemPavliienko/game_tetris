'use strict';

const canvas = document.getElementById('tetris'),
    ctx    = canvas.getContext('2d');

// масштаб квадратов
ctx.scale(20, 20);

const matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0]
];

// удалять полосу если она закрыта
function arenaSweep() {
    let rowCount = 1;
    // outer - метка
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}


// Столкновения
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];

    for ( let y = 0; y < m.length; ++y ) {
        for ( let x = 0; x < m[y].length; ++x ) {
            // первое проверяем если не ноль то продолжаем
            // проверка арены, если там не столкноверий нет то ОК
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0 ) {
                // вернем true если столкновения не было
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        // Заполняем массив нулями
        matrix.push( new Array(w).fill(0) );
    }

    return matrix;
}


// Шаблон разных эл
function createPiece( type )
{
    if ( type === 'I' ) {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if ( type === 'L' ) {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if ( type === 'J' ) {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if ( type === 'O' ) {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if ( type === 'Z' ) {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if ( type === 'S' ) {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if ( type === 'T' ) {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function draw() {
    // проверка
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix( arena, {x: 0, y: 0} );
    drawMatrix( player.matrix, player.pos );
}

// отрисовка элементов со смещением
function drawMatrix(el, offset) {
    el.forEach((row, y) => {
       row.forEach((value, x) => {
           if ( value !== 0 ) {
               ctx.fillStyle = colors[value];
               ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
           }
       })
    });
}

// копируем значения
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
       row.forEach((value, x) => {
           if ( value !== 0 ) {
               arena[y + player.pos.y][x + player.pos.x] = value;
           }
       })
    });
}

// Падения эл
function playerDown() {
    player.pos.y++;

    if ( collide(arena, player) ) {
        player.pos.y--;
        // снова записуем в общий массив
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }

    dropCounter = 0; // нужно очистить что бы от нажатия прошла секунда
}

// Движения до стены
function playerMove(dir) {
    player.pos.x += dir;
    if ( collide(arena, player) ) {
        player.pos.x -= dir;
    }
}

// рандомно выбрает разных эл
function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);

    if ( collide(arena, player) ) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// перевород эл
function rotate(matrix, dir) {
    for ( let y = 0; y < matrix.length; ++y ) {
        for ( let x = 0; x < y; ++x ) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }

    if ( dir > 0 ) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate( dir ) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);

    // проверка что бы при перевороте не выходил за стену
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Обновления эл
let dropCounter  = 0,
    dropInterval = 1000; // интервал двиения эл

let lastTime = 0;

function update(time = 0) {
    // console.log(time) // - время прошедшее с момента запуска страницы

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;

    // когда проходит заданное время (1с), то мы опускаем эл на 1 по y
    if ( dropCounter > dropInterval ) {
        playerDown();
    }

    draw();
    requestAnimationFrame(update);
}

// очки
function updateScore() {
    document.getElementById('score').innerText = player.score;
}

const arena = createMatrix(12, 20); // w / h
console.log(arena); console.table(arena);


const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];


const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
};


// отслеживаем нажатия клавиатуры
document.addEventListener('keydown', event => {
    console.log(event);
    if ( event.keyCode === 37 ||  event.keyCode === 100 ) playerMove(-1);
    if ( event.keyCode === 39 ||  event.keyCode === 102 ) playerMove(1);

    // падения эл
    if ( event.keyCode === 32 ) playerDown();

    // поворот
    if ( event.keyCode === 38 ||  event.keyCode === 104 ) playerRotate(-1);
    if ( event.keyCode === 40 ||  event.keyCode === 101 ) playerRotate(1);

});

playerReset();
updateScore();
update();
