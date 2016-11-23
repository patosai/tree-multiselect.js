var browserify = require("browserify");
var fs = require("fs");

module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      dist: {
        options: {
          transform: ['babelify']
        },

        files: {
          'dist/jquery.tree-multiselect.js': ['src/tree-multiselect.js']
        }
      }
    },

    // Upload LCOV data to coveralls.io
    coveralls: {
      options: {
        force: true
      },
      ci: {
        src: 'coverage/**/lcov.info'
      }
    },

    // Karma runner
    karma: {
      options: {
        configFile: 'conf/karma.js',
      },

      local: {},

      continuous: {
        autoWatch: true,
        singleRun: false
      }
    },

    // SASS compiler
    sass: {
      options: {
        sourceMap: false
      },

      build: {
        options: {
          outputStyle: 'compressed'
        },

        files: {
          'dist/jquery.tree-multiselect.min.css': 'src/style.scss'
        }
      },

      min: {
        options: {
          outputStyle: 'nested'
        },

        files: {
          'dist/jquery.tree-multiselect.css': 'src/style.scss'
        }
      }
    },

    // Uglify JS
    uglify: {
      dist: {
        options: {
          preserveComments: false,
        },
        files: {
          'dist/jquery.tree-multiselect.min.js': ['dist/jquery.tree-multiselect.js']
        }
      }
    },

    // Put headers on distributed files
    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: "/* jQuery Tree Multiselect v<%= pkg.version %> | (c) Patrick Tsai | MIT Licensed */",
          linebreak: true
        },
        files: {
          src: ['dist/*.js', 'dist/*.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test-local', ['karma:local']);
  grunt.registerTask('test-travis', ['test-local', 'coveralls']);
  grunt.registerTask('test-watch', ['karma:continuous']);

  grunt.registerTask('build', ['browserify']);

  grunt.registerTask('release', ['test-local', 'build', 'uglify', 'sass:build', 'sass:min', 'usebanner']);
  grunt.registerTask('watch', ['test-watch']);

  grunt.registerTask('default', 'test-local');
};
