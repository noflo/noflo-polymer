noflo = require 'noflo'

toString = (x) -> ({}).toString.call x

bindAllEvents = (element, port) ->
  originalFire = element.fire.bind element
  element.fire = (event, detail, toNode) ->
    groups = event.split ':'
    port.beginGroup grp for grp in groups
    port.send detail
    port.endGroup() for grp in groups
    originalFire event, detail, toNode

module.exports = (name, inports, outports) ->
  class PolymerComponent extends noflo.Component
    constructor: ->
      @element = null
      @eventHandlers = {}
      @inPorts = new noflo.InPorts
        selector:
          datatype: 'string'
          description: 'DOM selector for getting the element'
        element:
          datatype: 'object'
          description: 'Existing Polymer element instance'
      inports.forEach (inport) =>
        @inPorts.add inport,
          datatype: 'all'
        @inPorts[inport].on 'connect', =>
          if toString(@element[inport]) is '[object Array]'
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
          if toString(@element[inport]) is '[object Array]'
            if toString(data) is '[object Array]'
              @element[inport] = data
              return
            @element[inport].push data
          else
            @element[inport] = data
      @outPorts = new noflo.OutPorts
        element:
          datatype: 'object'
        error:
          datatype: 'object'
      outports.forEach (outport) =>
        @outPorts.add outport,
          datatype: 'all'
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
          return bindAllEvents @element, @outPorts.event if outport is 'event'
          @element.addEventListener outport, @eventHandlers[outport], false
        if @outPorts.element.isAttached()
          @outPorts.element.send @element
          @outPorts.element.disconnect()
      @inPorts.element.on 'data', (@element) =>
        outports.forEach (outport) =>
          return if outport is 'element'
          return bindAllEvents @element, @outPorts.event if outport is 'event'
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
