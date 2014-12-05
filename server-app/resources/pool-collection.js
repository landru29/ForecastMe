var express = require('express');
var router = express.Router();
var configuration = null;
var teams = null;
var pools = null;
var utils = null;


/* GET all teams */
router.get('/', function(req, res) {
	pools.find({}, {
		fields: {
			_id: false
		}
	}).then(function(data) {
		var GroupScorePromises = [];
		for (var i in data) {
			GroupScorePromises.push(tournament.getGroupPoints(data[i].name));
		}
		q.all(GroupScorePromises).then(function(points) {
			res.send({
				status: 'ok',
				data: data,
				points: points
			});
		}, function(gpErr) {
			res.send({
				status: 'error',
				message: 'Database error on scoring'
			});
		});
	}, function(err) {
		res.log('ERROR: could not access team database');
		res.send({
			status: 'error',
			message: 'Database error on teams'
		});
	});
});

module.exports = function(db, config) {
	configuration = config;
	teams = db.get('teams');
	pools = db.get('pools');
	tournament = require('../service/tournament')(db, config);
	return router;
};