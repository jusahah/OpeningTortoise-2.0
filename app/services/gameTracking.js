var Chess = require('chess.js').Chess;
var _ = require('lodash');

// Factory function
module.exports = function() {
	var chess = new Chess();

	// Set the initial position as only possible next fen
	var nextFens = {};
	var playedMoves = [];

	var generateNextFens = function() {
		var possibleMoves = chess.moves();
		nextFens = _
		.chain(possibleMoves)
		.map(function(move) {
			chess.move(move); // Make move
			var fen = chess.fen().split(" ")[0]; // Get fen
			chess.undo(); // Reset back
			return [fen, move];

		})
		.fromPairs()
		.value();

		console.log("Next fens are now:");
		console.log(nextFens);

	}

	var getMove = function(fen) {
		console.log("Get move for fen: " + fen);
		console.log(nextFens);
		console.log(nextFens[fen]);
		if (_.has(nextFens, fen)) {
			console.log("Move found: " + nextFens[fen]);
			return nextFens[fen];
		}
		return null;
	}

	var resetAll = function() {
		chess = new Chess();
		generateNextFens();
	}

	var startFen = function(fen) {
		console.log("Testing against start fen: " + fen);
		return fen === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
	}

	var moveListSoFar = function() {
		return playedMoves.slice();
	}

	return {
		newFen: function(fen) {
			if (startFen(fen)) {
				resetAll();
				return moveListSoFar();
			}
			// See if legal next fen
			var playedMove = getMove(fen);
			if (playedMove) {
				playedMoves.push(playedMove);
				chess.move(playedMove);
				generateNextFens();
				return moveListSoFar();
			}

			return null;
		}
	}
}