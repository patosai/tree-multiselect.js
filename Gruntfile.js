module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      options: {
        force: true
      },
      all: ['test/**/*.html']
    },
    cssmin: {
      dist: {
        files: {
          'jquery.tree-multiselect.min.css': ['src/jquery.tree-multiselect.css']
        }
      }
    },
    uglify: {
      dist: {
        options: {
          preserveComments: false,
          banner: "/* jQuery Tree Multiselect v<%= pkg.version %> | " +
                  "(c) Patrick Tsai | MIT Licensed */\n"
        },
        files: {
          'jquery.tree-multiselect.min.js': ['src/jquery.tree-multiselect.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test', 'qunit');
  grunt.registerTask('default', 'test');
  grunt.registerTask('release', ['cssmin', 'uglify']);
};
