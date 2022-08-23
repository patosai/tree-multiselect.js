const sass = require('node-sass');

module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      target: ['src/**/*.js']
    },

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

    // Karma runner
    karma: {
      options: {
        configFile: 'conf/karma.js',
      },

      local: {},

      watch: {
        autoWatch: true,
        singleRun: false
      }
    },

    // SASS compiler
    sass: {
      options: {
        implementation: sass,
        sourceMap: false
      },

      min: {
        options: {
          outputStyle: 'nested'
        },

        files: {
          'dist/jquery.tree-multiselect.css': 'sass/style.scss'
        }
      },

      build: {
        options: {
          outputStyle: 'compressed'
        },

        files: {
          'dist/jquery.tree-multiselect.min.css': 'sass/style.scss'
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
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('build', ['browserify']);

  grunt.registerTask('test', ['lint', 'karma:local']);
  grunt.registerTask('test-watch', ['karma:watch']);

  grunt.registerTask('release', ['test', 'build', 'uglify', 'sass:build', 'sass:min', 'usebanner']);
  grunt.registerTask('watch', ['test-watch']);

  grunt.registerTask('default', 'test');
};
