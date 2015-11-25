var saucelabsConfig = require('./.saucelabs.js');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      options: {
        "--web-security": "no",
        force: true,
        coverage: {
          src: ['src/jquery.tree-multiselect.js'],
          instrumentedFiles: "temp/",
          htmlReport: "report/coverage",
          lcovReport: "report/lcov",
          linesThresholdPct: 0
        }
      },
      all: ['test/runner.html']
    },
    jshint: {
      all: ['src/jquery.tree-multiselect.js']
    },
    cssmin: {
      dist: {
        files: {
          'dist/jquery.tree-multiselect.min.css': ['src/jquery.tree-multiselect.css']
        }
      }
    },
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
    'saucelabs-qunit': {
      all: {
        options: {
          urls: ['http://127.0.0.1:' + saucelabsConfig.port + '/test/runner.html'],
          testname: 'Tree Multiselect sauce tests',
          build: process.env.TRAVIS_JOB_ID,
          browsers: saucelabsConfig.browsers,
          statusCheckAttempts: 240,
          'max-duration': 480
        }
      }
    },
    connect: {
      server: {
        options: {
          base: "",
          port: saucelabsConfig.port
        }
      }
    },
    coveralls: {
      options: {
        // dont fail if coveralls fails
        force: true
      },
      all: {
        src: "report/lcov/lcov.info"
      }
    },
  });

  grunt.loadNpmTasks('grunt-qunit-istanbul');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-coveralls');

  grunt.registerTask('test', ['qunit', 'jshint']);
  grunt.registerTask('test-travis', ['test', 'coveralls', 'connect', 'saucelabs-qunit']);
  grunt.registerTask('default', 'test');
  grunt.registerTask('release', ['test', 'cssmin', 'uglify', 'usebanner']);
};
