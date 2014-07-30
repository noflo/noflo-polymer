noflo = require 'noflo'
unless noflo.isBrowser()
  chai = require 'chai' unless chai

describe 'Polymer component binding', ->
  loader = new noflo.ComponentLoader '/noflo-polymer'
  describe 'with new ComponentLoader', ->
    it 'there shouldn\'t be any registered components', ->
      chai.expect(loader.components).to.be.a 'null'
    it 'should be able to list installed components', (done) ->
      loader.listComponents ->
        chai.expect(loader.components).to.be.an 'object'
        chai.expect(loader.components).not.to.be.empty
        done()
    it 'should have the Polymer-built components registered', ->
      chai.expect(loader.components['polymer/test-element']).to.be.a 'function'
      chai.expect(loader.components['polymer/test-element2']).to.be.a 'function'
  describe 'component with direct event-port mapping', ->
    inst = null
    element = null
    first = null
    second = null
    result = null
    event = null
    before ->
      element = noflo.internalSocket.createSocket()
      first = noflo.internalSocket.createSocket()
      second = noflo.internalSocket.createSocket()
      result = noflo.internalSocket.createSocket()
      event = noflo.internalSocket.createSocket()
    describe 'on component loading', ->
      it 'should be possible to load', (done) ->
        loader.load 'polymer/test-element', (instance) ->
          chai.expect(instance).to.be.an 'object'
          inst = instance
          done()
      it 'should contain the required inPorts', ->
        chai.expect(inst.inPorts.ports).to.have.keys 'element', 'selector', 'first', 'second'
      it 'should contain the required outPorts', ->
        chai.expect(inst.outPorts.ports).to.have.keys 'element', 'error', 'result'
    describe 'on instantiation', ->
      it 'should receive the element', ->
        inst.inPorts.element.attach element
        inst.inPorts.first.attach first
        inst.inPorts.second.attach second
        inst.outPorts.result.attach result
        el = document.createElement 'test-element'
        document.querySelector('#fixtures').appendChild el
        element.send el
        chai.expect(inst.element).to.be.an 'object'
      it 'should receive the first value', ->
        first.send 2
        chai.expect(inst.element.first).to.equal 2
    describe 'on event', ->
      it 'should send to outport', (done) ->
        result.on 'data', (data) ->
          chai.expect(data).to.equal 5
          done()
        second.send 3
        chai.expect(inst.element.second).to.equal 3
  describe 'component with Fluxified event-port mapping', ->
    inst = null
    element = null
    first = null
    second = null
    result = null
    event = null
    before ->
      element = noflo.internalSocket.createSocket()
      first = noflo.internalSocket.createSocket()
      second = noflo.internalSocket.createSocket()
      result = noflo.internalSocket.createSocket()
      event = noflo.internalSocket.createSocket()
    describe 'on component loading', ->
      it 'should be possible to load', (done) ->
        loader.load 'polymer/test-element2', (instance) ->
          chai.expect(instance).to.be.an 'object'
          inst = instance
          done()
      it 'should contain the required inPorts', ->
        chai.expect(inst.inPorts.ports).to.have.keys 'element', 'selector', 'first', 'second'
      it 'should contain the required outPorts', ->
        chai.expect(inst.outPorts.ports).to.have.keys 'element', 'error', 'event'
    describe 'on instantiation', ->
      it 'should receive the element', ->
        inst.inPorts.element.attach element
        inst.inPorts.first.attach first
        inst.inPorts.second.attach second
        inst.outPorts.event.attach event
        el = document.createElement 'test-element2'
        document.querySelector('#fixtures').appendChild el
        element.send el
        chai.expect(inst.element).to.be.an 'object'
      it 'should receive the first value', ->
        first.send 2
        chai.expect(inst.element.first).to.equal 2
    describe 'on event', ->
      it 'should send to outport', (done) ->
        groups = []
        event.on 'begingroup', (group) ->
          groups.push group
        event.on 'endgroup', ->
          groups.pop()
        event.on 'data', (data) ->
          chai.expect(data).to.equal 5
          chai.expect(groups).to.eql [
            'result'
          ]
          inst.outPorts.event.detach event
          done()
        second.send 3
        chai.expect(inst.element.second).to.equal 3
      it 'should still also fire the event', (done) ->
        inst.element.addEventListener 'result', (event) ->
          chai.expect(event.detail).to.equal 8
          done()
        , false
        second.send 6
        chai.expect(inst.element.second).to.equal 6
