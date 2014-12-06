var express = require('express');
var router = express.Router();
var q = require('q');
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
		console.log(GroupScorePromises.length);
		q.all(GroupScorePromises).then(function(points) {
			var thesePoints = {};
			for (var i in points) {
				for (var j in points[i]) {
					thesePoints[j] = points[i][j];
				}
			}
			for (var gp in data) {
				for (var t in data[gp].pool) {
					data[gp].pool[t].points = thesePoints[data[gp].name + '.' + t];
				}
			}
			res.send({
				status: 'ok',
				data: data
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