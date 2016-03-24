module.exports = function(grunt){

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
					'./js/MSelectDBox.min.js': ['./js/MSelectDBox.js']
				}
			}
		},


		jsdoc : {
			dist : {
				src: "./js/MSelectDBox.js",
				options: {
					destination: "./docs/"
				}
			}
		},


		jsdox: {
			generate: {
				options: {
					contentsTitle: 'MSelectDBox Documentation'
				},

				src: "./js/MSelectDBox.js",
				dest: './docs/'
			}
		}


	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jsdox');
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('default', ['uglify', 'jsdox', 'jsdoc']);

};