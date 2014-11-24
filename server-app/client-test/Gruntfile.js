module.exports = function (grunt) {

	// 1. Toutes les configurations vont ici:
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		connect: {
			all: {
				options: {
					port: 9000,
					hostname: "0.0.0.0",
					open: {
						appName: 'Chrome'
					},
					livereload: true,
				}
			}
		},

		open: {
			all: {
				path: 'http://localhost:9000/index.html',
				app: 'Google Chrome'
			}
		},

		watch: {
			options: {
				livereload: true
			},
			html: {
				files: ['index.html'],
				livereload: true
			}
		}

	});

	// 3. Nous disons à Grunt que nous voulons utiliser ce plug-in.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-contrib-connect');

	// 4. Nous disons à Grunt quoi faire lorsque nous tapons "grunt" dans la console.
	grunt.registerTask('default', [
		// Open before connect because connect uses keepalive at the moment
		// so anything after connect wouldn't run
		'connect',
		'open',
		'watch'
	]);


};