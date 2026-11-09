// calc.js: a safe expression evaluator (no eval) for the scientific calculator.

// 1. Tokenizer: turn "2×sin(30)+√9" into a list of tokens.
function tokenize(text) {
  const src = text.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").replace(/√/g, "sqrt");
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === " ") { i++; continue; }
    if (/[0-9.]/.test(ch)) {                       // a number like 3.14 or 2e5
      const m = src.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/);
      if (!m) throw new Error("Bad number");
      tokens.push({ type: "num", value: parseFloat(m[0]) });
      i += m[0].length;
    } else if (/[a-z]/i.test(ch)) {                // a name like sin, pi, ans
      const name = src.slice(i).match(/^[a-z]+/i)[0].toLowerCase();
      tokens.push({ type: "name", value: name });
      i += name.length;
    } else if ("+-*/^()!".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
    } else {
      throw new Error(`Unknown symbol "${ch}"`);
    }
  }
  return tokens;
}

const FUNCS = ["sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "sqrt", "abs"];

// 2. Parser + evaluator: recursive descent, one function per precedence level.
function evaluate(text, { degrees = true, ans = 0 } = {}) {
  const tokens = tokenize(text);
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v) => peek() && peek().type === "op" && peek().value === v;
  const toRad = (x) => (degrees ? (x * Math.PI) / 180 : x);
  const fromRad = (x) => (degrees ? (x * 180) / Math.PI : x);

  // expression = term (("+" | "-") term)*
  function expression() {
    let value = term();
    while (isOp("+") || isOp("-")) {
      const op = tokens[pos++].value;
      const right = term();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  // term = unary (("*" | "/") unary | implicit multiplication)*
  function term() {
    let value = unary();
    while (true) {
      if (isOp("*")) { pos++; value *= unary(); }
      else if (isOp("/")) {
        pos++;
        const right = unary();
        if (right === 0) throw new Error("Cannot divide by zero");
        value /= right;
      } else if (peek() && (peek().type === "num" || peek().type === "name" || isOp("("))) {
        value *= unary();                          // 2π, 3(4+1), 2sin(30)
      } else break;
    }
    return value;
  }

  // unary = ("-" | "+") unary | power
  function unary() {
    if (isOp("-")) { pos++; return -unary(); }
    if (isOp("+")) { pos++; return unary(); }
    return power();
  }

  // power = postfix ("^" unary)?   (right-associative: 2^3^2 = 2^9)
  function power() {
    const base = postfix();
    if (isOp("^")) { pos++; return Math.pow(base, unary()); }
    return base;
  }

  // postfix = primary "!"*
  function postfix() {
    let value = primary();
    while (isOp("!")) { pos++; value = factorial(value); }
    return value;
  }

  // primary = number | constant | function "(" expression ")" | "(" expression ")"
  function primary() {
    const tok = tokens[pos++];
    if (!tok) throw new Error("Incomplete expression");
    if (tok.type === "num") return tok.value;
    if (tok.type === "op" && tok.value === "(") {
      const value = expression();
      if (!isOp(")")) throw new Error("Missing )");
      pos++;
      return value;
    }
    if (tok.type === "name") {
      if (tok.value === "pi") return Math.PI;
      if (tok.value === "e") return Math.E;
      if (tok.value === "ans") return ans;
      if (FUNCS.includes(tok.value)) {
        if (!isOp("(")) throw new Error(`${tok.value} needs (`);
        pos++;
        const x = expression();
        if (!isOp(")")) throw new Error("Missing )");
        pos++;
        return applyFunc(tok.value, x);
      }
      throw new Error(`Unknown name "${tok.value}"`);
    }
    throw new Error(`Unexpected "${tok.value}"`);
  }

  function applyFunc(name, x) {
    switch (name) {
      case "sin": return clean(Math.sin(toRad(x)));
      case "cos": return clean(Math.cos(toRad(x)));
      case "tan":
        if (degrees && Math.abs(x % 180) === 90) throw new Error("tan is undefined here");
        return clean(Math.tan(toRad(x)));
      case "asin": case "acos":
        if (x < -1 || x > 1) throw new Error(`${name} needs a value from -1 to 1`);
        return fromRad(name === "asin" ? Math.asin(x) : Math.acos(x));
      case "atan": return fromRad(Math.atan(x));
      case "ln": case "log":
        if (x <= 0) throw new Error(`${name} needs a positive number`);
        return name === "ln" ? Math.log(x) : Math.log10(x);
      case "sqrt":
        if (x < 0) throw new Error("No square root of a negative number");
        return Math.sqrt(x);
      case "abs": return Math.abs(x);
    }
  }

  const result = expression();
  if (pos < tokens.length) throw new Error(`Unexpected "${tokens[pos].value}"`);
  if (!Number.isFinite(result)) throw new Error("Result is too large");
  return result;
}

function factorial(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error("! needs a whole number ≥ 0");
  if (n > 170) throw new Error("Result is too large");
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

// sin(180°) is 1.2e-16 in floating point: treat tiny values as 0.
function clean(x) {
  return Math.abs(x) < 1e-12 ? 0 : x;
}

// 3. Format: 12 significant digits hides floating-point noise (0.1 + 0.2).
function format(x) {
  if (Math.abs(x) >= 1e15 || (x !== 0 && Math.abs(x) < 1e-9)) return x.toExponential(8).replace(/\.?0+e/, "e");
  return String(parseFloat(x.toPrecision(12)));
}

if (typeof module !== "undefined") module.exports = { tokenize, evaluate, format };
