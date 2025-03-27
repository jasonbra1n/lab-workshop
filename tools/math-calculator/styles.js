body {
    background: transparent !important;
}
    .calculator {
        background: #222;
        border-radius: 16px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        padding: 20px;
        width: auto; /* Auto width */
        max-width: 400px; /* Maximum width */
        margin: auto;
        text-align: center;
        color: #fff;
    }
    
    @media (max-width: 400px) {
        .calculator {
            width: 90%; /* Adjust for smaller screens */
            max-width: none; /* Remove max-width constraint */
            padding: 15px;
        }
    }
    .calculator.light {
        background: #f0f0f0;
        color: #000;
    }
    .display {
        background: #333;
        color: #0f0;
        border: none;
        border-radius: 8px;
        font-size: 2rem;
        padding: 10px;
        text-align: right;
        margin-bottom: 20px;
        height: 50px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
        width: calc(100% - 20px);
    }
    .calculator.light .display {
        background: #ddd;
        color: #000;
    }
    .history {
        background: #333;
        color: #0f0;
        border-radius: 8px;
        padding: 8px 20px 1px 10px;
        margin-bottom: 10px;
        height: 45px;
        overflow-y: auto;
        text-align: right;
        font-size: 1rem;
    }
    .calculator.light .history {
        background: #ddd;
        color: #000;
    }
    .buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
    }
    .button {
        background: #555;
        border: none;
        border-radius: 8px;
        color: #fff;
        font-size: 1.5rem;
        padding: 15px;
        cursor: pointer;
        transition: background 0.3s, transform 0.1s;
    }
    .calculator.light .button {
        background: #ccc;
        color: #000;
    }
    .button:active {
        transform: scale(0.95);
    }
    .button.operator {
        background: #f90;
    }
    .calculator.light .button.operator {
        background: #ffa500;
    }
    .button.operator:active {
        background: #fc0;
    }
    .button.clear {
        background: #e00;
    }
    .calculator.light .button.clear {
        background: #ff4444;
    }
    .button.clear:active {
        background: #f33;
    }
    .button.equal {
        background: #0c0;
    }
    .calculator.light .button.equal {
        background: #00cc00;
    }
    .button.equal:active {
        background: #0f0;
    }
    .button.theme-toggle, .button.copy-result, .button.clear-history {
        background: #555;
        font-size: 1.2rem;
    }
    .calculator.light .button.theme-toggle, .calculator.light .button.copy-result, .calculator.light .button.clear-history {
        background: #ccc;
    }
    @media (max-width: 400px) {
        .calculator {
            width: 90%;
            padding: 15px;
        }
        .button {
            font-size: 1.2rem;
            padding: 10px;
        }
        .display {
            font-size: 1.5rem;
            height: 40px;
        }
        .history {
            font-size: 0.9rem;
            height: 35px;
        }
    }
