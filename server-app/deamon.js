(function () {

	var cron = require('cron');
	var q = require('q');
	var configuration = require('./config.json');
	var utils = require('./service/utils')(configuration);
	var db = utils.getDatabase(configuration.db);
	var tournamentService = require('./service/tournament')(db, configuration);
	var matchService = require('./service/match')(db, configuration);

	var computeTeam = function (name) {
		var defered = q.defer();
		tournamentService.getTeam(name).then(function (team) {
			if (team) {
				defered.resolve(team);
			} else {
				defered.resolve(name);
			}
		}, function (err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var computeOneMatch = function (match) {
		var defered = q.defer();
		var matchName = allMatches[i].name;
		allMatches[i].computedTeams = [];
		for (var j in allMatches[i].teams) {}
		return defered.promise;
	}

	var computeAllMatches = function () {
		var defered = q.defer();
		matchService.getAllMatchTeam().then(function (allMatches) {
			//console.log(allMatches);
			for (var i in allMatches) {
				var matchName = allMatches[i].name;
				allMatches[i].computedTeams = [];
				for (var j in allMatches[i].teams) {
					computeTeam(allMatches[i].teams[j]).then(function (team) {
						console.log(i + ' - ' + team);
						allMatches[i].computedTeams.push(team);
					}, function (err) {
						console.log(err);
					});
				}
			}
			defered.resolve(allMatches);
		}, function (err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var mainProcess = function () {
		computeAllMatches().then(function (allMatches) {
			//console.log(allMatches);
		}, function (err) {
			console.log(err);
		});
	};


	var cronJob = cron.job(configuration.daemon.cron, mainProcess);
	cronJob.start();

})();