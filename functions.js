function printSudoku (board, cellsAmount, erase = true) {

	if (erase) eraseBoard(board);

	const unfilledBoard = board.filter(cell => {

		let cellId = cell.sectors.join('_');

		return $(`#${cellId}`).val() === '';
	
	});

	if (!unfilledBoard.length) return;

	for (let i = 0; i < cellsAmount; i++) {

		let filledACell = false;

		while (!filledACell) {

			let randomIndex = getRandomNumber(0, unfilledBoard.length);

			let cell = unfilledBoard[randomIndex];
			let cellId = cell.sectors.join('_');

			if ($(`#${cellId}`).val() === '') {

				filledACell = true;

				$(`#${cellId}`).val(cell.value);

			};

		};

	};

	return;
}

function eraseBoard (board) {

	board.forEach(cell => {

		let cellId = cell.sectors.join('_');

		$(`#${cellId}`).val('');
	
	});

}

function solveSudoku (board, sectors) {

	let updatedPossibilities = true;

	while (updatedPossibilities) {

		({	board,
			sectors,
			updatedPossibilities } = updatePossibilities(board, sectors));

		if ( findClash(board, sectors) ) return { board, sectors, sudokuIsImpossible: true };
					
		({	board,
			sectors } = fillCellsWithOnePoss(board, sectors));

	};

	if ( !checkIfSudokuIsComplete(board) ) {
		
		let solvedBoard;
		let solvedSectors;

		let sudokuIsImpossible = true;
		let possibilityIndex = 0;

		board.sort(unfilledBestFirst);

		let possibleBoard;
		let possibleSectors;

		while (sudokuIsImpossible) {

			possibleBoard = copy(board);
			possibleSectors = copy(sectors);

			({	board: possibleBoard,
				sectors: possibleSectors,
				outOfRange } = guessInBestCell(possibleBoard, possibleSectors, possibilityIndex) );
			
			if (outOfRange) return { board, sectors, sudokuIsImpossible: true };

			possibilityIndex ++;

			({  board: solvedBoard,
				sectors: solvedSectors,
				sudokuIsImpossible } = solveSudoku(possibleBoard, possibleSectors));

		};

		board = solvedBoard;
		sectors = solvedSectors;

	};

	return { board, sectors, sudokuIsImpossible: false };

}

function unfilledBestFirst (c1, c2) {

	if (c1.value) return 1;
	if (c2.value) return -1;

	return c1.possibilities.length - c2.possibilities.length;
	
}

function generateValidSudoku (emptyBoard, emptySectors) {

	let sudokuIsImpossible = true;
	let board;
	let sectors;

	while (sudokuIsImpossible) {

		({	board,
			sectors } = generateSudoku(copy(emptyBoard), copy(emptySectors)));

		({	board,
			sectors,
			sudokuIsImpossible } = solveSudoku(board, sectors));

	};

	return { board, sectors	};

}

function generateSudoku (board, sectors) {

	while (board.filter(cell => cell.value !== '').length < 20) {

		({ board, sectors } = updatePossibilities(board, sectors));

		({ board, sectors } = fillBestCell(board, sectors));

	};

	return { board, sectors };
}

function fillBestCell (board, sectors) {

	let filledACell = false;

	while (!filledACell) {

		let randomIndex = getRandomNumber(0, 81);

		let cell = board[randomIndex];

		if (!cell.value) {

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

		let bestCellsInSector = board.filter(cell => {

			return	cell.possibilities.length === 1		&&
					cell.sectors.indexOf(sec) !== -1	&&
					cell.value === '';
		
		});

		if (bestCellsInSector.length < 2) continue;

		let allPossibilities = [ ] ;

		for (cell of bestCellsInSector) {

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

	for (let cell of board) {

		if (!cell.value) {

			cell.sectors.forEach(sec => {

				for (let value of sectors[sec]) {

					if (value &&
						cell.possibilities.includes(value)) {

						updatedPossibilities = true;

						cell.possibilities.splice(cell.possibilities.indexOf(value), 1);

					};
				};

			});

		};

	};

	return { board, sectors, updatedPossibilities };
}

function fillCellsWithOnePoss (board, sectors) {

	let filledACell = false;

	for (let cell of board) {

		if (!cell.value &&
			cell.possibilities.length === 1) {

			filledACell = true;

			cell.value = cell.possibilities.pop();

			cell.sectors.forEach(sec => sectors[sec][sectors[sec].indexOf('')] = cell.value);	

		};
	};

	return { board, sectors, filledACell };

}

function guessInBestCell (board, sectors, possibilityIndex) {

	let bestCell = board[0];

	if (possibilityIndex + 1 >
		bestCell.possibilities.length) return { board, sectors, outOfRange: true };

	bestCell.value = bestCell.possibilities.splice(possibilityIndex, 1)[0];

	bestCell.sectors.forEach(sec => sectors[sec][sectors[sec].indexOf('')] = bestCell.value);

	return { board, sectors, outOfRange: false };

}

function checkIfSudokuIsComplete (board) {

	return board.every( cell => cell.value );

}


function copy (obj) {

	try {

		return JSON.parse(JSON.stringify(obj));

	} catch (e) {

		return obj;

	};

}