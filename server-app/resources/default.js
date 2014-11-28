var express = require('express');
var router = express.Router();
var configuration = null;
var database = null;
/* GET home page. */
router.get('/', function(req, res) {

});


module.exports = function(db, config) {
	configuration = config;
	database = db;
	return router;
};