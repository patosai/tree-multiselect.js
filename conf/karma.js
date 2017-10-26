var browserifyIstanbul = require('browserify-istanbul');
var path = require('path');

module.exports = function(config) {
  config.set({

    basePath: '../',

    frameworks: ['browserify', 'mocha', 'chai'],

    plugins: [
      'karma-browserify',
      'karma-chai',
      'karma-coverage',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-phantomjs-launcher'
    ],

    files: [
      'test/vendor/jquery-1.11.3.min.js',
      'test/vendor/jquery-ui.min.js',
      'src/tree-multiselect.js',
      'test/**/*.test.js'
    ],

    exclude: [],

    preprocessors: {
      // browserify handles istanbul coverage
      'src/tree-multiselect.js': ['browserify'],
      'test/**/*.test.js': ['browserify']
    },

    reporters: ['mocha', 'coverage'],

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
        ['browserify-istanbul', {
          instrumenterConfig: {
            embedSource: true
          }
        }]
      ],

      paths: [
        'src',
        'node_modules'
      ]
    },

    client: {
      mocha: {
        fullTrace: true
      }
    },

    mochaReporter: {
      showDiff: true
    },

    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        {type: 'text-summary'},
        {type: 'lcovonly'},
        {type: 'html'}
      ]
    }
  });
}
