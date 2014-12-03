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
		//console.log('     - Dealing with ' + name);
		tournamentService.getTeam(name).then(function (team) {
			if (team) {
				console.log('Found (' + team.name + ') ' + name);
				defered.resolve(team);
			} else {
				console.log('Not found ' + name);
				defered.resolve(name);
			}
		}, function (err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var computeOneMatch = function (match) {
		var defered = q.defer();
		var promises = [];
		//console.log(' * computing ' + match.name);
		for (var i in match.teams) {
			promises.push(computeTeam(match.teams[i]));
		}
		q.all(promises).then(function (teams) {
			match.computed = teams;
			//console.log(teams);
			defered.resolve(match);
		}, function (err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var computeAllMatches = function () {
		var defered = q.defer();
		matchService.getAllMatchTeam().then(function (allMatches) {
			//console.log('computing ' + allMatches.length + ' matches');
			var promises = [];
			for (var i in allMatches) {
				promises.push(computeOneMatch(allMatches[i]));
			}
			q.all(promises).then(function (computedMatches) {
				defered.resolve(computedMatches);
			}, function (err) {
				defered.reject(err);
			});
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