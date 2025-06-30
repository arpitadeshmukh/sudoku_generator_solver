#include <iostream>
#include <vector>
#include <algorithm>
#include <random>
#include <ctime>
#include <queue>

using namespace std;

const int N = 9;
const int N2 = 81; // Size of the Sudoku grid (9x9)
const int sqrtN = 3;
const int UNASSIGNED = 0;
const int EASY = 46;
const int MEDIUM = 51;
const int HARD = 56;
vector<vector<int>> board(N, vector<int>(N, 0));    // Sudoku grid
vector<vector<int>> solution(N, vector<int>(N, 0)); // To store the found solution


// extern "C" {
//     void generate_sudoku(int* buffer, int difficulty);
// }

class Generator
{
public:
    Generator()
    {
        randomize_grid();
    }

    void randomize_grid()
    {
        vector<int> values(N);
        iota(values.begin(), values.end(), 1); // Fill with 1 to 9

        unsigned seed = time(NULL);
        shuffle(values.begin(), values.end(), default_random_engine(seed));

        for (int i = 0; i < N; i++)
        {
            board[0][i] = values[i];
        }

        solveSudoku();
    }

    bool isSafe(int row, int col, int num)
    {
        for (int i = 0; i < N; i++)
        {
            if (board[row][i] == num || board[i][col] == num)
            {
                return false;
            }
        }

        int startRow = row - row % sqrtN;
        int startCol = col - col % sqrtN;

        for (int i = 0; i < sqrtN; i++)
        {
            for (int j = 0; j < sqrtN; j++)
            {
                if (board[startRow + i][startCol + j] == num)
                {
                    return false;
                }
            }
        }
        return true;
    }

    bool solveSudoku()
    {
        for (int row = 0; row < N; row++)
        {
            for (int col = 0; col < N; col++)
            {
                if (board[row][col] == 0)
                {
                    for (int num = 1; num <= N; num++)
                    {
                        if (isSafe(row, col, num))
                        {
                            board[row][col] = num;
                            if (solveSudoku())
                            {
                                return true;
                            }
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false; // No valid number found
                }
            }
        }
        solution = board; // Store the solution
        return true;
    }

    void removeNumbers(int numRemove)
    {

        srand(time(0));

        int count = 0;
        while (count < numRemove)
        {
            int row = rand() % N;
            int col = rand() % N;
            if (board[row][col] != 0)
            {
                int backup = board[row][col];
                board[row][col] = 0;

                if (hasUniqueSolution())
                {
                    count++;
                }
                else
                {
                    board[row][col] = backup; // Restore if not unique
                }
            }
        }
    }

    bool hasUniqueSolution()
    {
        vector<vector<int>> backupBoard = board;
        bool firstSolution = false, secondSolution = false;

        solveAndTrack(firstSolution, secondSolution);

        board = backupBoard;

        return !secondSolution; // Should return true if there is no second solution
    }

    bool solveAndTrack(bool &firstSolution, bool &secondSolution)
    {
        for (int row = 0; row < N; row++)
        {
            for (int col = 0; col < N; col++)
            {
                if (board[row][col] == 0)
                {
                    for (int num = 1; num <= N; num++)
                    {
                        if (isSafe(row, col, num))
                        {
                            board[row][col] = num;
                            if (solveAndTrack(firstSolution, secondSolution))
                            {
                                if (firstSolution)
                                {
                                    secondSolution = true;
                                    return false;
                                }
                                else
                                {
                                    firstSolution = true;
                                    solution = board; // Store the valid solution
                                }
                            }
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false; // No valid number can be placed in this cell
                }
            }
        }
        return true; // Solved
    }
};

// Function to print the Sudoku board
void printBoard(const vector<vector<int>> &boardToPrint)
{
    cout << "+---------+---------+---------+" << endl; // Print top boundary

    for (int i = 0; i < N; i++)
    {
        if (i % sqrtN == 0 && i != 0)
        {
            cout << "+---------+---------+---------+" << endl; // Print row separator after every 3 rows
        }

        for (int j = 0; j < N; j++)
        {
            if (j % sqrtN == 0)
            {
                cout << "|"; // Print vertical separator after every 3 columns
            }
            if (boardToPrint[i][j] == 0)
            {
                cout << "   "; // Print a space for empty cells
            }
            else
            {
                cout << " " << boardToPrint[i][j] << " "; // Print the number with spaces
            }
        }
        cout << "|" << endl; // End of row
    }
    cout << "+---------+---------+---------+" << endl; // Print bottom boundary
}

class Solver
{
public:
    // Arc-Consistency: Check if a value is consistent with neighboring variables
    bool isConsistent(int value, int row, int col, const vector<vector<int>> &grid)
    {
        // Check row, column, and subgrid for conflicts
        for (int i = 0; i < N; ++i)
        {
            if (grid[row][i] == value || grid[i][col] == value)
                return false;
        }
        int startRow = (row / 3) * 3;
        int startCol = (col / 3) * 3;
        for (int i = startRow; i < startRow + 3; ++i)
        {
            for (int j = startCol; j < startCol + 3; ++j)
            {
                if (grid[i][j] == value)
                    return false;
            }
        }
        return true;
    }

    // Apply AC-3 algorithm: Make domains arc-consistent
    bool ac3(vector<vector<int>> &grid, vector<vector<vector<int>>> &domains)
    {
        queue<pair<int, int>> q;

        // Initialize the queue with all arcs (row-column pairs for each unassigned cell)

        for (int row = 0; row < N; ++row)
        {
            for (int col = 0; col < N; ++col)
            {
                if (grid[row][col] == UNASSIGNED)
                {
                    // Add the neighbors to the queue
                    for (int num = 1; num <= 9; ++num)
                    {
                        if (isConsistent(num, row, col, grid))
                        {
                            domains[row][col].push_back(num);
                        }
                    }
                }
            }
        }

        while (!q.empty())
        {
            auto front = q.front();
            int row = front.first;
            int col = front.second;
            q.pop();

            // For each neighbor, reduce the domain and ensure arc-consistency
            for (int num : domains[row][col])
            {
                if (!isConsistent(num, row, col, grid))
                {
                    domains[row][col].erase(remove(domains[row][col].begin(), domains[row][col].end(), num), domains[row][col].end());
                }
            }
        }

        return true;
    }

    // Backtracking with AC-3 integration
    bool solveSudoku(vector<vector<int>> &grid, vector<vector<vector<int>>> &domains)
    {
        // Find the first empty cell
        int row = -1, col = -1;
        bool found = false;
        for (int i = 0; i < N; ++i)
        {
            for (int j = 0; j < N; ++j)
            {
                if (grid[i][j] == UNASSIGNED)
                {
                    row = i;
                    col = j;
                    found = true;
                    break;
                }
            }
            if (found)
                break;
        }

        // If no empty cell, puzzle is solved
        if (row == -1 && col == -1)
            return true;

        // Try possible values (1 to 9)
        for (int num = 1; num <= 9; ++num)
        {
            if (isConsistent(num, row, col, grid))
            {
                grid[row][col] = num;

                // Apply AC-3 after every assignment
                if (ac3(grid, domains) && solveSudoku(grid, domains))
                {
                    return true;
                }

                // Backtrack if no solution is found
                grid[row][col] = UNASSIGNED;
            }
        }

        return false; // No solution found
    }
};

int start_menu()
{
    int choice;
    cout << endl
         << "Start Menu:" << endl;
    cout << "[1] Easy" << endl
         << "[2] Medium" << endl
         << "[3] Hard" << endl
         << endl;

    cout << "Which option would you like to take? ";
    cin >> choice;
    return choice;
}

void solution_menu(bool &reveal)
{
    bool valid_response = false;
    string verdict;

    while (!valid_response)
    {
        cout << "Show solution? [Y/N]: ";
        cin >> verdict;

        if (verdict == "Y")
        {
            reveal = true;
            valid_response = true;
        }
        else if (verdict == "N")
        {
            reveal = false;
            valid_response = true;
            cout << endl;
        }
        else
        {
            cout << endl
                 << "Incorrect input. Enter 'Y' or 'N' corresponding to your desired action."
                 << endl
                 << endl;
        }
    }
}

int main()
{

    int difficulty_level;
    bool reveal = false;

    difficulty_level = start_menu();

    Generator puzzle;

    if (difficulty_level == 1)
        puzzle.removeNumbers(EASY);
    else if (difficulty_level == 2)
        puzzle.removeNumbers(MEDIUM);
    else if (difficulty_level == 3)
        puzzle.removeNumbers(HARD);
    else
    {
        cout << endl
             << "Incorrect input. Enter the number corresponding to your desired action." << endl
             << endl;
    }
    printBoard(board);

    solution_menu(reveal);
    if (puzzle.hasUniqueSolution())
    {
        Solver solver;
        vector<vector<vector<int>>> domains(N, vector<vector<int>>(N));
        if (solver.solveSudoku(board, domains))
        {
            cout << "Sudoku solved!" << endl;
            // PRINT THE SOLVED SUDOKU GRID
            printBoard(board);
        }
        else
        {
            cout << "No solution exists!" << endl;
        }
    }
    else
    {
        cout << "The generated puzzle does not have a unique solution." << endl;
    }
    return 0;
}



extern "C" {
    void generate_sudoku(int* buffer, int difficulty) {
        Generator g;

        if (difficulty == 1)
            g.removeNumbers(EASY);
        else if (difficulty == 2)
            g.removeNumbers(MEDIUM);
        else
            g.removeNumbers(HARD);

        int index = 0;
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                buffer[index++] = board[i][j];
            }
        }
    }
}

// // New main()
// int main(int argc, char* argv[]) {
//     int difficulty_level = 1;

//     if (argc >= 2 && string(argv[1]) == "solve") {
//         string input = argv[2];
//         int idx = 0;
//         for (int i = 0; i < N; i++)
//             for (int j = 0; j < N; j++)
//                 board[i][j] = input[idx++] - '0';

//         Solver solver;
//         vector<vector<vector<int>>> domains(N, vector<vector<int>>(N));
//         if (solver.solveSudoku(board, domains)) {
//             for (auto& row : board)
//                 for (int val : row)
//                     cout << val;
//         } else {
//             cerr << "No solution\n";
//         }
//         return 0;
//     }

//     // generation logic continues as before...

//     if (argc > 1)
//         difficulty_level = atoi(argv[1]);

//     Generator puzzle;
//     if (difficulty_level == 1) puzzle.removeNumbers(EASY);
//     else if (difficulty_level == 2) puzzle.removeNumbers(MEDIUM);
//     else puzzle.removeNumbers(HARD);

//     // Print the board as a single line of 81 digits
//     for (auto& row : board)
//         for (int val : row)
//             cout << val;
    
//     return 0;
// }
