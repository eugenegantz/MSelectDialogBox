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
		}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['uglify']);

};