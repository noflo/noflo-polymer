module.exports = function(config) {
  const files = [
    'node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js',
    'browser/noflo-polymer.js',
    'spec/*.js',
    'spec/browser/*.js',
    {
      pattern: 'spec/*.html',
      included: false,
      served: true,
      watched: true,
    },
    {
      pattern: 'noflo-polymer/*.html',
      included: false,
      served: true,
      watched: true,
    },
  ];

  const configuration = {
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files,
    exclude: [],
    preprocessors: {},
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],
    //browsers: [],
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  };

  config.set(configuration);
}
