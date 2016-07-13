var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');

module.exports = function(Box, dataAPI) {
	Box.Application.addService('dataService', function(application) {

		/* Returns Promise */
	    var needPosition = function(fen) {
	    	return dataAPI.getPosition(fen);	
	    }

		/* Returns Promise */
	    var train = function(fen, result) {
	    	return dataAPI.positionWasTrained(fen, result);	
	    }

	    /* Returns Promise */
	    var occur = function(fen) {
	    	return dataAPI.positionOccurred(fen);
	    }

	    /* Returns Promise */
	    var needCount = function() {
	    	return needAll().then(function(positions) {
	    		if (!positions) return 0;
	    		return positions.length;
	    	});
	    }

	    /* Returns Promise */
	    var needAll = function() {
	    	return dataAPI.getList();
	    }

	    var getTrainingSet = function(size, includeOnly) {

	    	if (includeOnly === 'random') {
	    		return dataAPI.getList().then(function(positions) {
	    			return _.sampleSize(positions, size);
	    		});

	    	} else if (includeOnly === 'topXLatest') {
	    		// This is pretty heave on large data set
	    		return dataAPI.getList().then(function(positions) {
	    			var sorted = _.sortBy(positions, function(position) {
	    				var occurs = position.occurs
	    				return _.last(occurs);
	    			});

	    			return _.take(sorted, size);
	    		});

	    	} else {
	    		throw "Unsupported training set selection: " + includeOnly;
	    	}
	    }

	    var getCombinedTrainingSet = function(portions) {

	    	return Promise.reduce(portions, function(gatherArr, portion) {
	    		return getTrainingSet(portion.size, portion.includeOnly).then(function(trainPositions) {
	    			return _.concat(gatherArr,trainPositions);
	    		})
	    	}, []);

	    	
	    }

	    var getPendingGame = function() {
	    	return dataAPI.getPendingGame();
	    }
	    // Note! Promise returned gets eventually num of games left in db
	    var removeAnalyzedGame = function(gameID) {
	    	return dataAPI.removeAnalyzedGame(gameID).then(dataAPI.countPendingGames);
	    }


	    return {
	    	needCount: needCount,
	    	needAll: needAll,
	        needPosition: needPosition,
	        train: train,
	        occur: occur,
	        getTrainingSet: getTrainingSet,
	        getCombinedTrainingSet: getCombinedTrainingSet,
	        getPendingGame: getPendingGame,
	        removeAnalyzedGame: removeAnalyzedGame,

	    };
	});


}