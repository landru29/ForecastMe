var express = require('express');
var router = express.Router();
var configuration = null;
var database = null;
var utils = null;

//var collectionName = 'application';

/* POST application */
router.get('/', function (req, res) {
	if ((req.body.user) && ((req.body.password))) {
		var log = utils.filterObject(req.body, {
			'user': true,
			'password': true
		});
		res.send({
			status: 'ok',
			message: 'Good job!'
		});
	} else {
		res.log('ERROR: no user/password specified');
		res.send({
			status: 'error',
			message: 'you must specify a user/password'
		});
	}
});


module.exports = function (db, config) {
	configuration = config;
	database = db;
	return router;
};