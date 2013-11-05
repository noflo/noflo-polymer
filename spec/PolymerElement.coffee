noflo = require 'noflo'
unless noflo.isBrowser()
  chai = require 'chai' unless chai

describe 'Polymer component binding', ->
  loader = null
  inst = null
  element = null
  first = null
  second = null
  result = null
  before ->
    loader = new noflo.ComponentLoader '/noflo-polymer'
    element = noflo.internalSocket.createSocket()
    first = noflo.internalSocket.createSocket()
    second = noflo.internalSocket.createSocket()
    result = noflo.internalSocket.createSocket()
  describe 'with new ComponentLoader', ->
    it 'there shouldn\'t be any registered components', ->
      chai.expect(loader.components).to.be.a 'null'
    it 'should be able to list installed components', (done) ->
      loader.listComponents ->
        chai.expect(loader.components).to.be.an 'object'
        chai.expect(loader.components).not.to.be.empty
        done()
    it 'should have the Polymer-built component registered', ->
      chai.expect(loader.components['polymer/test-element']).to.be.a 'function'
  describe 'on component loading', ->
    it 'should be possible to load', (done) ->
      loader.load 'polymer/test-element', (instance) ->
        chai.expect(instance).to.be.an 'object'
        inst = instance
        done()
    it 'should contain the required inPorts', ->
      chai.expect(inst.inPorts).to.have.keys 'element', 'first', 'second'
    it 'should contain the required outPorts', ->
      chai.expect(inst.outPorts).to.have.keys 'result'
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
