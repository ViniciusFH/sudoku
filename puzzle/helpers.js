const cellsByLevel = {

	hard: 25,
	medium: 30,
	easy: 35

};

function solveSudoku (board, sectors) {

	let sudokuIsComplete = false ;
	let updatedPossibilities = true ;

	while (!sudokuIsComplete) {

		while (updatedPossibilities) {

			({	board,
				sectors,
				updatedPossibilities } = updatePossibilities(board, sectors));
						
			if (findClash(board, sectors)) 	return { board, sectors, sudokuIsImpossible: true };

			({	board,
				sectors } = fillCellsWithOnePoss(board, sectors));

		};

		if (checkIfSudokuIsComplete(board)) break;

		let sudokuIsImpossible = true;
		let possibilityIndex = -1;

		let possibleBoard;
		let possibleSectors;

		while (sudokuIsImpossible) {

			possibleBoard = copyArrOfObjs(board);
			possibleSectors = copyObject(sectors);

			possibilityIndex ++;			
						
			({  outOfRange,
				board: possibleBoard,
				sectors: possibleSectors } = guessInBestCell(possibleBoard, possibleSectors, possibilityIndex));

			if (outOfRange) return { board, sectors, sudokuIsImpossible: true };

			({ sudokuIsImpossible } = solveSudoku(possibleBoard, possibleSectors));

		};

		board = possibleBoard;
		sectors = possibleSectors;

	};

	return { board, sectors, sudokuIsImpossible: false };

}

function generatePossibleSudoku (board, sectors, level) {

	let sudokuIsImpossible = true;
	let possibleBoard = copyArrOfObjs(board);
	let possibleSectors = copyObject(sectors);
	let solvedBoard;
	let solvedSectors;


	while (sudokuIsImpossible) {

		possibleBoard = copyArrOfObjs(board);
		possibleSectors = copyObject(sectors);

		({	board: possibleBoard,
			sectors: possibleSectors } = generateSudoku(possibleBoard, possibleSectors, level));

		({	board: solvedBoard,
			sectors: solvedSectors,
			sudokuIsImpossible } = solveSudoku(possibleBoard, possibleSectors));

	};

	return { 

		board: possibleBoard,
		sectors: possibleSectors,
		solvedBoard,
		solvedSectors };

}

function generateSudoku (board, sectors, level) {

	for (let i = 1; i <= cellsByLevel[level]; i++) {

		({ board, sectors } = fillRandomCell(board, sectors));

		({ board, sectors } = updatePossibilities(board, sectors));

	};

	return { board, sectors };
}

function fillRandomCell (board, sectors) {

	let filledACell = false;

	while (!filledACell) {

		let randomIndex = getRandomNumber(0, 81);

		let cell = board[randomIndex];

		if (!board[randomIndex].value) {

			filledACell = true;

			let randomPossibilitiesIndex = getRandomNumber(0, cell.possibilities.length);

			cell.value = cell.possibilities.splice(randomPossibilitiesIndex, 1)[0];

			cell.sectors.forEach(sec => sectors[sec][sectors[sec].indexOf('')] = cell.value);

		};

	};

	return { board, sectors };

}

function getRandomNumber(min, max) {

	return Math.floor(Math.random() * (max - min) + min);

}

function findClash (board, sectors) {

	for (let cell of board) {

		if (cell.value === '' &&
			cell.possibilities.length === 0) return true;

	};

	return findPossibilitiesClash(board, sectors);

}

function findPossibilitiesClash (board, sectors) {

	let foundPossibilitiesClash = false;

	for (let sec of Object.keys(sectors)) {

		let onePossibilityCells = board.filter(cell => {

			return cell.value === '' &&
				   cell.possibilities.length === 1 &&
				   cell.sectors.indexOf(sec) !== -1;
		
		});

		if (onePossibilityCells.length < 2) continue;

		let allPossibilities = [ ] ;

		for (cell of onePossibilityCells) {

			let possibility = cell.possibilities[0];

			if (!allPossibilities.includes(possibility)) allPossibilities.push(possibility);

			else {

				foundPossibilitiesClash = true;
				break;

			};

		};

		if (foundPossibilitiesClash) break;

	};

	return foundPossibilitiesClash;

}

function updatePossibilities (board, sectors) {

	let updatedPossibilities = false;

	let unfilledCells = board.filter(cell => cell.value === '');

	unfilledCells.forEach(cell => {

		cell.sectors.forEach(sec => {

			let valuesInSector = sectors[sec].filter(val => val);

			valuesInSector.forEach(value => {

				if (cell.possibilities.includes(value)) {

					updatedPossibilities = true;

					cell.possibilities.splice(cell.possibilities.indexOf(value), 1);
				};
			
			});

		});
	});

	return { board, sectors, updatedPossibilities };
}

function fillCellsWithOnePoss (board, sectors) {

	let onePossibilityCells = board.filter(cell => cell.value === '' && cell.possibilities.length === 1);

	onePossibilityCells.forEach(cell => {

		filledACell = true;

		cell.value = cell.possibilities.pop();

		cell.sectors.forEach(sec => sectors[sec][sectors[sec].indexOf('')] = cell.value);

	});

	return { board, sectors };

}

function guessInBestCell (board, sectors, possibilityIndex) {

	const bestCell = getBestCell(board);

	if (possibilityIndex + 1 > bestCell.possibilities.length) return { outOfRange: true };

	bestCell.value = bestCell.possibilities.splice(possibilityIndex, 1)[0];

	bestCell.sectors.forEach(sec => sectors[sec][sectors[sec].indexOf('')] = bestCell.value);

	return { board, sectors };

}

function getBestCell (board) {

	let unassignedCells = board.filter(cell => cell.value === '');

	return unassignedCells.sort((c1, c2) => c1.possibilities.length - c2.possibilities.length)[0];

}

function checkIfSudokuIsComplete (board) {

	return board.every( cell => cell.value );

};


function copyArrOfObjs (arr) {

	try {

		return JSON.parse(JSON.stringify(arr));

	} catch (e) {

		return arr;

	};

}

function copyObject (obj) {

	try {

		return JSON.parse(JSON.stringify(obj));

	} catch (e) {

		return obj;

	};
}

// module.exports = {

// 	solveSudoku,
// 	findClash,
// 	findPossibilitiesClash,
// 	updatePossibilities,
// 	fillCellsWithOnePoss,
// 	guessInBestCell,
// 	getBestCell,
// 	checkIfSudokuIsComplete,
// 	copyArrOfObjs,
// 	copyObject,

// }