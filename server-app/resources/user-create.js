var express = require('express');
var router = express.Router();
var configuration = null;
var userService = null;


router.post('/', function(req, res) {
	res.log('check userame for creation ...');
	if ((req.body.user) && (req.body.key) && (req.body.email) && (req.body.password)) {
		res.log('check: ' + req.body.user);
		userService.createFromLink(req.body.user, req.body.key, req.body.email, req.body.password).then(function(data) {
			res.send(data);
		}, function(message) {
			res.send({
				status: 'error',
				message: message
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