// script.js
const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

const show = (id) => {
  qsa(".screen").forEach((s) => s.classList.remove("active"));
  qs(id).classList.add("active");
};

const GAME_STATE = {
  mode: null,
  playerNames: { X: "JUGADOR 1 (X)", O: "JUGADOR 2 (O)" },
  scores: { X: 0, O: 0, TIE: 0 },
  currentPlayer: "X",
  board: new Array(9).fill(null),
  gameOver: false,
};

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const GameCore = {
  init: (mode, p1Name = "JUGADOR 1", p2Name = "JUGADOR 2") => {
    GAME_STATE.mode = mode;
    GAME_STATE.playerNames.X =
      mode === "cpu" ? p1Name + " (X)" : p1Name + " (X)";
    GAME_STATE.playerNames.O = mode === "cpu" ? "CPU (O)" : p2Name + " (O)";
    GameCore.resetBoard(false);
    GameCore.updateScoreboard();
    show("#screen-game");
  },

  resetBoard: (fullReset = true) => {
    GAME_STATE.board.fill(null);
    GAME_STATE.gameOver = false;
    GAME_STATE.currentPlayer = "X";
    GameCore.renderBoard();
    GameCore.updateTurnIndicator();

    if (fullReset) {
      GAME_STATE.scores = { X: 0, O: 0, TIE: 0 };
      GameCore.updateScoreboard();
    }
  },

  renderBoard: () => {
    const boardGrid = qs("#gameBoard");
    boardGrid.innerHTML = "";

    GAME_STATE.board.forEach((mark, index) => {
      const cell = document.createElement("div");
      cell.classList.add("board-cell");
      cell.dataset.index = index;

      if (mark) {
        cell.innerHTML = `<img src="./assets/icon-${mark.toLowerCase()}.svg" alt="${mark}" />`;
        cell.style.cursor = "default";
      } else {
        cell.addEventListener("click", GameCore.handleCellClick);
      }
      boardGrid.appendChild(cell);
    });
  },

  handleCellClick: (e) => {
    if (GAME_STATE.gameOver) return;

    const index = parseInt(e.target.dataset.index);
    if (GAME_STATE.board[index] === null) {
      GameCore.placeMark(index, GAME_STATE.currentPlayer);

      if (GameCore.checkWin(GAME_STATE.currentPlayer)) {
        GameCore.handleWin(GAME_STATE.currentPlayer);
      } else if (GameCore.checkDraw()) {
        GameCore.handleDraw();
      } else {
        GameCore.changeTurn();
      }
    }
  },

  placeMark: (index, mark) => {
    GAME_STATE.board[index] = mark;
    const cell = qs(`.board-cell[data-index="${index}"]`);
    cell.innerHTML = `<img src="./assets/icon-${mark.toLowerCase()}.svg" alt="${mark}" />`;
    cell.removeEventListener("click", GameCore.handleCellClick);
    cell.style.cursor = "default";
  },

  checkWin: (mark) => {
    return WINNING_COMBOS.some((combination) => {
      return combination.every((index) => {
        return GAME_STATE.board[index] === mark;
      });
    });
  },

  handleWin: (winner) => {
    GAME_STATE.gameOver = true;
    GAME_STATE.scores[winner] += 1;
    GameCore.updateScoreboard();
    GameCore.updateTurnIndicator(`¡${GAME_STATE.playerNames[winner]} GANA!`);
  },

  checkDraw: () => {
    return GAME_STATE.board.every((cell) => cell !== null);
  },

  handleDraw: () => {
    GAME_STATE.gameOver = true;
    GAME_STATE.scores.TIE += 1;
    GameCore.updateScoreboard();
    GameCore.updateTurnIndicator("¡EMPATE!");
  },

  changeTurn: () => {
    GAME_STATE.currentPlayer = GAME_STATE.currentPlayer === "X" ? "O" : "X";
    GameCore.updateTurnIndicator();
  },

  updateTurnIndicator: (message = null) => {
    const indicator = qs(".turn-indicator");
    const icon = qs(".turn-icon");
    const text = qs(".turn-text");

    if (message) {
      icon.textContent = "";
      text.textContent = message;
      indicator.style.opacity = 1;
      indicator.style.background = "#4CAF50";
    } else {
      icon.textContent = GAME_STATE.currentPlayer;
      text.textContent = "TURNO";
      indicator.style.opacity = 0.8;
      indicator.style.background = "var(--dark-1)";
      icon.style.color =
        GAME_STATE.currentPlayer === "X" ? "var(--blue-cta)" : "var(--orange)";
    }
  },

  updateScoreboard: () => {
    qs("#scoreP1 .score-name").textContent = GAME_STATE.playerNames.X;
    qs("#scoreP1 .score-value").textContent = GAME_STATE.scores.X;
    qs("#scoreP2 .score-name").textContent = GAME_STATE.playerNames.O;
    qs("#scoreP2 .score-value").textContent = GAME_STATE.scores.O;
    qs("#scoreTies .score-value").textContent = GAME_STATE.scores.TIE;
  },
};

const runLoading = (ms = 1600) => {
  const fill = qs("#barFill");
  let t0 = null;
  const step = (ts) => {
    if (!t0) t0 = ts;
    const p = Math.min(1, (ts - t0) / ms);
    fill.style.width = p * 100 + "%";
    if (p < 1) requestAnimationFrame(step);
    else show("#screen-menu");
  };
  requestAnimationFrame(step);
};

window.addEventListener("DOMContentLoaded", () => {
  runLoading();

  qs("#btnCpu")?.addEventListener("click", () => show("#screen-setup-p1"));
  qs("#btnPvp")?.addEventListener("click", () => show("#screen-setup-pvp"));

  qs("#pvpStart")?.addEventListener("click", () => {
    const p1Name = qs("#pvpName1").value.trim() || "JUGADOR 1";
    const p2Name = qs("#pvpName2").value.trim() || "JUGADOR 2";
    GameCore.init("pvp", p1Name, p2Name);
  });

  qs("#p1Start")?.addEventListener("click", () => {
    const p1Name = qs("#p1Name").value.trim() || "JUGADOR";
    GameCore.init("cpu", p1Name);
  });

  qs("#btnRestart")?.addEventListener("click", () =>
    GameCore.resetBoard(false)
  );
  qs("#btnMenu")?.addEventListener("click", () => show("#screen-menu"));
});
