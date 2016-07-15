var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');
var fs = require('fs');

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
	    	console.log("ADD PENDING GAMES REACHED");
	    	// We need to generate unique game id for each
	    	var games = _.map(arrayOfPGNs, function(pgn) {
	    		// property '_id' is used as key in NeDB so we use that
	    		return {_id: uuid.v4(), pgn: pgn};
	    	});

	    	return dataAPI.addPendingGames(games)
	    	.then(dataAPI.countPendingGames)
	    	.then(function(totalNumOfGames) {
	    		Box.Application.broadcast('pendingGamesUpdate', totalNumOfGames);
	    	});
	    }

	    var uploadFromPGNFile = function(filepath) {

	    	console.log("UPLOAD FROM PGN FILE IN SERVICE LAYER");
	    	console.log(filepath);

	    	var ipc = application.getService('processCommunication');

	    	return new Promise(function(resolve, reject) {
	    		fs.readFile(filepath, "utf8", function(err, pgnText) {
	    			if (err) return reject(err);
	    			return resolve(pgnText);
	    		});
	    	})
	    	.then(function(pgnText) {
	    		console.log("Sending to bg process for parsing");
	    		return ipc.sendToBackgroundProcess({eventname: 'pgnParsingNeeded', data: pgnText});  		
	    	})
	    	.then(function(msgBack) {
	    		console.log("MSG BACK");
	    		console.log(msgBack);
	    		return msgBack.games;
	    	})
	    	.then(addPendingGames);

	    }

		return {
			uploadFromPGNFile: uploadFromPGNFile,
			pgnsUpload: pgnsUpload
		}

	});

}