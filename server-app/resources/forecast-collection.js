var express = require('express');
var router = express.Router();
var configuration = null;
var forecasts = null;


router.get('/', function(req, res) {
	var userKey = req.query.key;

	forecasts.find({
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
			message: 'Database error on forecasts'
		});
	});

});

module.exports = function(db, config) {
	configuration = config;
	forecasts = db.get('forecasts');
	return router;
};