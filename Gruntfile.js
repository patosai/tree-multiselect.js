module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      options: {
        force: true
      },
      all: ['test/runner.html']
    },
    jshint: {
      all: ['src/jquery.tree-multiselect.js']
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
        },
        files: {
          'jquery.tree-multiselect.min.js': ['src/jquery.tree-multiselect.js']
        }
      }
    },
    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: "/* jQuery Tree Multiselect v<%= pkg.version %> | " +
                  "(c) Patrick Tsai et al. | MIT Licensed */",
          linebreak: true
        },
        files: {
          src: ['*.min.*']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['qunit', 'jshint']);
  grunt.registerTask('default', 'test');
  grunt.registerTask('release', ['test', 'cssmin', 'uglify', 'usebanner']);
};
