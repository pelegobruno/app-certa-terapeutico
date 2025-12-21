const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const SIZE = 30;
const BASE_SPEED = 300; // ✅ velocidade fixa e controlada

let snake;
let direction;
let loopId;
let growing = false;
let tongueOut = false;
let tongueTimer = 0;

/* =========================
   FOOD (EMOJI)
========================= */
const foods = ["🍎", "🍌", "🍇", "🍓", "🍉", "🥭", "🍍", "🥝", "🍒", "🫐"];
let food = {};

const randomGrid = () =>
  Math.floor(Math.random() * (canvas.width / SIZE)) * SIZE;

const newFood = () => {
  food = {
    x: randomGrid(),
    y: randomGrid(),
    emoji: foods[Math.floor(Math.random() * foods.length)]
  };
};

/* =========================
   INIT
========================= */
function initGame() {
  snake = [{ x: 270, y: 240 }];
  direction = null;
  growing = false;
  tongueOut = false;
  tongueTimer = 0;

  score.innerText = "00";
  menu.style.display = "none";
  canvas.style.filter = "none";

  newFood();
}

/* =========================
   DRAW
========================= */
function drawSnake() {
  snake.forEach((part, index) => {
    const isHead = index === snake.length - 1;
    const x = part.x + SIZE / 2;
    const y = part.y + SIZE / 2;
    const radius = isHead ? 14 : 12;

    ctx.beginPath();
    ctx.fillStyle = isHead ? "#2e7d32" : "#66bb6a";
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (isHead) drawHeadDetails(x, y);
  });
}

function drawHeadDetails(x, y) {
  tongueTimer++;

  if (tongueTimer > 60 && Math.random() > 0.98) {
    tongueOut = true;
    tongueTimer = 0;
  }
  if (tongueOut && tongueTimer > 20) tongueOut = false;

  drawEyes(x, y);
  drawMouth(x, y);

  if (tongueOut) drawTongue(x, y);
}

function drawEyes(x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x - 5, y - 5, 4, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 5, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a237e";
  ctx.beginPath();
  ctx.arc(x - 4, y - 4, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 4, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawMouth(x, y) {
  ctx.strokeStyle = "#1b5e20";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y + 6, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function drawTongue(x, y) {
  ctx.strokeStyle = "#e91e63";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x, y + 14);
  ctx.stroke();
}

function drawFood() {
  ctx.font = "24px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(food.emoji, food.x + SIZE / 2, food.y + SIZE / 2);
}

/* =========================
   MOVE
========================= */
function moveSnake() {
  if (!direction) return;

  const head = snake[snake.length - 1];
  const moves = {
    right: { x: SIZE, y: 0 },
    left: { x: -SIZE, y: 0 },
    down: { x: 0, y: SIZE },
    up: { x: 0, y: -SIZE }
  };

  const newHead = {
    x: head.x + moves[direction].x,
    y: head.y + moves[direction].y
  };

  snake.push(newHead);

  if (!growing) snake.shift();
  else growing = false;
}

/* =========================
   EAT
========================= */
function checkEat() {
  const head = snake[snake.length - 1];

  if (head.x === food.x && head.y === food.y) {
    score.innerText = (+score.innerText + 10).toString().padStart(2, "0");
    growing = true;
    tongueOut = true;
    tongueTimer = 0;
    newFood();
  }
}

/* =========================
   COLLISION
========================= */
function checkCollision() {
  const head = snake[snake.length - 1];
  const limit = canvas.width - SIZE;

  const wall =
    head.x < 0 || head.x > limit ||
    head.y < 0 || head.y > limit;

  const self = snake.slice(0, -1).some(
    p => p.x === head.x && p.y === head.y
  );

  if (wall || self) gameOver();
}

/* =========================
   GAME OVER
========================= */
function gameOver() {
  clearTimeout(loopId);
  direction = null;
  menu.style.display = "flex";
  finalScore.innerText = score.innerText;
  canvas.style.filter = "blur(2px)";
}

/* =========================
   LOOP (CONTROLADO)
========================= */
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawFood();
  moveSnake();
  drawSnake();
  checkEat();
  checkCollision();

  loopId = setTimeout(gameLoop, BASE_SPEED);
}

/* =========================
   CONTROLS (SEM VOLTAR)
========================= */
document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowRight" && direction !== "left") direction = "right";
  if (key === "ArrowLeft" && direction !== "right") direction = "left";
  if (key === "ArrowDown" && direction !== "up") direction = "down";
  if (key === "ArrowUp" && direction !== "down") direction = "up";
});

/* =========================
   BUTTON
========================= */
buttonPlay.addEventListener("click", () => {
  clearTimeout(loopId);   // ✅ GARANTE LOOP ÚNICO
  initGame();
  gameLoop();
});

/* =========================
   MENU
========================= */
function voltarMenu() {
  window.location.href = "../../index.html";
}

/* START */
initGame();
gameLoop();
