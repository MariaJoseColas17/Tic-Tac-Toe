const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];

const show = (selector) => {
  qsa(".screen").forEach((s) => s.classList.remove("active"));
  const el = qs(selector);
  if (el) el.classList.add("active");
};

const GAME_STATE = {
  mode: null,
  player1: { name: "Jugador 1", score: 0, marker: "X" },
  player2: { name: "CPU", score: 0, marker: "O" },
  draws: 0,
  board: Array(9).fill(null),
  turn: "X",
  gameOver: false,
};

const SFX = {
  click: new Audio("./assets/sounds/click.mp3"),
  win: new Audio("./assets/sounds/win.mp3"),
  lose: new Audio("./assets/sounds/lose.mp3"),
  draw: new Audio("./assets/sounds/draw.mp3"),
};

Object.values(SFX).forEach((audio) => {
  audio.volume = 0.6;
});

const openOverlay = (selector) => {
  const el = qs(selector);
  if (el) el.classList.add("overlay-active");
};

const closeOverlays = () => {
  [
    "#screen-winner",
    "#screen-draw",
    "#screen-continue-options",
    "#screen-confirm-reset",
  ].forEach((id) => {
    const el = qs(id);
    if (el) el.classList.remove("overlay-active");
  });
};

const setGameDimmed = (on) => {
  const gameScreen = qs("#screen-game");
  if (!gameScreen) return;
  if (on) {
    gameScreen.classList.add("dimmed");
  } else {
    gameScreen.classList.remove("dimmed");
  }
};

const runLoading = (ms = 1600) => {
  const fill = qs("#barFill");
  if (!fill) return;

  fill.style.width = "0%";

  const start = performance.now();

  const step = (now) => {
    const p = Math.min(1, (now - start) / ms);
    fill.style.width = p * 100 + "%";
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      show("#screen-menu");
    }
  };

  requestAnimationFrame(step);
};

const startGame = (mode, name1, name2) => {
  GAME_STATE.mode = mode;
  GAME_STATE.player1.name = (name1 || "").trim() || "Jugador";
  GAME_STATE.player2.name =
    mode === "cpu" ? "CPU" : (name2 || "").trim() || "Jugador 2";
  GAME_STATE.board = Array(9).fill(null);
  GAME_STATE.turn = "X";
  GAME_STATE.gameOver = false;

  closeOverlays();
  setGameDimmed(false);
  paintBoard();

  setHeader();
  setPanelHead();
  updateScoreDisplay();

  show("#screen-game");
};

const setHeader = () => {
  const nL = qs("#nameL");
  const nR = qs("#nameR");
  const iL = qs("#initL");
  const iR = qs("#initR");

  if (nL) nL.textContent = GAME_STATE.player1.name;
  if (nR) nR.textContent = GAME_STATE.player2.name;

  if (iL) iL.textContent = initialsOf(GAME_STATE.player1.name);
  if (iR) {
    iR.textContent =
      GAME_STATE.mode === "cpu" ? "CPU" : initialsOf(GAME_STATE.player2.name);
    iR.classList.add("initials-blue");
  }
};

const initialsOf = (s) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const setPanelHead = () => {
  const l = qs("#scoreLName");
  const r = qs("#scoreRName");
  if (l) l.textContent = initialsOf(GAME_STATE.player1.name);
  if (r)
    r.textContent =
      GAME_STATE.mode === "cpu" ? "CPU" : initialsOf(GAME_STATE.player2.name);
};

const paintBoard = () => {
  qsa(".cell").forEach((c) => {
    c.textContent = "";
    c.classList.remove("marcador-x", "marcador-o");
    c.disabled = false;
    c.style.backgroundColor = "";
    c.style.opacity = "";
  });
};

const updateScoreDisplay = () => {
  const scoreLVal = qs("#scoreLVal");
  const scoreRVal = qs("#scoreRVal");
  const scoreDVal = qs("#scoreDVal");

  if (scoreLVal) scoreLVal.textContent = GAME_STATE.player1.score;
  if (scoreRVal) scoreRVal.textContent = GAME_STATE.player2.score;
  if (scoreDVal) scoreDVal.textContent = GAME_STATE.draws;
};

const WIN = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const place = (i) => {
  if (GAME_STATE.board[i] || GAME_STATE.gameOver) return;

  GAME_STATE.board[i] = GAME_STATE.turn;
  const cell = qs(`.cell[data-i="${i}"]`);
  if (cell) {
    cell.classList.add(GAME_STATE.turn === "X" ? "marcador-x" : "marcador-o");
  }

  if (SFX.click) {
    SFX.click.currentTime = 0;
    SFX.click.play();
  }

  const result = checkEnd();
  if (result) {
    endRound(result);
  } else {
    GAME_STATE.turn = GAME_STATE.turn === "X" ? "O" : "X";

    if (GAME_STATE.mode === "cpu" && GAME_STATE.turn === "O") {
      setTimeout(cpuMove, 500);
    }
  }
};

const cpuMove = () => {
  if (GAME_STATE.gameOver) return;

  const move = getBestMove();
  if (move !== -1) {
    place(move);
  }
};

const getBestMove = () => {
  const canWin = findWinningMove("O");
  if (canWin !== -1) return canWin;

  const mustBlock = findWinningMove("X");
  if (mustBlock !== -1) return mustBlock;

  if (GAME_STATE.board[4] === null) return 4;

  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => GAME_STATE.board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[
      Math.floor(Math.random() * availableCorners.length)
    ];
  }

  const sides = [1, 3, 5, 7];
  const availableSides = sides.filter((i) => GAME_STATE.board[i] === null);
  if (availableSides.length > 0) {
    return availableSides[Math.floor(Math.random() * availableSides.length)];
  }

  return -1;
};

const findWinningMove = (marker) => {
  for (const [a, b, c] of WIN) {
    const line = [
      GAME_STATE.board[a],
      GAME_STATE.board[b],
      GAME_STATE.board[c],
    ];
    const markerCount = line.filter((cell) => cell === marker).length;
    const emptyCount = line.filter((cell) => cell === null).length;

    if (markerCount === 2 && emptyCount === 1) {
      if (GAME_STATE.board[a] === null) return a;
      if (GAME_STATE.board[b] === null) return b;
      if (GAME_STATE.board[c] === null) return c;
    }
  }
  return -1;
};

const checkEnd = () => {
  const b = GAME_STATE.board;

  for (const [a, b1, c] of WIN) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return { winner: b[a], line: [a, b1, c] };
    }
  }

  if (b.every((v) => v !== null)) {
    return { winner: "D" };
  }

  return null;
};

const endRound = (result) => {
  GAME_STATE.gameOver = true;
  qsa(".cell").forEach((c) => (c.disabled = true));

  if (result.winner === "X") {
    GAME_STATE.player1.score++;
  } else if (result.winner === "O") {
    GAME_STATE.player2.score++;
  } else if (result.winner === "D") {
    GAME_STATE.draws++;
  }

  updateScoreDisplay();

  if (result.line) {
    result.line.forEach((i) => {
      const cell = qs(`.cell[data-i="${i}"]`);
      if (cell) {
        cell.style.backgroundColor =
          result.winner === "X" ? "#EC8C13" : "#27A8F3";
        cell.style.opacity = "0.7";
      }
    });
  }

  setTimeout(() => showResultScreen(result.winner), 1000);
};

const showResultScreen = (winner) => {
  setGameDimmed(true);

  if (winner === "D") {
    if (SFX.draw) {
      SFX.draw.currentTime = 0;
      SFX.draw.play();
    }
    setupDrawScreen();
    openOverlay("#screen-draw");
  } else if (winner === "X" || winner === "O") {
    if (GAME_STATE.mode === "cpu") {
      if (winner === "X") {
        if (SFX.win) {
          SFX.win.currentTime = 0;
          SFX.win.play();
        }
      } else {
        if (SFX.lose) {
          SFX.lose.currentTime = 0;
          SFX.lose.play();
        }
      }
    } else {
      if (SFX.win) {
        SFX.win.currentTime = 0;
        SFX.win.play();
      }
    }

    setupWinnerScreen(winner);
    openOverlay("#screen-winner");
  }
};

const setupDrawScreen = () => {
  const drawTitle = qs("#drawTitle");
  const drawSubtitle = qs("#drawSubtitle");

  if (drawTitle) drawTitle.textContent = "EMPATE";
  if (drawSubtitle) drawSubtitle.textContent = "";

  updateResultScores("draw");
};

const setupWinnerScreen = (winnerMarker) => {
  const winnerTitle = qs("#winnerTitle");
  const winnerSubtitle = qs("#winnerSubtitle");
  const resultIcon = qs("#resultIcon");

  let titleText = "";
  let subtitleName = "";
  let iconUrl = "";

  if (GAME_STATE.mode === "cpu") {
    subtitleName = GAME_STATE.player1.name;
    if (winnerMarker === "X") {
      titleText = "VICTORIA";
      iconUrl = "./assets/trophy.png";
    } else {
      titleText = "PERDISTE";
      iconUrl = "./assets/sad-face.png";
    }
  } else {
    subtitleName =
      winnerMarker === "X" ? GAME_STATE.player1.name : GAME_STATE.player2.name;
    titleText = "VICTORIA";
    iconUrl = "./assets/trophy.png";
  }

  if (winnerTitle) winnerTitle.textContent = titleText;
  if (winnerSubtitle) winnerSubtitle.textContent = subtitleName.toUpperCase();
  if (resultIcon) resultIcon.style.backgroundImage = `url('${iconUrl}')`;

  updateResultScores("winner");
};

const updateResultScores = (screenType) => {
  const prefix = screenType === "draw" ? "draw" : "result";

  const player1El = qs(`#${prefix}Player1`);
  const player2El = qs(`#${prefix}Player2`);
  const score1El = qs(`#${prefix}Score1`);
  const score2El = qs(`#${prefix}Score2`);
  const drawsEl = qs(`#${prefix}Draws`);

  if (player1El) player1El.textContent = initialsOf(GAME_STATE.player1.name);
  if (player2El) {
    player2El.textContent =
      GAME_STATE.mode === "cpu" ? "CPU" : initialsOf(GAME_STATE.player2.name);
  }

  if (score1El) score1El.textContent = `${GAME_STATE.player1.score} GANADAS`;
  if (score2El) score2El.textContent = `${GAME_STATE.player2.score} GANADAS`;
  if (drawsEl) drawsEl.textContent = `${GAME_STATE.draws} EMPATES`;
};

const continueToOptions = () => {
  closeOverlays();
  setGameDimmed(true);
  openOverlay("#screen-continue-options");
};

const keepScore = () => {
  GAME_STATE.board = Array(9).fill(null);
  GAME_STATE.turn = "X";
  GAME_STATE.gameOver = false;

  paintBoard();
  updateScoreDisplay();

  closeOverlays();
  setGameDimmed(false);
  show("#screen-game");
};

const confirmResetScore = () => {
  closeOverlays();
  setGameDimmed(true);
  openOverlay("#screen-confirm-reset");
};

const resetScore = () => {
  GAME_STATE.player1.score = 0;
  GAME_STATE.player2.score = 0;
  GAME_STATE.draws = 0;
  GAME_STATE.board = Array(9).fill(null);
  GAME_STATE.turn = "X";
  GAME_STATE.gameOver = false;

  paintBoard();
  updateScoreDisplay();

  closeOverlays();
  setGameDimmed(false);
  show("#screen-game");
};

const cancelReset = () => {
  closeOverlays();
  setGameDimmed(false);
};

const exitToMenu = () => {
  GAME_STATE.mode = null;
  GAME_STATE.player1 = { name: "Jugador 1", score: 0, marker: "X" };
  GAME_STATE.player2 = { name: "CPU", score: 0, marker: "O" };
  GAME_STATE.draws = 0;
  GAME_STATE.board = Array(9).fill(null);
  GAME_STATE.turn = "X";
  GAME_STATE.gameOver = false;

  const p1NameInput = qs("#p1Name");
  const pvpName1Input = qs("#pvpName1");
  const pvpName2Input = qs("#pvpName2");
  if (p1NameInput) p1NameInput.value = "";
  if (pvpName1Input) pvpName1Input.value = "";
  if (pvpName2Input) pvpName2Input.value = "";

  const barFill = qs("#barFill");
  if (barFill) barFill.style.width = "0";

  closeOverlays();
  setGameDimmed(false);

  show("#screen-loading");
  runLoading();
};

window.addEventListener("DOMContentLoaded", () => {
  show("#screen-loading");
  runLoading();

  qs("#btnCpu")?.addEventListener("click", () => show("#screen-setup-p1"));
  qs("#btnPvp")?.addEventListener("click", () => show("#screen-setup-pvp"));

  qs("#p1Start")?.addEventListener("click", () =>
    startGame("cpu", qs("#p1Name").value, "CPU")
  );
  qs("#pvpStart")?.addEventListener("click", () =>
    startGame("pvp", qs("#pvpName1").value, qs("#pvpName2").value)
  );

  qsa(".cell").forEach((el) =>
    el.addEventListener("click", (e) => place(+e.currentTarget.dataset.i))
  );

  qs("#btnRestart")?.addEventListener("click", () => confirmResetScore());
  qs("#btnBack")?.addEventListener("click", () => exitToMenu());

  qs("#btnNextRound")?.addEventListener("click", continueToOptions);
  qs("#btnNextRoundDraw")?.addEventListener("click", continueToOptions);
  qs("#btnCancelResult")?.addEventListener("click", exitToMenu);
  qs("#btnCancelDraw")?.addEventListener("click", exitToMenu);

  qs("#btnKeepScore")?.addEventListener("click", keepScore);
  qs("#btnResetScore")?.addEventListener("click", confirmResetScore);

  qs("#btnConfirmReset")?.addEventListener("click", resetScore);
  qs("#btnCancelReset")?.addEventListener("click", cancelReset);
});
