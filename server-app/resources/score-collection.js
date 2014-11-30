var express = require('express');
var router = express.Router();
var configuration = null;
var scores = null;


router.get('/', function(req, res) {
	var userKey = req.query.key;
	scores.find({
		key: userKey
	}, {
		fields: {
			_id: false
		}
	}).then(function(data) {
		res.send({
			status: 'ok',
			data: data
		});
	}, function() {
		res.send({
			status: 'error',
			message: 'Database error on scores'
		});
	});

});

module.exports = function(db, config) {
	configuration = config;
	scores = db.get('scores');
	return router;
};