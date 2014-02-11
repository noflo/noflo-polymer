noflo = require 'noflo'

module.exports = (name, inports, outports) ->
  class PolymerComponent extends noflo.Component
    constructor: ->
      @element = null
      @eventHandlers = {}
      @inPorts =
        selector: new noflo.Port 'string'
        element: new noflo.Port 'object'
      inports.forEach (inport) =>
        @inPorts[inport] = new noflo.ArrayPort 'all'
        @inPorts[inport].on 'connect', =>
          if toString.call(@element[inport]) is '[object Array]'
            # Only clear the array on first connect
            connected = 0
            for socket in @inPorts[inport].sockets
              connected++ if socket.isConnected()
            return unless connected is 1
            @element[inport].splice 0, @element[inport].length
        @inPorts[inport].on 'data', (data) =>
          if typeof @element[inport] is 'function'
            @element[inport] data
            return
          if toString.call(@element[inport]) is '[object Array]'
            if toString.call(data) is '[object Array]'
              @element[inport] = data
              return
            @element[inport].push data
          else
            @element[inport] = data
      @outPorts =
        element: new noflo.Port 'object'
        error: new noflo.Port 'object'
      outports.forEach (outport) =>
        @outPorts[outport] = new noflo.ArrayPort 'all'
        @eventHandlers[outport] = (event) =>
          return unless @outPorts[outport].isAttached()
          @outPorts[outport].send event.detail

      @inPorts.selector.on 'data', (selector) =>
        @element = document.querySelector selector
        unless @element
          @error "No element matching '#{selector}' found"
          return
        outports.forEach (outport) =>
          return if outport is 'element'
          @element.addEventListener outport, @eventHandlers[outport], false
        if @outPorts.element.isAttached()
          @outPorts.element.send @element
          @outPorts.element.disconnect()
      @inPorts.element.on 'data', (@element) =>
        outports.forEach (outport) =>
          return if outport is 'element'
          @element.addEventListener outport, @eventHandlers[outport], false
        if @outPorts.element.isAttached()
          @outPorts.element.send @element
          @outPorts.element.disconnect()

    shutdown: ->
      outports.forEach (outport) =>
        return if name is 'element'
        @element.removeEventListener outport, @eventHandlers[outport], false
        @outPorts[outport].disconnect()
      @element = null

  PolymerComponent.getComponent = -> new PolymerComponent

  return PolymerComponent
