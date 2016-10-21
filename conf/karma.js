var isparta = require('isparta');
var browserifyIstanbul = require('browserify-istanbul');
var path = require('path');

const TEMP_DIR = 'tmp/'

module.exports = function(config) {
  config.set({

    basePath: '../',

    frameworks: ['browserify', 'qunit'],

    plugins: [
      'karma-browserify',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-qunit',
    ],

    files: [
      'test/vendor/jquery-1.11.3.min.js',
      'test/vendor/jquery-ui.min.js',
      'test/**/*.test.js',
    ],

    exclude: [],

    preprocessors: {
      // browserify handles istanbul coverage
      'src/tree-multiselect.js': ['browserify'],
      'test/**/*.test.js': ['browserify'],
    },

    reporters: ['progress', 'coverage'],

    port: 9876,

    colors: true,

    // config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['PhantomJS'],

    singleRun: true,

    concurrency: Infinity,

    browserify: {
      debug: true,

      transform: [
        ['babelify'],
        browserifyIstanbul({
          instrumenter: isparta,
          ignore: ['**/node_modules/**']
        })
      ],

      paths: [
        'src',
        'node_modules',
      ]
    },

    coverageReporter: {
      dir: path.join(TEMP_DIR, 'coverage/'),
      reporters: [
        { type: 'text-summary' },
        { type: 'lcovonly' },
      ]
    }
  });
}
