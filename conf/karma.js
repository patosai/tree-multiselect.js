// Karma configuration

var isparta = require('isparta');
var browserifyIstanbul = require('browserify-istanbul');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'qunit'],


    plugins: [
      'karma-browserify',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-qunit',
    ],


    // list of files / patterns to load in the browser
    files: [
      'test/vendor/jquery-1.11.3.min.js',
      'test/vendor/jquery-ui.min.js',
      'test/**/*.test.js',
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // browserify handles istanbul coverage
      'test/**/*.test.js': ['browserify'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity,


    browserify: {
      debug: true,

      transform: [
        // this will transform your ES6 and/or JSX
        ['babelify', {"presets": ["es2015"]}],

        // (I think) returns files readable by the reporters
        browserifyIstanbul({
          instrumenter: isparta,
          ignore: ['**/node_modules/**']
        })
      ],

      // paths that we can `require()` from
      paths: [
        'src',
        'node_modules',
      ]
    },


    // Configure coverage reporter
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'text-summary' },
        { type: 'lcovonly' },
      ]
    }
  });
}
