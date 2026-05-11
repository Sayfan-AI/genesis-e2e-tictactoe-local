// Smoke test for tic-tac-toe game logic.
// Mirrors the WINNING_LINES + checkWinner/isDraw/minimax logic from
// index.html so we can catch regressions without a browser.
// Run: `node test-logic.js`.

'use strict';

const WINNING_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const HUMAN = 'X';
const COMPUTER = 'O';

function checkWinner(b) {
    for (const [a, c, d] of WINNING_LINES) {
        if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return null;
}

function isDraw(b) {
    return b.every(v => v !== '');
}

function minimax(b, player, depth) {
    const winner = checkWinner(b);
    if (winner === COMPUTER) return { score: 10 - depth, move: -1 };
    if (winner === HUMAN) return { score: depth - 10, move: -1 };
    if (isDraw(b)) return { score: 0, move: -1 };

    const maximizing = player === COMPUTER;
    let best = { score: maximizing ? -Infinity : Infinity, move: -1 };
    for (let i = 0; i < 9; i++) {
        if (b[i] !== '') continue;
        b[i] = player;
        const next = minimax(b, player === COMPUTER ? HUMAN : COMPUTER, depth + 1);
        b[i] = '';
        if (maximizing ? next.score > best.score : next.score < best.score) {
            best = { score: next.score, move: i };
        }
    }
    return best;
}

function pickComputerMove(b) {
    return minimax(b.slice(), COMPUTER, 0).move;
}

// --- Tests for checkWinner / isDraw ---
const winDrawCases = [
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
function report(name, ok, extra) {
    console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name + (ok || !extra ? '' : ` (${extra})`));
    ok ? pass++ : fail++;
}

for (const t of winDrawCases) {
    const w = checkWinner(t.board);
    const d = isDraw(t.board);
    const ok = w === t.winner && d === t.draw;
    report(t.name, ok, `winner=${w} draw=${d}, expected winner=${t.winner} draw=${t.draw}`);
}

// --- Tests for minimax / pickComputerMove ---

// 1. Computer takes the immediate win when available.
{
    // O can win by playing 2 (top row O O _).
    const b = ['O', 'O', '', '', 'X', '', 'X', '', ''];
    const move = pickComputerMove(b);
    report('AI takes immediate win', move === 2, `picked ${move}, expected 2`);
}

// 2. Computer blocks an immediate human win.
{
    // X threatens to win at 2 (X X _). O must block at 2.
    const b = ['X', 'X', '', '', 'O', '', '', '', ''];
    const move = pickComputerMove(b);
    report('AI blocks immediate loss', move === 2, `picked ${move}, expected 2`);
}

// 3. Against a perfect human, the computer should never lose: from an
// empty board with computer to move, the eval is a draw (score 0).
{
    const result = minimax(['', '', '', '', '', '', '', '', ''], COMPUTER, 0);
    report('AI from empty board evaluates as draw or better',
        result.score >= 0,
        `score=${result.score}`);
}

// 4. The picked move is always a legal (empty) cell.
{
    const b = ['X', '', '', '', 'O', '', '', '', 'X'];
    const move = pickComputerMove(b);
    const ok = move >= 0 && move < 9 && b[move] === '';
    report('AI move is on an empty cell', ok, `picked ${move}`);
}

// 5. Full-game self-play (human plays minimax too): result must be a draw.
// Tic-tac-toe is a draw under perfect play from both sides.
{
    const b = ['', '', '', '', '', '', '', '', ''];
    let player = HUMAN; // X moves first
    while (!checkWinner(b) && !isDraw(b)) {
        const r = minimax(b.slice(), player, 0);
        // pickComputerMove always optimizes for COMPUTER; here we just want
        // the optimal move for whichever side is to move, so run minimax
        // directly with that side.
        const optimal = (function () {
            let best = { score: player === COMPUTER ? -Infinity : Infinity, move: -1 };
            for (let i = 0; i < 9; i++) {
                if (b[i] !== '') continue;
                b[i] = player;
                const next = minimax(b, player === COMPUTER ? HUMAN : COMPUTER, 1);
                b[i] = '';
                if (player === COMPUTER ? next.score > best.score : next.score < best.score) {
                    best = { score: next.score, move: i };
                }
            }
            return best.move;
        })();
        b[optimal] = player;
        player = player === HUMAN ? COMPUTER : HUMAN;
        // r is unused here; we re-run minimax to get the right side's move.
        void r;
    }
    const winner = checkWinner(b);
    report('Perfect play self-game ends in a draw',
        winner === null && isDraw(b),
        `winner=${winner} draw=${isDraw(b)} board=${JSON.stringify(b)}`);
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
