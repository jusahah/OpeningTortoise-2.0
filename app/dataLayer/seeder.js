var positions = [
 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2'

]

var currSeed = -1;

module.exports = {

	position: function() {
		++currSeed;
		if (currSeed === positions.length) currSeed = 0;
		return {_id: positions[currSeed], fen: positions[currSeed]};
	},
	occurs: function() {
		var latest = Date.now() - 3600 * 1000;
		return _.times(5 + Math.round(Math.random()*5), function() {
			return latest - Math.round(Math.random() * 30 * 24 * 3600 * 1000);
		});
	},
	trainings: function() {
		var latest = Date.now() - 3600 * 1000;
		return _.times(5 + Math.round(Math.random()*5), function() {
			return {
				res: Math.random() < 0.5,
				ts: latest - Math.round(Math.random() * 30 * 24 * 3600 * 1000)
			}
		});
	}	
}