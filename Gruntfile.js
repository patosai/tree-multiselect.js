var saucelabsPort = 3000;
var saucelabsBrowsers = [
  // Chrome
  ['Linux', 'chrome', '46'],
  ['Linux', 'chrome', '40'],
  ['Linux', 'chrome', '34'],
  ['Linux', 'chrome', '28'],
  // Safari
  ['OSX 10.11', 'safari', '9'],
  ['OSX 10.10', 'safari', '8'],
  ['OSX 10.9', 'safari', '7'],
  ['OSX 10.8', 'safari', '6'],
  // Firefox
  ['Linux', 'firefox', '42'],
  ['Linux', 'firefox', '36'],
  ['Linux', 'firefox', '30'],
  ['Linux', 'firefox', '24'],
  ['Linux', 'firefox', '18'],
  // Opera
  ['Linux', 'opera', '12'],
  // IE
  ['Windows 10', 'edge', '20'],
  ['Windows 7', 'internet explorer', '11'],
  ['Windows 7', 'internet explorer', '10'],
  ['Windows 7', 'internet explorer', '9'],
  ['Windows 7', 'internet explorer', '8'],
  ['Windows XP', 'internet explorer', '7'],
  ['Windows XP', 'internet explorer', '6'],
  // iOS
  ['OS X 10.8', 'ipad', '9.2'],
  ['OS X 10.8', 'ipad', '8.4'],
  ['OS X 10.8', 'ipad', '7.1'],
  ['OS X 10.8', 'ipad', '6.1'],
  ['OS X 10.8', 'ipad', '5.1'],
  ['OS X 10.8', 'iphone', '9.2'],
  ['OS X 10.8', 'iphone', '8.4'],
  ['OS X 10.8', 'iphone', '7.1'],
  ['OS X 10.8', 'iphone', '6.1'],
  ['OS X 10.8', 'iphone', '5.1'],
  // Android
  ['Android', 'Android', '5.1'],
  ['Android', 'Android', '4.4'],
  ['Android', 'Android', '2.3'],
];

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      options: {
        force: true
      },
      all: ['test/runner.html']
    },
    'saucelabs-qunit': {
      all: {
        options: {
          urls: ['http://127.0.0.1:' + saucelabsPort + '/test/runner.html'],
          testname: 'Tree Multiselect sauce tests',
          build: process.env.TRAVIS_JOB_ID,
          browsers: saucelabsBrowsers
        }
      }
    },
    connect: {
      server: {
        options: {
          base: "",
          port: saucelabsPort
        }
      }
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['qunit', 'jshint']);
  grunt.registerTask('test-travis', ['test', 'connect', 'saucelabs-qunit']);
  grunt.registerTask('default', 'test');
  grunt.registerTask('release', ['test', 'cssmin', 'uglify', 'usebanner']);
};
