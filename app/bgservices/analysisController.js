var Promise = require('bluebird');
var _ = require('lodash');

// For throwing + catching custom error
function NoGamesError() {}
NoGamesError.prototype = Object.create(Error.prototype);

module.exports = function(Box) {

	var stopRequested = false;
	var analysisRunning = false;

	// Private work-horse function
	var analyzeGame = function() {
		var dataService = Box.Application.getService('dataService');

		// Ask for game and later perhaps also for settings (like num of engine instances)
		dataService.getPendingGame()
		.then(function(game) {
			// Fake this for now
			if (!game) throw new NoGamesError();
			analysisRunning = true;
			return new Promise(function(resolve, reject) {
				_.delay(function(analyzedGame) {
					console.warn("GAME ANALYZED: " + analyzedGame._id)
					resolve(analyzedGame);
				}, 1000, game);
			})
		})
		.then(function(analyzedGame) {
			analysisRunning = false;
			return dataService.removeAnalyzedGame(analyzedGame._id);
		})
		.tap(function(amountLeft) {
			console.log("AMOUNT LEFT IN CONTROLLER:" + amountLeft);
			Box.Application.broadcast('pendingGamesUpdate', amountLeft);
		})
		.catch(NoGamesError, function() {
			console.log("ANALYSIS CONTROLLER: No games available");
			Box.Application.broadcast('pendingGamesUpdate', 0);
		});	
	}

	var start = function() {
		// Perhaps check from settings if 'autoanalysis' is true?
		// If not -> do nothing
		analyzeGame();
	}

	var stopAnalysing = function() {
		stopRequested = true;
		Box.Application.broadcast('analysisStatusChange', false);
	}

	var resumeAnalysing = function() {
		if (analysisRunning) {
			if (!stopRequested) return;
			stopRequested = false;
			return true;
		}

		// Prepare to start analysing
		stopRequested = false;
		return analyzeGame();
	}

	return {
		start: start,
		stopAnalysing: stopAnalysing,
		resumeAnalysing: resumeAnalysing
	}
}