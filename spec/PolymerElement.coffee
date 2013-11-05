noflo = require 'noflo'
unless noflo.isBrowser()
  chai = require 'chai' unless chai

describe 'Polymer component binding', ->
  loader = null
  inst = null
  before ->
    loader = new noflo.ComponentLoader '/noflo-polymer'
  describe 'when instantiated', ->
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
