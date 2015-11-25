var saucelabsConfig = require('./conf/saucelabs.js');

module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Karma runner
    karma: {
      options: {
        configFile: 'conf/karma.js',
      },
      local: {
      },
      continuous: {
        autoWatch: true,
        singleRun: false
      },
      saucelabs: {
        reporters: ['saucelabs'],
        sauceLabs: {
          testName: "Tree Multiselect tests",
          startConnect: false
        },
        customLaunchers: saucelabsConfig.browsers,
        browsers: Object.keys(saucelabsConfig.browsers)
      }
    },

    // JSHint
    jshint: {
      all: ['src/jquery.tree-multiselect.js']
    },

    // Minify CSS
    cssmin: {
      dist: {
        files: {
          'dist/jquery.tree-multiselect.min.css': ['src/jquery.tree-multiselect.css']
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
          'dist/jquery.tree-multiselect.min.js': ['src/jquery.tree-multiselect.js']
        }
      }
    },

    // Put headers on distributed files
    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: "/* jQuery Tree Multiselect v<%= pkg.version %> | " +
                  "(c) Patrick Tsai et al. | MIT Licensed */",
          linebreak: true
        },
        files: {
          src: ['dist/*.min.*']
        }
      }
    },

    // Upload LCOV data to coveralls.io
    coveralls: {
      ci: {
        src: 'coverage/**/lcov.info',
        force: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-coveralls');

  grunt.registerTask('test-local', ['karma:local', 'jshint']);
  grunt.registerTask('test-watch', ['karma:continuous']);
  grunt.registerTask('test-travis', ['test-local', 'coveralls', 'karma:saucelabs']);
  grunt.registerTask('release', ['test-local', 'cssmin', 'uglify', 'usebanner']);

  grunt.registerTask('default', 'test-local');
};
