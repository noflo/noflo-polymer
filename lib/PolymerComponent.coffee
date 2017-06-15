noflo = require 'noflo'

toString = (x) -> ({}).toString.call x

bindAllEvents = (element, port) ->
  originalFire = element.fire.bind element
  element.fire = (event, detail, toNode) ->
    if event.indexOf('-changed') isnt -1
      # Polymer 1.x fires an event for each changed property. Ignore these
      originalFire event, detail, toNode
      return
    groups = event.split ':'
    port.beginGroup grp for grp in groups
    port.send detail?.value or detail
    port.endGroup() for grp in groups
    originalFire event, detail, toNode

setUp = (component, outports) ->
  outports.forEach (outport) ->
    return if outport is 'element'
    if outport is 'event'
      # Fluxified event binding
      bindAllEvents component.element, component.outPorts.event
      return
    handler = component.eventHandlers[outport]
    component.element.addEventListener outport, handler, false
  if component.outPorts.element.isAttached()
    component.outPorts.element.send component.element
    component.outPorts.element.disconnect()
  component.element.fire 'noflo:ready'

module.exports = (name, inports, outports) ->
  return ->
    c = new noflo.Component
    c.element = null
    c.eventHandlers = {}
    c.inPorts.add 'selector',
      datatype: 'string'
      description: 'DOM selector for getting the element'
    c.inPorts.add 'element',
      datatype: 'object'
      description: 'Existing Polymer element instance'
    c.inPorts.add 'event',
      datatype: 'string'
      description: 'Fire an event on polymer element'
    c.outPorts.add 'element',
      datatype: 'object'
    c.outPorts.add 'error',
      datatype: 'object'

    inports.forEach (inport) ->
      # Add exposed inports
      c.inPorts.add inport,
        datatype: 'all'
      c.inPorts[inport].on 'connect', ->
        return unless toString(c.element[inport]) is '[object Array]'
        # Only clear the array on first connect
        connected = 0
        for socket in c.inPorts[inport].sockets
          connected++ if socket.isConnected()
        return unless connected is 1
        c.element[inport].splice 0, c.element[inport].length
      c.inPorts[inport].on 'data', (data) ->
        if typeof c.element[inport] is 'function'
          # Port handler is a function, call it with the given value
          c.element[inport] data
          return
        if toString(c.element[inport]) is '[object Array]'
          if toString(data) is '[object Array]'
            c.element[inport] = data
            return
          c.element[inport].push data
        else
          c.element[inport] = data

    outports.forEach (outport) ->
      # Add exposed outport
      c.outPorts.add outport,
        datatype: 'all'
      c.eventHandlers[outport] = (event) ->
        # Register event handler for the outport event
        return unless c.outPorts[outport].isAttached()
        c.outPorts[outport].send event.detail

    # Bind instance to a received query selector result
    c.inPorts.selector.on 'data', (selector) ->
      c.element = document.querySelector selector
      unless c.element
        c.error "No element matching '#{selector}' found"
        return
      setUp c, outports
    c.inPorts.element.on 'data', (element) ->
      c.element = element
      unless c.element
        c.error "No element provided"
        return
      setUp c, outports
    c.inPorts.event.on 'data', (event) ->
      c.element?.fire event

    c.shutdown = ->
      outports.forEach (outport) ->
        return if name is 'element'
        c.element.removeEventListener outport, c.eventHandlers[outport], false
        c.outPorts[outport].disconnect()
      c.element = null

    return c
