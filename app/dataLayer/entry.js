//var app = require('electron').app;
var _ = require('lodash');
var Promise = require('bluebird');

// Database tech
var Datastore = require('nedb');
var db;

//TEST & SEED STUFF - NO NEED IN PRODUCTION
var seeder = require('./seeder');


module.exports = function(datastorepath) {

	db = new Datastore({ 
		filename: datastorepath,
		autoload: true
	});

	return 	{

		// For testing & dev only
		runSeed: function(numOfPositions) {
			var positions = [];
			_.times(numOfPositions, function() {
				var position = seeder.position();
				console.log(position);
				position.occurs = seeder.occurs();
				position.trainings = seeder.trainings();

				positions.push(position);
			});

			console.log("POSITIONS TO DB FROM SEED:")
			console.log(positions);

			// Start putting to DB
			return new Promise(function(resolve, reject) {
				db.insert(positions, function(err) {
					if (err) return reject(err);
					resolve();
				})
			});
		},

		positionOccurred: function(fen) {
			return new Promise(function(resolve, reject) {
				db.update(
					{fen: fen}, // Search clause
					{$push: {occurs: Date.now()}}, // Modify clause
					{upsert: true}, // Options
					function(err) {
						if (err) return reject(err);
						return resolve(true);
					}
				);
			});	
		},
		positionWasTrained: function(fen, result) {
			return new Promise(function(resolve, reject) {
				db.update(
					{fen: fen}, // Search clause
					{$push: {trainings: {res: !!result, ts: Date.now()}}}, // Modify clause
					{}, // Options
					function(err) {
						if (err) return reject(err);
						return resolve(true);
					}
				);
			});		
		},
		getPosition: function(fen) {
			return new Promise(function(resolve, reject) {
				db.find({fen: fen}, function(err, positions) {
					if (err) return reject(err);
					return resolve(positions[0]); // There must be only one!
				});
			});
		},
		getList: function() {
			return new Promise(function(resolve, reject) {
				db.find({}, function(err, positions) {
					if (err) return reject(err);
					return resolve(positions);
				});
			});
		}
	}
}








