noflo = require 'noflo'

module.exports = (name, inports, outports) ->
  class PolymerComponent extends noflo.Component
    constructor: ->
      @element = null
      @eventHandlers = {}
      @inPorts =
        element: new noflo.Port 'object'
      inports.forEach (inport) =>
        @inPorts[inport] = new noflo.Port 'all'
        @inPorts[inport].on 'data', (data) =>
          @element[inport] = data
          if @outPorts.element.isAttached()
            @outPorts.element.send data
      @outPorts =
        element: new noflo.Port 'object'
      outports.forEach (outport) =>
        @outPorts[outport] = new noflo.ArrayPort 'all'
        @eventHandlers[outport] = (event) =>
          @outPorts[outport].send event.detail

      @inPorts.element.on 'data', (@element) =>
        outports.forEach (outport) =>
          @element.addEventListener outport, @eventHandlers[outport], false

    shutdown: ->
      for name, port of @outPorts
        @element.removeEventListener name, @eventHandlers[outport], false
        @outPorts[name].disconnect()
      @element = null

  return PolymerComponent
