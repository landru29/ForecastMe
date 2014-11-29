var express = require('express');
var router = express.Router();
var configuration = null;
var service = null;

router.get('/:matchName', function(req, res) {
	service.getOneMatch(req.params.matchName).then(function(data) {
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