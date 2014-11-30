var express = require('express');
var router = express.Router();
var configuration = null;
var scores = null;


router.post('/', function(req, res) {
	var score = req.body.score;
	var toSave = {
		matchName: score.match,
		team0: score.team0,
		team1: score.team1,
	};
	scores.update({
		matchName: score.match
	}, toSave, {
		upsert: true
	}).then(function(data) {
		res.send({
			status: 'ok',
		});
	}, function() {
		res.send({
			status: 'error',
			message: 'Database error on forecasts'
		});
	});
});

module.exports = function(db, config) {
	configuration = config;
	scores = db.get('scores');
	return router;
};