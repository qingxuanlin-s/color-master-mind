const COLOR_POOL = [
  "#ff5449",
  "#ff9f1a",
  "#ffe14c",
  "#34d174",
  "#23b9ff",
  "#5b67ff",
  "#b55bff",
  "#ff5cab",
];

const CODE_SIZE = 4;
const MAX_STEPS = 7;
const EMPTY = -1;

const state = {
  level: 1,
  attempts: 0,
  secret: [],
  guess: Array(CODE_SIZE).fill(EMPTY),
  playing: false,
  selectedColor: null,
};

const machineEl = document.querySelector("#machine");
const levelValueEl = document.querySelector("#levelValue");
const remainingValueEl = document.querySelector("#remainingValue");
const guessRowEl = document.querySelector("#guessRow");
const hintRowEl = document.querySelector("#hintRow");
const paletteEl = document.querySelector("#palette");
const messageEl = document.querySelector("#message");
const submitBtn = document.querySelector("#submitBtn");
const clearBtn = document.querySelector("#clearBtn");
const newGameBtn = document.querySelector("#newGameBtn");
const historyListEl = document.querySelector("#historyList");

function toggleGameActionButtons(visible) {
  submitBtn.classList.toggle("is-hidden", !visible);
  clearBtn.classList.toggle("is-hidden", !visible);
}

function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`.trim();
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function activePalette() {
  return COLOR_POOL;
}

function randomCode() {
  const palette = activePalette();
  return Array.from({ length: CODE_SIZE }, () => randomInt(palette.length));
}

function renderStatus() {
  levelValueEl.textContent = String(state.level);
  remainingValueEl.textContent = String(state.playing ? MAX_STEPS - state.attempts : MAX_STEPS);
}

function renderHint(states = ["none", "none", "none", "none"]) {
  hintRowEl.innerHTML = "";
  states.forEach((value) => {
    const hint = document.createElement("div");
    hint.className = "hint";
    if (value === "exact") {
      hint.classList.add("exact");
    }
    if (value === "color") {
      hint.classList.add("color");
    }
    hintRowEl.append(hint);
  });
}

function setCellColor(cell, colorIndex) {
  if (colorIndex === EMPTY) {
    cell.style.background = "";
    cell.classList.remove("filled");
    return;
  }
  cell.style.background = activePalette()[colorIndex];
  cell.classList.add("filled");
}

function renderGuess() {
  guessRowEl.innerHTML = "";
  state.guess.forEach((colorIndex, slotIndex) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.slot = String(slotIndex);
    setCellColor(cell, colorIndex);

    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
      cell.classList.add("over");
    });
    cell.addEventListener("dragleave", () => {
      cell.classList.remove("over");
    });
    cell.addEventListener("drop", (event) => {
      event.preventDefault();
      const dragged = Number(event.dataTransfer?.getData("text/plain"));
      if (!Number.isNaN(dragged)) {
        placeColor(slotIndex, dragged);
      }
      cell.classList.remove("over");
    });
    cell.addEventListener("click", () => {
      if (state.selectedColor === null) {
        return;
      }
      placeColor(slotIndex, state.selectedColor);
    });

    guessRowEl.append(cell);
  });
}

function renderPalette() {
  paletteEl.innerHTML = "";
  const palette = activePalette();
  palette.forEach((color, index) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    if (state.selectedColor === index) {
      swatch.classList.add("selected");
    }
    swatch.style.background = color;
    swatch.draggable = true;
    swatch.title = `颜色 ${index + 1}`;

    swatch.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/plain", String(index));
    });
    swatch.addEventListener("click", () => {
      state.selectedColor = index;
      renderPalette();
      setMessage("已选中颜色，点击上方空格即可填入。", "");
    });

    paletteEl.append(swatch);
  });
}

function clearHistory() {
  historyListEl.innerHTML = "";
}

function appendHistory(guess, feedback) {
  const row = document.createElement("div");
  row.className = "record";
  const chips = guess
    .map((c) => `<span class="chip" style="background:${activePalette()[c]}"></span>`)
    .join("");
  row.innerHTML = `
    <span>第 ${state.attempts} 步</span>
    <span class="chips">${chips}</span>
    <span>${feedback.exact} 绿 ${feedback.color} 白</span>
  `;
  historyListEl.prepend(row);
}

function feedbackFor(guess, secret) {
  let exact = 0;
  const remainGuess = [];
  const remainSecret = [];

  for (let i = 0; i < CODE_SIZE; i += 1) {
    if (guess[i] === secret[i]) {
      exact += 1;
    } else {
      remainGuess.push(guess[i]);
      remainSecret.push(secret[i]);
    }
  }

  let color = 0;
  for (const g of remainGuess) {
    const idx = remainSecret.indexOf(g);
    if (idx !== -1) {
      color += 1;
      remainSecret.splice(idx, 1);
    }
  }
  return { exact, color };
}

function feedbackToUnderline(feedback) {
  const result = [];
  for (let i = 0; i < feedback.exact; i += 1) {
    result.push("exact");
  }
  for (let i = 0; i < feedback.color; i += 1) {
    result.push("color");
  }
  while (result.length < CODE_SIZE) {
    result.push("none");
  }
  return result;
}

function flashVictory() {
  machineEl.classList.add("victory");
  setTimeout(() => machineEl.classList.remove("victory"), 1700);
}

function revealAnswer() {
  const answer = state.secret
    .map((c) => `<span class="chip" style="background:${activePalette()[c]}"></span>`)
    .join("");
  const row = document.createElement("div");
  row.className = "record";
  row.innerHTML = `
    <span>答案</span>
    <span class="chips">${answer}</span>
    <span>未破解</span>
  `;
  historyListEl.prepend(row);
}

function resetGuess() {
  state.guess = Array(CODE_SIZE).fill(EMPTY);
  renderGuess();
}

function startLevel(level) {
  state.level = level;
  state.attempts = 0;
  state.secret = randomCode();
  state.playing = true;
  state.selectedColor = 0;
  clearHistory();
  resetGuess();
  renderPalette();
  renderStatus();
  renderHint();
  toggleGameActionButtons(true);
  setMessage("拖动颜色到上方空格，或先点颜色再点空格。", "");
}

function startGame() {
  startLevel(1);
}

function placeColor(slotIndex, colorIndex) {
  if (!state.playing) {
    setMessage("请先点击“开始游戏”。", "warn");
    return;
  }
  if (slotIndex < 0 || slotIndex >= CODE_SIZE) {
    return;
  }
  state.guess[slotIndex] = colorIndex;
  renderGuess();
  const cell = guessRowEl.querySelector(`[data-slot="${slotIndex}"]`);
  if (cell) {
    cell.classList.add("snap");
    window.setTimeout(() => cell.classList.remove("snap"), 220);
  }
}

function isGuessComplete() {
  return state.guess.every((value) => value !== EMPTY);
}

function submitGuess() {
  if (!state.playing) {
    setMessage("请先点击“开始游戏”。", "warn");
    return;
  }
  if (!isGuessComplete()) {
    setMessage("请先把4个空位都填满再提交。", "warn");
    return;
  }

  state.attempts += 1;
  const feedback = feedbackFor(state.guess, state.secret);
  renderHint(feedbackToUnderline(feedback));
  appendHistory(state.guess, feedback);
  renderStatus();

  if (feedback.exact === CODE_SIZE) {
    state.playing = false;
    setMessage("破解成功，灯效启动，准备进入下一关...", "ok");
    flashVictory();
    setTimeout(() => startLevel(state.level + 1), 1900);
    return;
  }

  if (state.attempts >= MAX_STEPS) {
    state.playing = false;
    setMessage("本关失败，请点击“开始游戏”重新挑战。", "warn");
    revealAnswer();
    return;
  }

  resetGuess();
  setMessage(`反馈：${feedback.exact}绿 ${feedback.color}白，继续拖动填空。`, "");
}

function clearGuess() {
  if (!state.playing) {
    setMessage("请先点击“开始游戏”。", "warn");
    return;
  }
  resetGuess();
  setMessage("已清空当前填空。", "");
}

submitBtn.addEventListener("click", submitGuess);
clearBtn.addEventListener("click", clearGuess);
newGameBtn.addEventListener("click", startGame);

renderStatus();
renderHint();
renderGuess();
toggleGameActionButtons(false);
