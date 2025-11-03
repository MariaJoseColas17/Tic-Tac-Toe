const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];
const show = (id) => {
  qsa(".screen").forEach((s) => s.classList.remove("active"));
  qs(id).classList.add("active");
};

const GAME_STATE = {
  mode: null,
  player1: { name: "Jugador 1", score: 0, marker: "X" },
  player2: { name: "CPU", score: 0, marker: "O" },
  draws: 0,
  board: Array(9).fill(null),
  turn: "X",
};

const runLoading = (ms = 1600) => {
  const fill = qs("#barFill");
  let t0 = null;
  const step = (ts) => {
    if (!t0) t0 = ts;
    const p = Math.min(1, (ts - t0) / ms);
    fill.style.width = p * 100 + "%";
    p < 1 ? requestAnimationFrame(step) : show("#screen-menu");
  };
  requestAnimationFrame(step);
};

const startGame = (mode, name1, name2) => {
  GAME_STATE.mode = mode;
  GAME_STATE.player1.name = name1?.trim() || "Jugador";
  GAME_STATE.player2.name =
    mode === "cpu" ? "CPU" : name2?.trim() || "Jugador 2";
  GAME_STATE.board = Array(9).fill(null);
  GAME_STATE.turn = "X";

  setHeader();
  setPanelHead();
  paintBoard();
  show("#screen-game");
};

const setHeader = () => {
  const nL = qs("#nameL"),
    nR = qs("#nameR");
  const iL = qs("#initL"),
    iR = qs("#initR");
  nL.textContent = GAME_STATE.player1.name;
  nR.textContent = GAME_STATE.player2.name;
  iL.textContent = initialsOf(GAME_STATE.player1.name);
  iR.textContent =
    GAME_STATE.mode === "cpu" ? "CPU" : initialsOf(GAME_STATE.player2.name);
  iR.classList.toggle("initials-blue", true);
};

const initialsOf = (s) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const setPanelHead = () => {
  qs("#scoreLName").textContent = initialsOf(GAME_STATE.player1.name);
  qs("#scoreRName").textContent =
    GAME_STATE.mode === "cpu" ? "CPU" : initialsOf(GAME_STATE.player2.name);
};

const paintBoard = () => {
  qsa(".cell").forEach((c) => {
    c.textContent = "";
    // MODIFICADO: Elimina las clases de marcador al reiniciar
    c.classList.remove("marcador-x", "marcador-o");
    c.disabled = false;
  });
};

const place = (i) => {
  if (GAME_STATE.board[i]) return;
  GAME_STATE.board[i] = GAME_STATE.turn;
  const cell = qs(`.cell[data-i="${i}"]`);

  // MODIFICADO: Añade la clase CSS en lugar de texto y estilo en línea
  cell.classList.add(GAME_STATE.turn === "X" ? "marcador-x" : "marcador-o"); // cell.textContent = GAME_STATE.turn === "X" ? "X" : "O"; // cell.style.color = GAME_STATE.turn === "X" ? "#EC8C13" : "#27A8F3";
  // Se eliminan las siguientes 2 líneas:
  if (checkEnd()) endRound();
  else GAME_STATE.turn = GAME_STATE.turn === "X" ? "O" : "X";
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
const checkEnd = () => {
  const b = GAME_STATE.board;
  for (const [a, b1, c] of WIN) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return { w: b[a] };
  }
  if (b.every((v) => v)) return { w: "D" };
  return null;
};
const endRound = () => {
  qsa(".cell").forEach((c) => (c.disabled = true));
};

window.addEventListener("DOMContentLoaded", () => {
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
  qs("#btnRestart")?.addEventListener("click", () =>
    startGame(GAME_STATE.mode, GAME_STATE.player1.name, GAME_STATE.player2.name)
  );
  qs("#btnBack")?.addEventListener("click", () => show("#screen-menu")); // Corregido: btnBack en lugar de btnMenu
});
