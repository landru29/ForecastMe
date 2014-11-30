var express = require('express');
var router = express.Router();
var configuration = null;
var forecastService = null;


router.get('/', function(req, res) {
	forecastService.getRanking().then(function(data) {
		res.send({
			status: 'ok',
			data: data
		});
	}, function(err) {
		res.send({
			status: 'error',
			message: err
		});
	});
});

module.exports = function(db, config) {
	configuration = config;
	forecastService = require('../service/forecast.js')(db, config);
	return router;
};