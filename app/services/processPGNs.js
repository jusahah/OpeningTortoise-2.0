var _        = require('lodash');
var Chess    = require('chess.js').Chess;

module.exports = parsePgns;

function processHeaders(headersString) {

	var headers = headersString.split('\n');
	return _.map(headers, function(headerLine) {

		var parts = headerLine.split(" ");
		var key = parts[0];
		var val = _.tail(parts).join(" ");
		// Get rid of brackets and quotes and return header object
		return {
			header: key.split('[').join(''),
			value: val.split(']').join('').replace(/['"]+/g,"")
		}
	})
}

function parsePgns(pgnsText) {

	var ALTERNATIVE_SEPARATORS = ['\n\n', '\n\r']; // Double-line separators to try

	var parsedResults; // Array (to be)

	// Local helper fun - tries to split the pgn text mass by selected line separator
	var trySeparator = function(separator) {
		parsedPgnsText = pgnsText.split(separator);
		if (parsedPgnsText.length <= 1) {
			// Separator clearly was not found
			return null;
		}
		return parsedPgnsText;	
	}

	// Try each separator and stop we find one that matches
	_.find(ALTERNATIVE_SEPARATORS, function(separator) {
		var result = trySeparator(separator);
		if (result) {
			parsedResults = result;
			return true;
		}
		return false;

	});

	var failCount = 0; // How many games were not parsed successfully
	var pendingHeaders = null; // Matches a header string to a pgn string that follows it

	var gamePgns = _.map(parsedResults, function(pgnPart) {
		if (pgnPart.trim().charAt(0) !== '[') {
		   // Moves part
		   pgnPart = pgnPart.split('\n').join(" ");
		   var chess = new Chess();
		   var succ = chess.load_pgn(pgnPart);	
		   if (!succ) {
		   	failCount++;
		   	return false;
		   }
		   return {headers: pendingHeaders, moves: pgnPart};
		} else {
			// Headers part
			pendingHeaders = processHeaders(pgnPart);
		}
	});

	return {
		games: _.compact(gamePgns),
		failed: failCount
	}


}