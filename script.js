/* ===== Calculator Logic (Vanilla JS) =====
   We avoid eval() for safety and control.
   We'll store:
   - currentInput: string (what user is typing)
   - previousValue: number | null
   - operator: "+", "-", "*", "/" | null
*/

const prevEl = document.getElementById("prev");
const currEl = document.getElementById("curr");
const keysEl = document.querySelector(".keys");

// State
let currentInput = "0";
let previousValue = null;
let operator = null;
let justEvaluated = false; // helps when user presses number after "="

// ---------- Helpers ----------

// Update the display UI
function render() {
  // Show the top line like: "12 +"
  if (previousValue !== null && operator) {
    prevEl.textContent = `${previousValue} ${prettyOp(operator)}`;
  } else {
    prevEl.textContent = "";
  }

  currEl.textContent = currentInput;
}

// Show operator with nicer symbol
function prettyOp(op) {
  if (op === "/") return "÷";
  if (op === "*") return "×";
  if (op === "-") return "−";
  return op; // "+"
}

// Keep input neat: remove leading zeros
function normalizeNumberString(s) {
  // If it's "0" or "0." keep it
  if (s === "0" || s.startsWith("0.")) return s;

  // Remove leading zeros like "00012" -> "12"
  return s.replace(/^0+(?=\d)/, "");
}

// Limit display length a bit (optional)
function clampLength(s, max = 14) {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

// Convert currentInput to number safely
function inputToNumber() {
  return Number(currentInput);
}

// Perform calculation
function compute(a, op, b) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? null : a / b; // handle divide by zero
  return b;
}

// ---------- Input handlers ----------

// Add a digit 0-9
function handleDigit(d) {
  if (justEvaluated) {
    // After "=", typing a number starts a new input
    currentInput = d;
    justEvaluated = false;
    render();
    return;
  }

  if (currentInput === "0") {
    currentInput = d; // replace leading 0
  } else {
    currentInput = clampLength(currentInput + d);
  }
  currentInput = normalizeNumberString(currentInput);
  render();
}

// Add a decimal point
function handleDot() {
  if (justEvaluated) {
    currentInput = "0.";
    justEvaluated = false;
    render();
    return;
  }

  if (!currentInput.includes(".")) {
    currentInput = clampLength(currentInput + ".");
    render();
  }
}

// Set operator (+, -, *, /)
function handleOperator(op) {
  // If there is already an operator and previousValue, compute first (chain calculation)
  const currVal = inputToNumber();

  if (previousValue === null) {
    previousValue = currVal;
  } else if (operator && !justEvaluated) {
    const result = compute(previousValue, operator, currVal);
    if (result === null) {
      currentInput = "Error";
      previousValue = null;
      operator = null;
      render();
      return;
    }
    previousValue = +result.toFixed(10); // avoid long floating noise
  }

  operator = op;
  currentInput = "0";
  justEvaluated = false;
  render();
}

// Equals (=)
function handleEquals() {
  if (previousValue === null || !operator) return;

  const currVal = inputToNumber();
  const result = compute(previousValue, operator, currVal);

  if (result === null) {
    currentInput = "Error";
  } else {
    currentInput = String(+result.toFixed(10));
  }

  // Reset operator chain
  previousValue = null;
  operator = null;
  justEvaluated = true;
  render();
}

// Clear (AC)
function handleClear() {
  currentInput = "0";
  previousValue = null;
  operator = null;
  justEvaluated = false;
  render();
}

// Delete (backspace)
function handleDelete() {
  if (justEvaluated) {
    // If result shown, DEL sets to 0
    currentInput = "0";
    justEvaluated = false;
    render();
    return;
  }

  if (currentInput.length <= 1) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
    // If ends with ".", remove it
    if (currentInput.endsWith(".")) currentInput = currentInput.slice(0, -1) || "0";
  }
  currentInput = normalizeNumberString(currentInput);
  render();
}

// Percent (%): converts currentInput to currentInput/100
function handlePercent() {
  const val = inputToNumber();
  currentInput = String(val / 100);
  currentInput = clampLength(currentInput);
  render();
}

// Sign change (±): toggles negative/positive
function handleSign() {
  if (currentInput === "0") return;
  if (currentInput.startsWith("-")) currentInput = currentInput.slice(1);
  else currentInput = "-" + currentInput;
  render();
}

// ---------- Click events ----------
keysEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  // If button has data-value, it's digit/operator/dot
  const val = btn.dataset.value;
  const action = btn.dataset.action;

  if (val) {
    // Digit?
    if (/^\d$/.test(val)) return handleDigit(val);
    // Dot?
    if (val === ".") return handleDot();
    // Operator
    if (["+", "-", "*", "/"].includes(val)) return handleOperator(val);
  }

  // Actions
  if (action === "clear") return handleClear();
  if (action === "delete") return handleDelete();
  if (action === "equals") return handleEquals();
  if (action === "percent") return handlePercent();
  if (action === "sign") return handleSign();
});

// ---------- Keyboard support ----------
document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (/^\d$/.test(k)) return handleDigit(k);
  if (k === ".") return handleDot();

  if (k === "+" || k === "-" || k === "*" || k === "/") return handleOperator(k);

  if (k === "Enter" || k === "=") {
    e.preventDefault();
    return handleEquals();
  }

  if (k === "Backspace") return handleDelete();
  if (k === "Escape") return handleClear();
});

// Initial render
render();
