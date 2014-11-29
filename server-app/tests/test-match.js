var test = require('./init');
var service = require('../service/match')(test.database, test.config);

/*service.getTeam('group1.A').then(function(team) {
	console.log(JSON.stringify(team));
}, function(err) {
	console.log(JSON.stringify(team));
});*/

service.getOneMatch('group1.AB').then(function(matches) {
	console.log(JSON.stringify(matches));
}, function(err) {
	console.log(JSON.stringify(matches, undefined, 2));
});