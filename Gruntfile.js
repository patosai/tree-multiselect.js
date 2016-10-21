module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      'dist/jquery.tree-multiselect.js': ['src/tree-multiselect.js']
    },

    // Upload LCOV data to coveralls.io
    coveralls: {
      options: {
        force: true
      },
      ci: {
        src: 'tmp/coverage/**/lcov.info'
      }
    },

    // JSHint
    jshint: {
      options: {
        esversion: 6
      },
      all: ['src/**/*.js']
    },


    // Karma runner
    karma: {
      options: {
        configFile: 'conf/karma.js',
      },

      local: {
      },

      // requires browserify to be run
      release: {
        files: [
          'test/vendor/jquery-1.11.3.min.js',
          'test/vendor/jquery-ui.min.js',
          'dist/jquery.tree-multiselect.js',
          'test/integration/*.test.js',
        ],
      },

      continuous: {
        autoWatch: true,
        singleRun: false
      }
    },

    // SASS compiler
    sass: {
      options: {
        sourceMap: false,
        outputStyle: 'compressed'
      },
      dist: {
        files: {
          'dist/jquery.tree-multiselect.min.css': 'src/style.scss'
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
          banner: "// jQuery Tree Multiselect v<%= pkg.version %> | (c) Patrick Tsai et al. | MIT Licensed",
          linebreak: true
        },
        files: {
          src: ['dist/*.js', 'dist/*.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-banner');
  // TODO yarn add --dev grunt-browserify
  //grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test-local', ['karma:local', 'jshint']);
  grunt.registerTask('test-travis', ['test-local', 'coveralls']);
  grunt.registerTask('test-watch', ['karma:continuous']);
  grunt.registerTask('build-dist', ['browserify', 'karma:release']);
  grunt.registerTask('release', ['test-local', 'build-dist', 'sass', 'uglify', 'usebanner']);

  grunt.registerTask('default', 'test-local');
};
