var gameTrackingCreator = require('./gameTracking');

var tracker = gameTrackingCreator();

tracker.newFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
var moves = tracker.newFen('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
console.log(moves);