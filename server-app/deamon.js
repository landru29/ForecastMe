(function() {

	var cron = require('cron');
	var q = require('q');
	var configuration = require('./config.json');
	var utils = require('./service/utils')(configuration);
	var db = utils.getDatabase(configuration.db);
	var tournamentService = require('./service/tournament')(db, configuration);
	var matchService = require('./service/match')(db, configuration);

	var computeTeam = function(name) {
		var defered = q.defer();
		tournamentService.getTeam(name).then(function(team) {
			if (team) {
				defered.resolve(team);
			} else {
				defered.resolve(name);
			}
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var computeOneMatch = function(match) {
		var defered = q.defer();
		var promises = [];
		for (var i in match.teams) {
			promises.push(computeTeam(match.teams[i]));
		}
		q.all(promises).then(function(teams) {
			match.computed = teams;
			defered.resolve(match);
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var computeAllMatches = function() {
		var defered = q.defer();
		matchService.getAllMatchTeam().then(function(allMatches) {
			var promises = [];
			for (var i in allMatches) {
				promises.push(computeOneMatch(allMatches[i]));
			}
			q.all(promises).then(function(computedMatches) {
				defered.resolve(computedMatches);
			}, function(err) {
				defered.reject(err);
			});
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var mainProcess = function() {
		computeAllMatches().then(function(allMatches) {
			var promises = [];
			for (var i in allMatches) {
				console.log('Update ' + allMatches[i].name);
				promises.push(matchService.updateComputedTeams(allMatches[i].name, allMatches[i]));
			}
			q.all(promises).then(function(data) {
				var d = new Date();
				console.log(d.toISOString() + '[' + process.pid + ']: ##### DEAMON : ' + data.length + ' matches were updated #####');
			}, function(err) {
				console.log(err);
			});
		}, function(err) {
			console.log(err);
		});
	};

	console.log('************ DEAMON STARTED ON PID ' + process.pid + ' ************');
	mainProcess();

	var cronJob = cron.job(configuration.daemon.cron, mainProcess);
	cronJob.start();

})();