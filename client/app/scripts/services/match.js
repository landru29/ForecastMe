'use strict';

/**
 * @ngdoc service
 * @name forecastMeNowApp.match
 * @description
 * # match
 * Factory in the forecastMeNowApp.
 */
angular.module('forecastMeNowApp')
  .factory('match', ['$http', '$q', 'users', 'registry', function($http, $q, users, registry) {

    var getMatchByName = function(matches, name) {
      for (var gp in matches) {
        for (var matchIndex in matches[gp].matches) {
          if (matches[gp].matches[matchIndex].name === name) {
            return matches[gp].matches[matchIndex];
          }
        }
      }
      return null;
    };

    var getMatches = function() {
      var matches = [];
      var defered = $q.defer();
      var matchPromise = $http.get(registry.get('apiUrl') + '/match-collection/?key=' + users.getKey());

      matchPromise.then(function(response) {
        if (response.data.status === 'ok') {
          matches = [];
          var keys = Object.keys(response.data.data);
          for (var i in keys) {
            matches.push({
              groupName: keys[i],
              matches: response.data.data[keys[i]]
            });
          }

          for (var gp in matches) {
            for (var matchIndex in matches[gp].matches) {
              if (!matches[gp].matches[matchIndex].score) {
                matches[gp].matches[matchIndex].score = [null, null];
              }
              if (!matches[gp].matches[matchIndex].forecast) {
                matches[gp].matches[matchIndex].forecast = [null, null];
              }
            }
          }

        } else {
          matches = [];
        }
        defered.resolve(matches);
      }, function() {
        defered.reject('server error');
      });
      return defered.promise;
    };

    var getForecasts = function() {
      var forecasts = [];
      var defered = $q.defer();
      var forecastPromise = $http.get(registry.get('apiUrl') + '/forecast-collection?key=' + users.getKey());
      forecastPromise.then(function(response) {
        forecasts = response.data.data;
        defered.resolve(forecasts);
      }, function() {
        defered.reject('server error');
      });
      return defered.promise;
    };

    var getForecastedMatches = function() {
      var defered = $q.defer();
      $q.all([getMatches(), getForecasts()]).then(function(result) {
        var matches = result[0];
        var forecasts = result[1];
        for (var index in forecasts) {
          var match = getMatchByName(matches, forecasts[index].matchName);
          if (match) {
            /*var teamName0 = (typeof match.teams[0] === 'string' ? match.teams[0] : match.teams[0].country.code);
            if (teamName0 === forecasts[index].team0.teamName) {
              match.forecast[0] = forecasts[index].team0.forecast;
              match.forecast[1] = forecasts[index].team1.forecast;
            } else {
              match.forecast[0] = forecasts[index].team1.forecast;
              match.forecast[1] = forecasts[index].team0.forecast;
            }*/
            match.forecast[0] = forecasts[index].team0.forecast;
            match.forecast[1] = forecasts[index].team1.forecast;
          }
        }
        defered.resolve(matches);
      }, function(err) {
        defered.reject(err);
      });
      return defered.promise;
    };

    var saveForecast = function(thisMatch) {
      var defered = $q.defer();
      var forecast = {
        match: thisMatch.name,
        team0: {
          forecast: (thisMatch.forecast[0] ? thisMatch.forecast[0] : 0),
          teamName: (typeof thisMatch.teams[0] === 'string' ? thisMatch.teams[0] : thisMatch.teams[0].country.code)
        },
        team1: {
          forecast: (thisMatch.forecast[1] ? thisMatch.forecast[1] : 0),
          teamName: (typeof thisMatch.teams[1] === 'string' ? thisMatch.teams[1] : thisMatch.teams[1].country.code)
        }
      };
      $http.post(registry.get('apiUrl') + '/forecast', {
        key: users.getKey(),
        forecast: forecast
      }).then(function(response) {
        if ((response.data.status) && (response.data.status === 'ok')) {
          defered.resolve('Forecast saved');
        } else {
          defered.reject('Can not update your forecast');
        }
      }, function() {
        defered.reject('Server error');
      });
      return defered.promise;
    };

    var saveScore = function(thisMatch) {
      var defered = $q.defer();
      var score = {
        match: thisMatch.name,
        team0: {
          score: (thisMatch.score[0] ? thisMatch.score[0] : 0),
          teamName: (typeof thisMatch.teams[0] === 'string' ? thisMatch.teams[0] : thisMatch.teams[0].country.code)
        },
        team1: {
          score: (thisMatch.score[1] ? thisMatch.score[1] : 0),
          teamName: (typeof thisMatch.teams[1] === 'string' ? thisMatch.teams[1] : thisMatch.teams[1].country.code)
        }
      };
      $http.post(registry.get('apiUrl') + '/score', {
        key: users.getKey(),
        score: score
      }).then(function(response) {
        if ((response.data.status) && (response.data.status === 'ok')) {
          defered.resolve('Score saved');
        } else {
          defered.reject('Can not update your score');
        }
      }, function() {
        defered.reject('Server error');
      });
      return defered.promise;
    };


    // Public API here
    return {
      getForecastedMatches: getForecastedMatches,
      saveForecast: saveForecast,
      getMatches: getMatches,
      saveScore: saveScore
    };
  }]);