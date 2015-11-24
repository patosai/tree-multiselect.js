var saucelabsPort = 3000;

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
          build: process.env.TRAVIS_JOB_ID
        }
      }
    },
    connect: {
      server: {
        options: {
          base: "",
          port: saucelabsPort,
          keepalive: true
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
  grunt.registerTask('test-travis', ['test', 'saucelabs-qunit']);
  grunt.registerTask('default', 'test');
  grunt.registerTask('release', ['test', 'cssmin', 'uglify', 'usebanner']);
};
