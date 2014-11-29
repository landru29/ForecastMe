var express = require('express');
var router = express.Router();
var configuration = null;
var forecasts = null;
var userService = null;


router.post('/', function(req, res) {
	var userKey = req.body.key;
	var forecast = req.body.forecast;

	userService.getUserByKey(userKey).then(function(user) {
		var toSave = {
			login: user.login,
			key: user.key,
			matchName: forecast.match,
			team0: forecast.team0,
			team1: forecast.team1,
		};
		forecasts.update({
			key: user.key,
			matchName: forecast.match
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
	}, function(err) {
		res.log('ERROR: could not read the user');
		res.send({
			status: 'error',
			message: 'Database error on users'
		});
	});
});

module.exports = function(db, config) {
	configuration = config;
	forecasts = db.get('forecasts');
	userService = require('../service/users')(db, config);
	return router;
};