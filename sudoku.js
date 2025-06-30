const N = 9; // Size of the grid
const EASY = 46;   // Number of cells to remove for easy level
const MEDIUM = 51; // Number of cells to remove for medium level
const HARD = 56;   // Number of cells to remove for hard level

let board = Array(N).fill().map(() => Array(N).fill(0)); // Initial puzzle grid
let solution = Array(N).fill().map(() => Array(N).fill(0)); // To store the solution
let domains = Array(N).fill().map(() => Array(N).fill().map(() => [])); // Domains for each cell

let lives = 3;
let gameOver = false;
let originalPuzzle = []; // Global


let timerInterval = null;
let secondsElapsed = 0;

let selectedDifficulty = null;
let remainingHints = 3;

let stopButtonMode = "show"; // can be "show" or "new"


// Helper Functions
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Sudoku Generator Class
class SudokuGenerator {
    constructor() {
        this.randomizeGrid(); // Randomize the first row
        this.solveSudoku();    // Solve the puzzle fully
        solution = this.copyBoard(board); // Store solution after solving
    }

    randomizeGrid() {
        let values = [...Array(N).keys()].map(x => x + 1); // Fill values 1-9
        shuffle(values);
        for (let i = 0; i < N; i++) {
            board[0][i] = values[i];
        }
        this.solveSudoku(); // Solve the board after initializing the first row
    }

    isSafe(row, col, num) {
        // Check row and column for the number
        for (let i = 0; i < N; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }

        // Check 3x3 sub-grid for the number
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }
        return true;
    }

    solveSudoku() {
        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= N; num++) {
                        if (this.isSafe(row, col, num)) {
                            board[row][col] = num;
                            if (this.solveSudoku()) return true;
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true; // Puzzle solved
    }

    removeNumbers(numRemove) {
        let count = 0;
        while (count < numRemove) {
            const row = Math.floor(Math.random() * N);
            const col = Math.floor(Math.random() * N);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                count++;
            }
        }
    }

    copyBoard(board) {
        return board.map(row => row.slice());
    }
}

// AC-3 Algorithm to enforce arc consistency
function ac3() {
    let queue = [];

    // Initialize the queue with all arcs (row-column pairs for each unassigned cell)
    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            if (board[row][col] === 0) {
                // Add all possible numbers for the cell
                domains[row][col] = [...Array(N).keys()].map(x => x + 1);
                queue.push([row, col]);
            }
        }
    }

    while (queue.length > 0) {
        const [row, col] = queue.shift();

        // For each neighbor (row/column/box), reduce the domain of the current cell
        for (let num of domains[row][col]) {
            if (!isValidMove(row, col, num)) {
                domains[row][col] = domains[row][col].filter(n => n !== num);
                if (domains[row][col].length === 1) {
                    queue.push([row, col]);
                }
            }
        }
    }
}

// Check if the input is a valid Sudoku move
function isValidMove(row, col, value) {
    // Check row and column for duplicates
    for (let i = 0; i < N; i++) {
        if (board[row][i] === value || board[i][col] === value) return false;
    }

    // Check 3x3 box for duplicates
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (board[i][j] === value) return false;
        }
    }
    return true;
}

// Function to print the Sudoku grid on the webpage
function setupGrid() {
    const sudokuGrid = document.getElementById('sudokuGrid');
    sudokuGrid.innerHTML = ''; // Clear any existing grid

    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.value = board[row][col] === 0 ? '' : board[row][col];
            cell.readOnly = board[row][col] !== 0; // Pre-filled cells are read-only

            cell.addEventListener('input', (e) => handleInput(e, row, col));
            sudokuGrid.appendChild(cell);
        }
    }
}

function handleInput(event, row, col) {
    const input = event.target;
    const value = parseInt(input.value);

    if (gameOver) {
        input.value = '';
        return;
    }

    if (!input.value) {
        input.classList.remove('invalid');
        board[row][col] = 0;
        return;
    }

    if (!isNaN(value) && value >= 1 && value <= 9) {
        if (value === solution[row][col]) {
            board[row][col] = value;
            input.classList.remove('invalid');
            input.classList.add('valid');
            input.readOnly = true;
        } else {
            input.classList.add('invalid');
            board[row][col] = 0; // prevent storing wrong value
            lives--;
            updateLivesDisplay();

            if (lives === 0) {
                gameOver = true;
                clearInterval(timerInterval); // ⬅️ stop the clock
                disableGridInputs();
                showGameOverPopup();
            }            
        }
    } else {
        input.classList.add('invalid');
    }

    if (value === solution[row][col]) {
        board[row][col] = value;
        input.classList.remove('invalid');
        input.readOnly = true;
    
        if (isPuzzleSolved()) {
            gameOver = true;
            clearInterval(timerInterval);
            showWinPopup(); // 🎉
        }
    }
    
}

function showSolutionHandler() {
    const stopButton = document.getElementById('stopButton');
    const inputs = document.querySelectorAll("#sudokuGrid input");

    inputs.forEach((cell, index) => {
        const row = Math.floor(index / N);
        const col = index % N;
        cell.value = solution[row][col];
        cell.readOnly = true;
        cell.classList.remove("invalid", "hinted", "valid");
        cell.classList.add("solved-cell");
    });

    gameOver = true;
    clearInterval(timerInterval);

    stopButton.textContent = "New Game";
    stopButtonMode = "new";
}

function resetStopButton() {
    const stopButton = document.getElementById('stopButton');
    stopButton.textContent = "Show Solution";
    stopButtonMode = "show";
}



document.getElementById('stopButton').addEventListener('click', () => {
    if (stopButtonMode === "show") {
        showSolutionHandler();
    } else if (stopButtonMode === "new") {
        // ✅ Go back to home screen
        document.getElementById("gameScreen").classList.add("hidden");
        document.getElementById("homeScreen").classList.remove("hidden");

        selectedDifficulty = null;
        document.getElementById("selectedDifficultyText").textContent = "";
        
        document.querySelectorAll(".difficulty-buttons button").forEach(btn =>
            btn.classList.remove("selected")
        );
        // Reset UI state
        resetStopButton();
        clearInterval(timerInterval);
    }
});


function startNewGame() {
    if (!selectedDifficulty) return;
  
    board = Array(N).fill().map(() => Array(N).fill(0));
    const puzzle = new SudokuGenerator();
  
    if (selectedDifficulty === 1) puzzle.removeNumbers(EASY);
    else if (selectedDifficulty === 2) puzzle.removeNumbers(MEDIUM);
    else if (selectedDifficulty === 3) puzzle.removeNumbers(HARD);
  
    originalPuzzle = puzzle.copyBoard(board);
    setupGrid();
    lives = 3;
    gameOver = false;
    updateLivesDisplay();
    startTimer();
    resetStopButton();  // <-- important!

}
  
  

function updateLivesDisplay() {
    document.getElementById("livesCount").textContent = lives;
}

function disableGridInputs() {
    const cells = document.querySelectorAll("#sudokuGrid input");
    cells.forEach(cell => cell.readOnly = true);
}

function showGameOverPopup() {
    document.getElementById('gameOverPopup').classList.remove('hidden');
}

function hideGameOverPopup() {
    document.getElementById('gameOverPopup').classList.add('hidden');
}

function retryGame() {
    board = originalPuzzle.map(row => row.slice()); // Copy original puzzle back
    setupGrid();
    lives = 3;
    gameOver = false;
    updateLivesDisplay();
    startTimer();

}

function startTimer() {
    clearInterval(timerInterval); // Clear any existing timer
    secondsElapsed = 0;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const seconds = String(secondsElapsed % 60).padStart(2, '0');
    document.getElementById("timer").textContent = `${minutes}:${seconds}`;
}

function isPuzzleSolved() {
    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            if (board[row][col] !== solution[row][col]) {
                return false;
            }
        }
    }
    return true;
}

function showWinPopup() {
    document.getElementById('winPopup').classList.remove('hidden');
    triggerConfetti();
}
function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
}


function createParticlesContainer() {
    let existing = document.getElementById("particles-js");
    if (existing) existing.remove();
    let div = document.createElement("div");
    div.id = "particles-js";
    document.body.prepend(div);
}


document.getElementById("retryButton").addEventListener("click", () => {
    hideGameOverPopup();
    retryGame(); // ⬅️ use retry logic
});

document.getElementById("newGameButton").addEventListener("click", () => {
    hideGameOverPopup();
    startNewGame(); // ⬅️ fresh puzzle
});
document.getElementById("newGameWinButton").addEventListener("click", () => {
    hideGameOverPopup();
    document.getElementById("winPopup").classList.add("hidden");
    startNewGame();
});


// Start a new game on page load
window.addEventListener('load', startNewGame);

document.querySelectorAll(".difficulty-buttons button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".difficulty-buttons button").forEach(btn =>
            btn.classList.remove("selected")
        );
        button.classList.add("selected");
        selectedDifficulty = parseInt(button.getAttribute("data-difficulty"));

        // Show selected difficulty text
        const difficultyMap = { 1: "Easy", 2: "Medium", 3: "Hard" };
        document.getElementById("selectedDifficultyText").textContent = 
            `Selected: ${difficultyMap[selectedDifficulty]}`;
    });
});

document.getElementById("startButton").addEventListener("click", () => {
    if (!selectedDifficulty) {
        alert("Please select a difficulty first!");
        return;
    }

    // Switch to game screen
    document.getElementById("homeScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");

    document.getElementById("difficultyDisplay").textContent =
    selectedDifficulty === 1 ? "Easy" :
    selectedDifficulty === 2 ? "Medium" :
    "Hard";

    const level = selectedDifficulty;


    startNewGame();
});

document.getElementById("hintButton").addEventListener("click", () => {
    if (remainingHints === 0) {
      alert("No more hints available!");
      return;
    }
  
    // Find an empty cell
    const inputs = document.querySelectorAll(".grid input");
    for (let i = 0; i < inputs.length; i++) {
      const cell = inputs[i];
      if (!cell.readOnly && cell.value === "") {
        const row = Math.floor(i / 9);
        const col = i % 9;
  
        // Use your solution board to get the correct value
        const correctValue = solution[row][col]; // `solutionBoard` must be your 2D solved puzzle
        cell.value = correctValue;
        cell.classList.add("hinted");
        remainingHints--;
        document.getElementById("hintButton").textContent = `Hint (${remainingHints} left)`;
        break;
      }
    }
  });
