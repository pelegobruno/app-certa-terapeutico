const cells = document.querySelectorAll(".celula");
const boardEl = document.getElementById("tabuleiro");
const status = document.getElementById("status-jogo");
const btnRestart = document.getElementById("btn-restart");
const winLine = document.getElementById("win-line");

let currentPlayer = "❌";
let board = Array(9).fill("");
let gameActive = true;

const wins = {
  "0,1,2": { top: 50, left: 0, width: 300, rotate: 0 },
  "3,4,5": { top: 150, left: 0, width: 300, rotate: 0 },
  "6,7,8": { top: 250, left: 0, width: 300, rotate: 0 },

  "0,3,6": { top: 0, left: 50, width: 300, rotate: 90 },
  "1,4,7": { top: 0, left: 150, width: 300, rotate: 90 },
  "2,5,8": { top: 0, left: 250, width: 300, rotate: 90 },

  "0,4,8": { top: 0, left: 0, width: 420, rotate: 45 },
  "2,4,6": { top: 300, left: 0, width: 420, rotate: -45 }
};

cells.forEach(cell => {
  cell.addEventListener("click", () => {
    const i = cell.dataset.index;
    if (!gameActive || board[i]) return;

    board[i] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer === "❌" ? "x" : "o");

    checkGame();
  });
});

function checkGame() {
  for (let key in wins) {
    const [a,b,c] = key.split(",").map(Number);
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      endGame(board[a], wins[key]);
      return;
    }
  }

  if (!board.includes("")) {
    status.textContent = "Empate!";
    endGame();
    return;
  }

  currentPlayer = currentPlayer === "❌" ? "⭕" : "❌";
  status.textContent = `Vez do jogador ${currentPlayer}`;
}

function endGame(winner, line) {
  gameActive = false;
  boardEl.classList.add("finished");

  if (winner) {
    status.textContent = `Jogador ${winner} venceu! 🎉`;
    winLine.style.display = "block";
    winLine.style.top = line.top + "px";
    winLine.style.left = line.left + "px";
    winLine.style.width = line.width + "px";
    winLine.style.transform = `rotate(${line.rotate}deg)`;
  }

  btnRestart.style.display = "inline-block";
}

btnRestart.addEventListener("click", () => {
  board.fill("");
  cells.forEach(c => {
    c.textContent = "";
    c.className = "celula";
  });

  winLine.style.display = "none";
  boardEl.classList.remove("finished");

  currentPlayer = "❌";
  gameActive = true;
  status.textContent = "Vez do jogador ❌";
  btnRestart.style.display = "none";
});
