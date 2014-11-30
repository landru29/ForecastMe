var express = require('express');
var router = express.Router();
var configuration = null;
var forecastService = null;



router.post('/', function(req, res) {
	forecastService.add(req.body.key, req.body.forecast).then(function() {
		res.send({
			status: 'ok',
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