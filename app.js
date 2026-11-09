// app.js: connects the buttons and the keyboard to calc.js.

const $ = (id) => document.getElementById(id);
const expr = $("expr");
const result = $("result");
let degrees = true;
let ans = 0;

// Insert text at the cursor position in the expression box.
function insert(text) {
  const start = expr.selectionStart ?? expr.value.length;
  const end = expr.selectionEnd ?? expr.value.length;
  expr.value = expr.value.slice(0, start) + text + expr.value.slice(end);
  const pos = start + text.length;
  expr.focus();
  expr.setSelectionRange(pos, pos);
  preview();
}

// Show a grey live result while typing, if the expression is valid.
function preview() {
  result.className = "result preview";
  try {
    result.textContent = expr.value.trim() ? format(evaluate(expr.value, { degrees, ans })) : "0";
  } catch (e) {
    result.textContent = "";
  }
}

function equals() {
  if (!expr.value.trim()) return;
  try {
    const value = evaluate(expr.value, { degrees, ans });
    ans = value;
    result.className = "result";
    result.textContent = format(value);
    addHistory(`${expr.value} = ${format(value)}`);
  } catch (e) {
    result.className = "result error";
    result.textContent = e.message;
  }
}

function clearAll() {
  expr.value = "";
  result.className = "result";
  result.textContent = "0";
}

function backspace() {
  const start = expr.selectionStart ?? expr.value.length;
  if (start === 0) return;
  expr.value = expr.value.slice(0, start - 1) + expr.value.slice(start);
  expr.setSelectionRange(start - 1, start - 1);
  preview();
}

function toggleMode() {
  degrees = !degrees;
  $("mode").textContent = $("mode-label").textContent = degrees ? "DEG" : "RAD";
  preview();
}

// History: the last 10 calculations, saved in this browser only.
function loadHistory() {
  try { return JSON.parse(localStorage.getItem("calc-history")) || []; } catch (e) { return []; }
}

function renderHistory(list) {
  const ul = $("history");
  ul.innerHTML = "";
  list.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    li.addEventListener("click", () => { expr.value = line.split(" = ")[0]; preview(); });
    ul.appendChild(li);
  });
}

function addHistory(line) {
  const list = [line, ...loadHistory()].slice(0, 10);
  try { localStorage.setItem("calc-history", JSON.stringify(list)); } catch (e) {}
  renderHistory(list);
}

// Buttons: data-insert adds text, data-action runs a command.
const actions = { equals, clear: clearAll, back: backspace, mode: toggleMode };
document.querySelectorAll(".keys button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.insert) insert(button.dataset.insert);
    else actions[button.dataset.action]();
  });
});

// Keyboard: type freely, Enter for =, Escape to clear.
expr.addEventListener("input", preview);
expr.addEventListener("keydown", (event) => {
  if (event.key === "Enter") { event.preventDefault(); equals(); }
  if (event.key === "Escape") clearAll();
});

renderHistory(loadHistory());
expr.focus();
