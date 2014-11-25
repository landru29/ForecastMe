(function () {
	var configuration = null;
	var fs = require('fs');
	var jwtService;

	/**
	 * Get the method of the request
	 * @param  {object}  req  request object
	 * @return {string}       method
	 */
	var getMethod = function (req) {
		if (req.query.method) {
			return req.query.method.toUpperCase();
		} else {
			return req.method.toUpperCase();
		}
	};

	/**
	 * Generate a UUID
	 * @return {string} UUID
	 */
	var generateUUID = function () {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
		});
		return uuid;
	};

	/**
	 * Allow cross-domain
	 * @param  {object}   req        request object
	 * @param  {object}   res        resource object
	 * @param  {array}    domainList list of domains
	 * @return {void}
	 */
	var allowCrossDomain = function (req, res, domainList) {
		if (req.headers.origin) {
			for (var i in domainList) {
				if (domainList[i].toLowerCase() === req.headers.origin.toLowerCase()) {
					res.header('Access-Control-Allow-Origin', req.headers.origin);
				}
			}
		}
	};

	/**
	 * Get the full path of a requested file
	 * @param  {object} req request object
	 * @return {string}     full path
	 */
	var getFullPath = function (req) {
		var resource = req.url.slice(1).replace(/[\?].*/, '');
		return resource.length > 0 ? resource : null;
	};

	/**
	 * Get the resource name in a request
	 * @param  {object} req request object
	 * @return {string}     resource name
	 */
	var getResourceName = function (req) {
		var resource = req.url.slice(1).replace(/[\?\/].*/, '');
		return resource.length > 0 ? resource : null;
	};

	/**
	 * Express Middleware to manage crossdomain
	 * @param  {object}   req  request object
	 * @param  {object}   res  resource object
	 * @param  {Function} next Callback for the next middleware
	 * @return {void}
	 */
	var corsMiddleware = function (req, res, next) {
		allowCrossDomain(req, res, configuration.cors);
		switch (getMethod(req)) {
		case 'OPTIONS':
			var allowedHeaderFields = ['origin', 'content-type', 'accept', 'Authorization'];
			var allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
			res.header('Access-Control-Allow-Headers', allowedHeaderFields.join(', '));
			res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
			res.log('Cors: ' + allowedHeaderFields.join(', '));
			break;
		default:
		}
		next();
	};

	/**
	 * Express Middleware file get if the file is present in the file system
	 * @param  {object}   req  request object
	 * @param  {object}   res  resource object
	 * @param  {Function} next Callback for the next middleware
	 * @return {void}
	 */
	var fileSystemMiddleware = function (req, res, next) {
		var publicFolder = configuration.basePath + '/' + configuration.public.folder;
		switch (getMethod(req)) {
		case 'GET':
			var requestedPath = getFullPath(req);
			var requestedUrl = ((req.url) && (req.url.length > 1) ? req.url : '/' + configuration.public.default);
			var filename = publicFolder + requestedUrl;
			res.log(filename);
			// check if a specific file was requested
			if ((requestedUrl) && (fs.existsSync(filename))) {
				res.log('Serving file ' + requestedUrl);
				res.sendfile(requestedUrl, {
					root: publicFolder
				});
			} else {
				res.log('File ' + filename + ' not found');
				next();
			}
			break;
		default:
			next();
		}
	};

	/**
	 * Express Middleware to manage ACL
	 * @param  {object}   req  request object
	 * @param  {object}   res  resource object
	 * @param  {Function} next Callback for the next middleware
	 * @return {void}
	 */
	var aclMiddleware = function (req, res, next) {
		var method = getMethod(req);
		switch (method) {
		case 'GET':
		case 'POST':
		case 'PUT':
		case 'DELETE':
			var resource = getResourceName(req);
			var role = ((req.identity) && (req.identity.userRole) ? req.identity.userRole : 'guest');
			if ((configuration.resources[resource]) && (configuration.resources[resource].acl[method]) && (configuration.resources[resource].acl[method] == role)) {
				next();
			} else {
				res.status(405);
				console.log(configuration.resources[resource]);
				res.send({
					status: 'error',
					message: 'resource ' + resource + ' not allowed to ' + role + ' ' + method
				});
				res.log('resource ' + resource + ' not allowed to ' + role);
			}
			break;
		default:
			next();
		}
	};

	/**
	 * Express Middleware to manage sessions
	 * In each middleware req.log(string) function is available
	 *
	 * @param  {object}     stream file stream for logs
	 * @return {middleware}
	 */
	var sessionMiddelware = function (req, res, next) {
		var newSession = function () {
			var sessionDuration = ((configuration.session) && (configuration.session.timeout) ? parseInt(configuration.session.timeout, 10) : 31622400) * 1000;
			var calculatedTimout = '' + (new Date().getTime() + parseInt(configuration.session.timeout, 10) * 1000);
			return {
				timeout: calculatedTimout,
				uuid: generateUUID()
			};
		};

		if (!req.session.timeout) {
			req.session = newSession();
			res.log('New session: ' + req.session.uuid);
		}
		var serverTimestamp = new Date().getTime();
		var sessionTimeout = parseInt(req.session.timeout, 10);
		if (sessionTimeout < serverTimestamp) {
			res.log('Session timeout: ' + req.session.uuid);
			req.session = newSession();
		}
		next();
	};

	/**
	 * Express Middleware to manage LOG
	 * In each middleware req.log(string) function is available
	 *
	 * @param  {object}     stream file stream for logs
	 * @return {middleware}
	 */
	var logMiddleware = function (stream) {
		return function (req, res, next) {
			res.uuid = generateUUID();

			res.log = function (message) {
				var fullMessage = (new Date()).toISOString() + ' [' + process.pid + '] (' + res.uuid + '): ' + message;
				stream.write(fullMessage + "\n");
				console.log(fullMessage);
			};

			next();
		};
	};

	module.exports = function (config) {
		configuration = config;
		return {
			cors: corsMiddleware,
			fileSystem: fileSystemMiddleware,
			acl: aclMiddleware,
			log: logMiddleware,
			session: sessionMiddelware,
			getResourceName: getResourceName,
			getMethod: getMethod
		};
	};
})();