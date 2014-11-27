var express = require('express');
var router = express.Router();
var configuration = null;
var teams = null;
var pools = null;
var utils = null;

/* GET on team */
router.get('/:poolName', function(req, res) {
	pools.findOne({
		"name": req.params.poolName
	}, {
		fields: {
			_id: false
		}
	}).then(function(data) {
		res.send({
			status: 'ok',
			data: data
		});
	}, function(err) {
		res.log('ERROR: could not access pool database');
		res.send({
			status: 'error',
			message: 'Database error on pools'
		});
	});
});

module.exports = function(db, config) {
	configuration = config;
	teams = db.get('teams');
	pools = db.get('pools');
	return router;
};