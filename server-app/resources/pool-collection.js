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
		q.all(GroupScorePromises).then(function(results) {
			var thesePoints = {};
			var theseWons = {};
			for (var i in results) {
				for (var j in results[i]) {
					thesePoints[j] = results[i][j].points;
					theseWons[j] = results[i][j].win;
				}
			}
			for (var gp in data) {
				for (var t in data[gp].pool) {
					data[gp].pool[t].points = thesePoints[data[gp].name + '.' + t];
					data[gp].pool[t].win = theseWons[data[gp].name + '.' + t];
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