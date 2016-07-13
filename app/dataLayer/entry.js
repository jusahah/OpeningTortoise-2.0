//var app = require('electron').app;
var _ = require('lodash');
var Promise = require('bluebird');

// Database tech
var Datastore = require('nedb');
var db;
var pendingGames;

//TEST & SEED STUFF - NO NEED IN PRODUCTION
var seeder = require('./seeder');


module.exports = function(datastorepath, pendinggamespath) {

	db = new Datastore({ 
		filename: datastorepath,
		autoload: true
	});

	pendingGames = new Datastore({
		filename: pendinggamespath,
		autoload: true
	});

	return 	{

		// Interface 1 for actual data handling

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
		},

		/*
		*
		*
		*/

		// Interface 2 for pending game handling

		getPendingGame: function() {

			return new Promise(function(resolve, reject) {
				pendingGames.find({}).limit(1).exec(function(err, docs) {
					console.log("PENDING GAME");
					console.log(docs);
					if (err) return reject(err);
					resolve(docs[0]);
				});
			});

		},

		addPendingGames: function(arrayOfGames) {

			console.log("ADDING THESE GAMES IN DATA API");
			console.log(arrayOfGames);

			return new Promise(function(resolve, reject) {
				pendingGames.insert(arrayOfGames, function(err) {
					if (err) return reject(err);
					resolve();
				})
			});
		},

		removeAnalyzedGame: function(gameID) {

			return new Promise(function(resolve, reject) {
				pendingGames.remove({ _id: gameID}, {}, function (err, numRemoved) {
				  if (err) return reject(err);
				  resolve();
				});
			});
		},

		countPendingGames: function() {
			return new Promise(function(resolve, reject) {
				pendingGames.count({}, function(err, count) {
					resolve(count);
				})
			});			
		}
	}
}








