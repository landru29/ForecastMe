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
		res.send({
			status: 'ok',
			data: data
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
	return router;
};