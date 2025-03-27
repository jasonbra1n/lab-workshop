function appendValue(value) {
        const display = document.getElementById("display");
        const validChars = "0123456789.+-*/";
        if (display.value.length < 20 && validChars.includes(value)) {
            display.value += value;
        }
    }

    function clearDisplay() {
        const display = document.getElementById("display");
        display.value = "";
    }

    function backspace() {
        const display = document.getElementById("display");
        display.value = display.value.slice(0, -1);
    }

function calculate() {
    const display = document.getElementById("display");
    const history = document.getElementById("history");
    try {
        const result = Function('"use strict"; return (' + display.value.replace("×", "*").replace("÷", "/") + ')')();
        if (isNaN(result) || !isFinite(result)) {
            display.value = "Invalid Input";
        } else {
            history.textContent = display.value + " = " + result;
            display.value = result;
        }
    } catch (error) {
        display.value = "Error";
    }
}

    function toggleTheme() {
        const calculator = document.querySelector(".calculator");
        calculator.classList.toggle("light");
    }

    function copyResult() {
        const display = document.getElementById("display");
        navigator.clipboard.writeText(display.value)
            .then(() => alert("Result copied to clipboard!"))
            .catch(() => alert("Failed to copy result."));
    }

    function clearHistory() {
        const history = document.getElementById("history");
        history.textContent = "";
    }

    document.addEventListener("keydown", (event) => {
        const key = event.key;
        const validKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "+", "-", "*", "/", "Enter", "Backspace", "Delete"];
        if (validKeys.includes(key)) {
            event.preventDefault();
            if (key === "Enter") {
                calculate();
            } else if (key === "Backspace" || key === "Delete") {
                backspace();
            } else {
                appendValue(key);
            }
        }
    });
