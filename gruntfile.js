module.exports = function(grunt) {

	grunt.initConfig({
		uglify: {
			main: {
				options: {
					/*
					expression: {},
					mangle: {
						sort: true
					}
					*/
				},
				files: {
					'./dist/m-select-d-box.min.js': ['./dist/m-select-d-box.js']
				}
			}
		},

		jsdoc : {
			dist : {
				src: "./dist/m-select-d-box.js",
				options: {
					destination: "./docs/",
					configure: "./docs/jsdoc.json"
				}
			}
		},

		jsdox: {
			generate: {
				options: {
					contentsTitle: 'm-select-d-box documentation'
				},
				src: "./dist/m-select-d-box.js",
				dest: './docs-jsdox/'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-jsdox');
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask(
		'default',
		[
			'uglify',
			// 'jsdox',
			'jsdoc'
		]
	);

};