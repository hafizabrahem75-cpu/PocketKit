import { useState } from "react";
import { Delete } from "lucide-react";

type Operator = "+" | "-" | "*" | "/";

function formatOperand(value: string) {
  if (value.length > 12) {
    const num = Number(value);
    return num.toExponential(5);
  }
  return value;
}

function compute(a: number, b: number, op: Operator) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? NaN : a / b;
  }
}

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [overwrite, setOverwrite] = useState(true);

  function inputDigit(digit: string) {
    if (overwrite) {
      setDisplay(digit === "." ? "0." : digit);
      setOverwrite(false);
      return;
    }
    if (digit === "." && display.includes(".")) return;
    if (display === "0" && digit !== ".") {
      setDisplay(digit);
      return;
    }
    setDisplay(display + digit);
  }

  function handleOperator(nextOperator: Operator) {
    const inputValue = Number(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator && !overwrite) {
      const result = compute(previousValue, inputValue, operator);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperator(nextOperator);
    setOverwrite(true);
  }

  function handleEquals() {
    if (operator === null || previousValue === null) return;
    const inputValue = Number(display);
    const result = compute(previousValue, inputValue, operator);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperator(null);
    setOverwrite(true);
  }

  function handleClear() {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setOverwrite(true);
  }

  function handleBackspace() {
    if (overwrite) return;
    if (display.length <= 1 || (display.length === 2 && display.startsWith("-"))) {
      setDisplay("0");
      setOverwrite(true);
      return;
    }
    setDisplay(display.slice(0, -1));
  }

  function toggleSign() {
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : `-${display}`);
  }

  const digitButtons = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Calculator</h2>
        <p className="text-muted-foreground text-lg">Quick arithmetic, no fuss.</p>
      </header>

      <div className="max-w-sm mx-auto md:mx-0 space-y-4">
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex flex-col items-end justify-end min-h-[4rem] gap-1">
            <span className="text-sm text-muted-foreground h-5 truncate w-full text-right">
              {previousValue !== null && operator ? `${formatOperand(String(previousValue))} ${operator}` : ""}
            </span>
            <span className="text-4xl font-semibold tracking-tight truncate w-full text-right">
              {formatOperand(display)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={handleClear}
            className="col-span-2 h-16 rounded-xl bg-secondary text-secondary-foreground font-medium text-lg hover:bg-secondary/80 active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            onClick={toggleSign}
            className="h-16 rounded-xl bg-secondary text-secondary-foreground font-medium text-lg hover:bg-secondary/80 active:scale-95 transition-all"
          >
            +/-
          </button>
          <button
            onClick={handleBackspace}
            className="h-16 rounded-xl bg-secondary text-secondary-foreground font-medium text-lg hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>

          {digitButtons.slice(0, 3).map((d) => (
            <button
              key={d}
              onClick={() => inputDigit(d)}
              className="h-16 rounded-xl bg-card border border-border font-medium text-xl hover:bg-card/80 hover:border-primary/40 active:scale-95 transition-all"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator("/")}
            className={`h-16 rounded-xl font-medium text-xl active:scale-95 transition-all ${
              operator === "/" ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary hover:bg-primary/25"
            }`}
          >
            ÷
          </button>

          {digitButtons.slice(3, 6).map((d) => (
            <button
              key={d}
              onClick={() => inputDigit(d)}
              className="h-16 rounded-xl bg-card border border-border font-medium text-xl hover:bg-card/80 hover:border-primary/40 active:scale-95 transition-all"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator("*")}
            className={`h-16 rounded-xl font-medium text-xl active:scale-95 transition-all ${
              operator === "*" ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary hover:bg-primary/25"
            }`}
          >
            ×
          </button>

          {digitButtons.slice(6, 9).map((d) => (
            <button
              key={d}
              onClick={() => inputDigit(d)}
              className="h-16 rounded-xl bg-card border border-border font-medium text-xl hover:bg-card/80 hover:border-primary/40 active:scale-95 transition-all"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator("-")}
            className={`h-16 rounded-xl font-medium text-xl active:scale-95 transition-all ${
              operator === "-" ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary hover:bg-primary/25"
            }`}
          >
            −
          </button>

          <button
            onClick={() => inputDigit("0")}
            className="h-16 rounded-xl bg-card border border-border font-medium text-xl hover:bg-card/80 hover:border-primary/40 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={() => inputDigit(".")}
            className="h-16 rounded-xl bg-card border border-border font-medium text-xl hover:bg-card/80 hover:border-primary/40 active:scale-95 transition-all"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="h-16 rounded-xl bg-primary text-primary-foreground font-medium text-xl hover:bg-primary/90 active:scale-95 transition-all"
          >
            =
          </button>
          <button
            onClick={() => handleOperator("+")}
            className={`h-16 rounded-xl font-medium text-xl active:scale-95 transition-all ${
              operator === "+" ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary hover:bg-primary/25"
            }`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
