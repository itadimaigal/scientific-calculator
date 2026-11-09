# Scientific Calculator

This is a free scientific calculator that runs entirely in your browser. It's the companion code for the **itadimaigal** video *Build a Scientific Calculator*, presented by Professor SK.

**Try it:** https://itadimaigal.github.io/scientific-calculator/

## Features

* **Operations:**
  * `+ − × ÷` with the right precedence;
  * powers `xʸ` and `x²`, square root `√`, factorial `n!`;
  * trigonometry: `sin cos tan` and inverses, in **DEG** or **RAD** mode;
  * logarithms: `ln` and `log`;
  * constants `π` and `e`, and `Ans` for the last result.
* **Natural input:** implicit multiplication, so `2π`, `3(4+1)` and `2sin(30)` all work.
* **Live preview:** see the result while you type.
* **Keyboard support:** type an expression, press **Enter** for `=` and **Esc** to clear.
* **History:** your last 10 calculations, saved only in your browser. Click one to reuse it.
* **Clear errors:** for example "Cannot divide by zero" or "tan is undefined here".
* **Safe:** no `eval()`. A small hand-written parser in `calc.js` evaluates the expression.

## Files

| File | What it does |
|---|---|
| `index.html` | The page: display and buttons |
| `style.css` | The dark theme and button grid |
| `calc.js` | Tokenizer, recursive-descent parser and evaluator, plus number formatting |
| `app.js` | Connects buttons, keyboard and history to `calc.js` |
| `test.js` | 29 tests for `calc.js`. Run `node test.js` |

## Run it locally

Open `index.html` in a browser, or start a local server:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
node test.js                     # run the tests (Node.js 18+)
```

## Publish with GitHub Pages

1. Push the files to a repository named `scientific-calculator`.
2. Go to **Settings → Pages**, then choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After about a minute, the calculator is live at `https://<your-user>.github.io/scientific-calculator/`.

## How the parser works

Precedence goes from lowest to highest. Each level is one function in `calc.js`:

```
expression = term (("+" | "-") term)*
term       = unary (("*" | "/") unary | implicit multiplication)*
unary      = ("-" | "+") unary | power
power      = postfix ("^" unary)?          // right-associative: 2^3^2 = 512
postfix    = primary "!"*
primary    = number | π | e | Ans | function "(" expression ")" | "(" expression ")"
```

So `-2^2 = -4`, `2+3×4 = 14` and `2^3^2 = 512`, just like a real scientific calculator.

Made for the itadimaigal YouTube channel. Use, change and share freely.
