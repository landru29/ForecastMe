var conf = require('../config.json');
var utils = require('../service/utils')(conf);
var db = utils.getDatabase(conf.db);
var tabletService = require('../dao/tablet')(db, conf);

// Declare options
var getopt = require('node-getopt').create([
	['a', 'action=ARG', 'insert | read'],
	['u', 'uuid=ARG', 'Tablet UUID'],
	['n', 'name=ARG', 'Tablet name'],
	['i', 'contractid=ARG', 'Contract ID'],
]);

// Process options
var opt = getopt.bindHelp().parseSystem();

// Insert a tablet
var insert = function (args) {
	if ((args.uuid) && (args.name) && (args.contractid)) {
		var saveObject = {
			UUID: args.uuid,
			name: args.name,
			contractId: args.contractid
		};
		tabletService.add(saveObject).then(function (data) {
			console.log('Tablet inserted');
			db.close();
		}, function (err) {
			console.log('Error while inserting tablet');
			console.log(err);
			db.close();
		});
	} else {
		getopt.showHelp();
	}
};

// read tablets
var read = function (args) {
	var filter = {};
	if (args.uuid) {
		filter.UUID = args.uuid;
	}
	if (args.contractid) {
		filter.contractId = args.contractid;
	}
	if (args.name) {
		filter.name = args.name;
	}
	tabletService.getAll(filter).then(function (data) {
		console.log(data);
		db.close();
	}, function (err) {
		console.log('Error while reading tablets');
		console.log(err);
		db.close();
	});
};

var readOne = function (args) {
	var filter = {};
	if (args.uuid) {
		tabletService.getOne(args.uuid).then(function (data) {
			console.log(data);
			db.close();
		}, function (err) {
			console.log('Error while reading tablets');
			console.log(err);
			db.close();
		});
	}
	db.close();
};

// Process actions
switch (opt.options.action) {
case 'insert':
	insert(opt.options);
	break;
case 'read':
	read(opt.options);
	break;
case 'readOne':
	read(opt.options);
	break;
default:
	getopt.showHelp();
	db.close();
}