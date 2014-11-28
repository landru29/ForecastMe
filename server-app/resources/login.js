var express = require('express');
var router = express.Router();
var configuration = null;
var userService = null;


router.post('/', function(req, res) {
	res.log('Trying to login ...');
	if ((req.body.user) && ((req.body.password))) {
		res.log('login: ' + req.body.user);
		userService.checkUser(req.body.user, req.body.password).then(function(data) {
			if (data) {
				res.send({
					status: 'connected',
					data: data
				});
			} else {
				res.send({
					status: 'disconnected',
					data: null
				});
			}
		}, function(message) {
			res.send({
				status: 'disconnected',
				data: null
			});
		});
	} else {
		res.send({
			status: 'disconnected',
			data: null
		});
	}
});

router.get('/', function(req, res) {
	res.log('check username ...');
	if (req.query.user) {
		res.log('check: ' + req.query.user);
		userService.userAvailable(req.query.user).then(function(data) {
			res.send({
				status: 'available',
				username: req.query.user
			});
		}, function(message) {
			res.send({
				status: 'already used',
				username: req.query.user
			});
		});
	} else {
		res.send({
			status: 'What do you want ?'
		});
	}
});

router.put('/', function(req, res) {
	res.log('Sending confirmation email ...');
	console.log(res);
	var url = req.headers.origin + '/#/user-create';
	if ((req.body.user) && ((req.body.email))) {
		res.log('login: ' + req.body.user);
		userService.sendConfirmation(url, req.body.user, req.body.email).then(function(data) {
			res.send({
				status: 'ok'
			});

		}, function(message) {
			res.send({
				status: 'ko'
			});
		});
	} else {
		res.send({
			status: 'What do you want ?'
		});
	}
});

module.exports = function(db, config) {
	configuration = config;
	teams = db.get('teams');
	userService = require('../service/users')(db, config);
	return router;
};