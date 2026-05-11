// Smoke test for tic-tac-toe game logic.
// Mirrors the WINNING_LINES + checkWinner/isDraw logic from index.html so we can
// catch regressions without a browser. Run: `node test-logic.js`.

'use strict';

const WINNING_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function checkWinner(b) {
    for (const [a, c, d] of WINNING_LINES) {
        if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return null;
}

function isDraw(b) {
    return b.every(v => v !== '');
}

const cases = [
    {
        name: 'empty board: no winner, no draw',
        board: ['', '', '', '', '', '', '', '', ''],
        winner: null,
        draw: false,
    },
    {
        name: 'X wins top row',
        board: ['X', 'X', 'X', '', '', '', '', '', ''],
        winner: 'X',
        draw: false,
    },
    {
        name: 'O wins middle column',
        board: ['', 'O', '', '', 'O', '', '', 'O', ''],
        winner: 'O',
        draw: false,
    },
    {
        name: 'X wins diagonal',
        board: ['X', '', '', '', 'X', '', '', '', 'X'],
        winner: 'X',
        draw: false,
    },
    {
        name: 'X wins anti-diagonal',
        board: ['', '', 'X', '', 'X', '', 'X', '', ''],
        winner: 'X',
        draw: false,
    },
    {
        name: 'full board, no winner = draw',
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
        winner: null,
        draw: true,
    },
    {
        name: 'partial board, no winner, not draw',
        board: ['X', 'O', '', '', 'X', '', '', '', 'O'],
        winner: null,
        draw: false,
    },
];

let pass = 0, fail = 0;
for (const t of cases) {
    const w = checkWinner(t.board);
    const d = isDraw(t.board);
    const ok = w === t.winner && d === t.draw;
    console.log((ok ? 'PASS' : 'FAIL') + ' - ' + t.name +
        (ok ? '' : ` (winner=${w} draw=${d}, expected winner=${t.winner} draw=${t.draw})`));
    ok ? pass++ : fail++;
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
