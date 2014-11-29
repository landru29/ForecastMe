(function() {

	var users = null;
	var configuration = null;
	var q = require('q');
	var crypto = require('crypto');
	var nodemailer = require('nodemailer');
	var salt = '3hteryu()fhjksq&';

	var addIndexes = function() {
		return q.all([users.index('login', {
			unique: true
		}), users.index('key', {
			unique: true
		})]);
	};

	var getRoles = function(role) {
		var theseRoles = (configuration.acl[role] ? configuration.acl[role] : []);
		theseRoles.push(role);
		return theseRoles;
	};

	var generateUUID = function() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
		});
		return uuid;
	};

	var createUser = function(user) {
		var defered = q.defer();
		users.insert(user).then(function(data) {
			if (Object.prototype.toString.call(user) === '[object Array]') {
				defered.resolve(user.length);
			} else {
				defered.resolve(1);
			}

		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var getUserByKey = function(userKey) {
		var defered = q.defer();
		users.findOne({
			key: userKey
		}, {
			fields: {
				password: false,
				_id: false
			}
		}).then(function(data) {
			if (data) {
				defered.resolve(data);
			} else {
				defered.reject('Bad key');
			}
		}, function(message) {
			defered.reject(message)
		});
		return defered.promise;
	}

	var checkUser = function(login, password) {
		var defered = q.defer();
		users.findOne({
			login: login,
			password: crypto.createHash('sha256').update(password).digest('hex')
		}, {
			fields: {
				password: false,
				_id: false
			}
		}).then(function(data) {
			if (data) {
				data.role = getRoles(data.role);
				defered.resolve(data);
			} else {
				defered.reject('Bad login/password');
			}
		}, function(message) {
			defered.reject(message)
		});
		return defered.promise;
	};

	var createFromLink = function(user, key, email, password) {
		var defered = q.defer();
		if (crypto.createHash('sha256').update(user + salt + email).digest('hex') === key) {
			userAvailable(user).then(function() {
				console.log('Creating user');
				var uuid = generateUUID();
				role = 'user';
				createUser({
					login: user,
					password: crypto.createHash('sha256').update(password).digest('hex'),
					key: uuid,
					email: email,
					role: role
				}).then(function() {
					defered.resolve({
						status: 'done',
						key: uuid,
						user: user,
						role: getRoles(role)
					});
				}, function() {
					defered.reject({
						status: 'database error'
					});
				});
			}, function() {
				defered.reject({
					status: 'user not available'
				});
			});
		} else {
			defered.reject({
				status: 'bad request'
			});
		}
		return defered.promise;
	}

	var userAvailable = function(login) {
		var defered = q.defer();
		users.findOne({
			login: login
		}).then(function(data) {
			if (data) {
				defered.reject('Username not available');
			} else {
				defered.resolve(true);
			}
		}, function(message) {
			defered.reject(message)
		});
		return defered.promise;
	};

	var sendConfirmation = function(baseUrl, user, email) {
		var defered = q.defer();
		href = baseUrl + '/user/' + encodeURIComponent(user) +
			'/key/' + encodeURIComponent(crypto.createHash('sha256').update(user + salt + email).digest('hex')) +
			'/email/' + encodeURIComponent(email)
		var mailOptions = {
			from: 'ForecastMeNow ! <noreply@gmail.com>', // sender address
			to: email, // list of receivers
			subject: 'Create your account', // Subject line
			text: 'Copy / paste this link: ' + href, // plaintext body
			html: '<b>Click on the link:</b><br/><a href="' + href + '">' + href + '</a>' // html body
		};
		console.log('Sending confirmation to ' + email);


		var transporter = nodemailer.createTransport(configuration.email);
		transporter.sendMail(mailOptions, function(error, info) {
			if (error) {
				defered.reject(error);
			} else {
				console.log('Mail sent');
				defered.resolve(true);
			}
		});
		return defered.promise;
	};

	module.exports = function(db, conf) {
		users = db.get('users');
		configuration = conf;
		//console.log(configuration);
		return {
			create: createUser,
			addIndexes: addIndexes,
			checkUser: checkUser,
			userAvailable: userAvailable,
			sendConfirmation: sendConfirmation,
			createFromLink: createFromLink,
			generateUUID: generateUUID,
			getUserByKey: getUserByKey
		};
	};
})();