var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');

module.exports = function(Box, dataAPI) {
	Box.Application.addService('inputService', function(application) {

		var pgnsUpload = function(pgnText) {
			// Fake it for now
			var pgns = pgnText.split(" ");

			// Just upload into pending games database
			// AnalysisController will pick them up there
			return addPendingGames(pgns).tap(function() {
				console.log("PENDING GAMES WERE UPLOADED TO DB");
				Box.Application.broadcast('pendingGamesUploaded');
			});

		}

	    var addPendingGames = function(arrayOfPGNs) {
	    	// We need to generate unique game id for each
	    	var games = _.map(arrayOfPGNs, function(pgn) {
	    		// property '_id' is used as key in NeDB so we use that
	    		return {_id: uuid.v4(), pgn: pgn};
	    	});

	    	return dataAPI.addPendingGames(games);
	    }

		return {
			pgnsUpload: pgnsUpload
		}

	});

}