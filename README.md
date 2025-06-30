# Sudoku Generator & Solver

This project features a fully functional **Sudoku Generator and Solver**, with both a C++ backend for generating unique Sudoku puzzles and solving them using Constrained satisfaction techniques (AC-3 algorithm and backtracking), and a visually rich interactive **web frontend** built with HTML, CSS, and JavaScript.

## 🌐 Live Demo

👉 [Sudoku Web Game](https://arpitadeshmukh.github.io/sudoku_generator_solver/)

---

## 🚀 Features

### 🎮 Web Frontend

* Select **difficulty**: Easy, Medium, Hard.
* Interact with the Sudoku board via editable inputs.
* Lives and timer system.
* Hints: Highlight a cell with the correct value.
* Show solution: Displays the final solved puzzle.
* New game appears after solving.
* Dark and light mode switch.
* Confetti on win and animated effects.
* Interactive and engagging background.

### ⚙️ C++ Backend Features

* **Sudoku puzzle generator**:

  * Fills a random valid first row.
  * Solves the board completely.
  * Removes numbers based on difficulty while ensuring a **unique solution**.
* **AC-3 Algorithm Integration**:

  * Enforces arc consistency during solving.
* **Backtracking Search**:

  * Works with domain reduction (AC-3) to efficiently solve Sudoku.
* **Difficulty presets**:

  * Easy: 35 clues
  * Medium: 30 clues
  * Hard: 25 clues
* **Terminal-based interface (if you run `main.cpp`)**:

  * Choose difficulty
  * Option to reveal the solution

---

## 📂 Folder Structure

```
├── index.html      # Main entry point
├── style.css       # Theme and layout styling
├── sudoku.js       # Game logic and interactivity
├── main.cpp        # Core C++ code
├── README.md

```

---

## 🛠️ Run Locally

### Web Version

1. Clone the repo:

   ```bash
   git clone https://github.com/arpitadeshmukh/sudoku_generator_solver.git
   ```
2. Open `index.html` in your browser directly or via Live Server extension.

### C++ Console Version

1. Compile:

   ```bash
   g++ sudoku_generator_solver.cpp -o sudoku
   ```
2. Run:

   ```bash
   ./sudoku
   ```

---

## 🌟 Technologies Used

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: C++, STL, Randomization, Backtracking, AC-3 Algorithm

---

## 🙌 Credits

This project was developed by [Arpita Deshmukh](https://github.com/arpitadeshmukh). Inspired by classic Sudoku puzzles and enhanced with modern frontend design.

---

## 📜 License

This project is licensed under the MIT License.

---

> For suggestions or issues, feel free to open an [Issue](https://github.com/arpitadeshmukh/sudoku_generator_solver/issues).

Enjoy Sudoku-ing 🧩🎉!
