const helpers = require('./helpers.js');

let board = require('./board.js');
let sectors = require('./sectors.js');

const beginning = Date.now();

({
	board, sectors, sudokuIsImpossible

} = helpers.solveSudoku(board, sectors));

console.log(Date.now() - beginning);

console.log(`\nResolveu: ${!sudokuIsImpossible}`);
