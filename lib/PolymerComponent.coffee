noflo = require 'noflo'

module.exports = (name, inports, outports) ->
  class PolymerComponent extends noflo.Component
    constructor: ->
      @inPorts =
        element: new noflo.Port 'object'
      for inport in inports
        @inPorts[inport] = new noflo.Port 'all'
      @outPorts = {}
      for outport in outports
        @outPorts[outport] = new noflo.ArrayPort 'all'
  return PolymerComponent
