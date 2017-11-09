module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # Browser build of NoFlo
    noflo_browser:
      build:
        files:
          'browser/noflo-polymer.js': ['package.json']

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-noflo-browser'

  # Our local tasks
  @registerTask 'build', 'Build NoFlo for the chosen target platform', (target = 'all') =>
    @task.run 'noflo_browser'
  @registerTask 'default', ['build']
