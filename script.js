const LS_SCORE = "ttt:score:v1",
  LS_STATE = "ttt:state:v1",
  LS_PREFS = "ttt:prefs:v1";
const WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const Core = (() => {
  let state = {
    board: Array(9).fill(null),
    turn: "X",
    mode: "pvp",
    score: { X: 0, O: 0, D: 0 },
    rotateStart: false,
    persistBoard: true,
  };
  const load = () => {
    try {
      const s = JSON.parse(localStorage.getItem(LS_SCORE) || "null");
      const st = JSON.parse(localStorage.getItem(LS_STATE) || "null");
      const p = JSON.parse(localStorage.getItem(LS_PREFS) || "null");
      if (s) state.score = s;
      if (p) {
        state.rotateStart = !!p.rotateStart;
        state.persistBoard = p.persistBoard !== false;
      }
      if (st && state.persistBoard) {
        state.board = st.board;
        state.turn = st.turn;
        state.mode = st.mode;
      }
    } catch (e) {}
  };
  const saveScore = () =>
    localStorage.setItem(LS_SCORE, JSON.stringify(state.score));
  const saveState = () =>
    state.persistBoard &&
    localStorage.setItem(
      LS_STATE,
      JSON.stringify({ board: state.board, turn: state.turn, mode: state.mode })
    );
  const savePrefs = () =>
    localStorage.setItem(
      LS_PREFS,
      JSON.stringify({
        rotateStart: state.rotateStart,
        persistBoard: state.persistBoard,
      })
    );
  const emptyIdxs = (b) =>
    b.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  const winner = (b) => {
    for (const [a, c, d] of WINS) {
      if (b[a] && b[a] === b[c] && b[a] === b[d])
        return { w: b[a], line: [a, c, d] };
    }
    if (b.every((v) => v)) return { w: "D", line: [] };
    return null;
  };
  const play = (i) => {
    if (state.board[i] || winner(state.board)) return null;
    state.board[i] = state.turn;
    state.turn = state.turn === "X" ? "O" : "X";
    const res = winner(state.board);
    if (res) {
      if (res.w === "D") state.score.D++;
      else state.score[res.w]++;
      saveScore();
      saveState();
      return res;
    }
    saveState();
    return null;
  };
  const newGame = (last = null) => {
    state.board = Array(9).fill(null);
    let start = "X";
    if (state.rotateStart) {
      if (last === "X") start = "O";
      else if (last === "O") start = "X";
      else start = state.turn === "X" ? "O" : "X";
    }
    state.turn = start;
    saveState();
  };
  const resetScore = () => {
    state.score = { X: 0, O: 0, D: 0 };
    saveScore();
  };
  const setMode = (m) => {
    state.mode = m;
    saveState();
  };
  const setRotate = (v) => {
    state.rotateStart = !!v;
    savePrefs();
  };
  const setPersist = (v) => {
    state.persistBoard = !!v;
    savePrefs();
  };
  const getState = () => JSON.parse(JSON.stringify(state));
  load();
  return {
    play,
    newGame,
    resetScore,
    setMode,
    setRotate,
    setPersist,
    getState,
    emptyIdxs,
    winner,
  };
})();
window.Core = Core;
const CoreTest = (() => {
  const R = () => ({ p: 0, f: 0, log: [] }),
    E = (r, n, c) => {
      c ? (r.p++, r.log.push(["OK", n])) : (r.f++, r.log.push(["FAIL", n]));
    };
  const seq = (moves) => {
    Core.newGame();
    let last = null;
    for (const i of moves) {
      last = Core.play(i);
    }
    return last;
  };
  const run = () => {
    localStorage.removeItem("ttt:score:v1");
    localStorage.removeItem("ttt:state:v1");
    localStorage.removeItem("ttt:prefs:v1");
    const r = R();
    let s = Core.getState();
    E(r, "init turn X", s.turn === "X");
    E(r, "init score 0", s.score.X === 0 && s.score.O === 0 && s.score.D === 0);
    Core.setRotate(false);
    Core.setPersist(true);
    let res = seq([0, 3, 1, 4, 2]);
    E(r, "X wins", res && res.w === "X");
    s = Core.getState();
    E(r, "score X=1", s.score.X === 1);
    Core.newGame();
    res = seq([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    E(r, "draw", res && res.w === "D");
    s = Core.getState();
    E(r, "score D=1", s.score.D === 1);
    Core.newGame();
    Core.play(4);
    const st = JSON.parse(localStorage.getItem("ttt:state:v1") || "null");
    E(r, "persist board", !!st && st.board[4] === "X");
    Core.setRotate(true);
    Core.newGame("X");
    s = Core.getState();
    E(r, "rotate start O", s.turn === "O");
    return r;
  };
  return { run };
})();
if (location.search.includes("test=core")) {
  const r = CoreTest.run();
  console.table(r.log);
  document.title =
    r.f === 0 ? `core: ok (${r.p} tests)` : `core: fail (${r.f} fails)`;
}
