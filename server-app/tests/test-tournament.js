var test = require('./init');
var service = require('../service/tournament')(test.database, test.config);

/*service.getTeam('group1.A').then(function(team) {
	console.log(JSON.stringify(team));
}, function(err) {
	console.log(JSON.stringify(team));
});*/

service.getTeam('final.1').then(function(scores) {
	console.log(JSON.stringify(scores));
	test.database.close();
}, function(err) {
	console.log(err);
	test.database.close();
});