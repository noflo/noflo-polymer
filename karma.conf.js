module.exports = (config) => {
  const files = [
    'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
    {
      pattern: 'node_modules/@webcomponents/webcomponentsjs/*.js',
      included: false,
      served: true,
    },
    'browser/noflo-polymer.js',
    {
      pattern: 'node_modules/@polymer/polymer/*.js',
      included: false,
      served: true,
      watched: false,
    },
    {
      pattern: 'node_modules/@polymer/polymer/**/*.js',
      included: false,
      served: true,
      watched: false,
    },
    {
      pattern: 'noflo-polymer/noflo-polymer.js',
      included: true,
      served: true,
      watched: true,
      type: 'module',
    },
    {
      pattern: 'spec/elements/*.js',
      included: true,
      served: true,
      watched: true,
      type: 'module',
    },
    'spec/*.js',
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
    // browsers: ['Chrome'],
    // browsers: [],
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    // singleRun: false,
    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  };

  config.set(configuration);
}
