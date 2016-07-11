
var Promise = require('bluebird');

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


	    return {
	    	needCount: needCount,
	    	needAll: needAll,
	        needPosition: needPosition,
	        train: train,
	        occur: occur

	    };
	});


}