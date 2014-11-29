var express = require('express');
var router = express.Router();
var configuration = null;
var service = null;


router.get('/', function(req, res) {
	service.getAllMatches().then(function(data) {
		console.log('response');
		res.send({
			status: 'ok',
			data: data
		});
	}, function(err) {
		res.send({
			status: 'ko',
			data: err
		});
	});
});

module.exports = function(db, config) {
	configuration = config;
	service = require('../service/match')(db, config);
	return router;
};