const noflo = require('noflo');

describe('Polymer component binding', function() {
  const loader = new noflo.ComponentLoader('/noflo-polymer');
  before(done => {
    const fixtures = document.createElement('div');
    fixtures.id = 'fixtures'
    fixtures.innerHTML = `\
<noflo-polymer name="test-element" inports="first second" outports="result"></noflo-polymer>
<noflo-polymer name="test-element2" inports="first second" outports="event"></noflo-polymer>\
`;
    document.body.append(fixtures);
    done();
  });

  describe('with new ComponentLoader', function() {
    it('there shouldn\'t be any registered components', () => chai.expect(loader.components).to.be.a('null'));
    it('should be able to list installed components', done =>
      loader.listComponents(function() {
        chai.expect(loader.components).to.be.an('object');
        chai.expect(loader.components).not.to.be.empty;
        done();
      })
    );
    it('should have the Polymer-built components registered', function() {
      chai.expect(loader.components['polymer/test-element']).to.be.a('function');
      chai.expect(loader.components['polymer/test-element2']).to.be.a('function');
    });
  });
  describe('component with direct event-port mapping', function() {
    let inst = null;
    let element = null;
    let first = null;
    let second = null;
    let result = null;
    let event = null;
    before(function() {
      element = noflo.internalSocket.createSocket();
      first = noflo.internalSocket.createSocket();
      second = noflo.internalSocket.createSocket();
      event = noflo.internalSocket.createSocket();
    });
    describe('on component loading', function() {
      it('should be possible to load', done =>
        loader.load('polymer/test-element', function(err, instance) {
          if (err) { return done(err); }
          chai.expect(instance).to.be.an('object');
          inst = instance;
          done();
        })
      );
      it('should contain the required inPorts', () => chai.expect(inst.inPorts.ports).to.have.keys('element', 'event', 'selector', 'first', 'second'));
      it('should contain the required outPorts', () => chai.expect(inst.outPorts.ports).to.have.keys('element', 'error', 'result'));
    });
    describe('on instantiation', function() {
      it('should receive the element', function() {
        inst.inPorts.element.attach(element);
        inst.inPorts.first.attach(first);
        inst.inPorts.second.attach(second);
        const el = document.createElement('test-element');
        document.querySelector('#fixtures').appendChild(el);
        element.send(el);
        chai.expect(inst.element).to.be.ok;
      });
      it('should receive the first value', () => first.send(2));
      it('should have made it available via element props', () => chai.expect(inst.element.first).to.equal(2));
    });
    describe('on event', function() {
      beforeEach(function() {
        result = noflo.internalSocket.createSocket();
        inst.outPorts.result.attach(result);
      });
      afterEach(() => inst.outPorts.result.detach(result));
      it('should send to outport', function(done) {
        result.on('data', function(data) {
          chai.expect(data).to.equal(5);
          done();
        });
        second.send(3);
      });
      it('should have made it available via element props', () => chai.expect(inst.element.second).to.equal(3));
    });
  });
  describe('component with Fluxified event-port mapping', function() {
    let inst = null;
    let element = null;
    let first = null;
    let second = null;
    let event = null;
    before(function() {
      element = noflo.internalSocket.createSocket();
      first = noflo.internalSocket.createSocket();
      second = noflo.internalSocket.createSocket();
      event = noflo.internalSocket.createSocket();
    });
    describe('on component loading', function() {
      it('should be possible to load', done =>
        loader.load('polymer/test-element2', function(err, instance) {
          if (err) { return done(err); }
          chai.expect(instance).to.be.an('object');
          inst = instance;
          done();
        })
      );
      it('should contain the required inPorts', () => chai.expect(inst.inPorts.ports).to.have.keys('element', 'event', 'selector', 'first', 'second'));
      it('should contain the required outPorts', () => chai.expect(inst.outPorts.ports).to.have.keys('element', 'error', 'event'));
    });
    describe('on instantiation', function() {
      it('should receive the element', function() {
        inst.inPorts.element.attach(element);
        inst.inPorts.first.attach(first);
        inst.inPorts.second.attach(second);
        const el = document.createElement('test-element2');
        document.querySelector('#fixtures').appendChild(el);
        element.send(el);
        chai.expect(inst.element).to.be.ok;
      });
      it('should receive the first value', function() {
        first.send(2);
        chai.expect(inst.element.first).to.equal(2);
      });
    });
    describe('on event', function() {
      before(() => inst.outPorts.event.attach(event));
      after(() => inst.outPorts.event.detach(event));
      it('should send to outport', function(done) {
        const groups = [];
        event.on('begingroup', group => groups.push(group));
        event.on('endgroup', () => groups.pop());
        event.on('data', function(data) {
          chai.expect(data).to.equal(5);
          chai.expect(groups).to.eql([
            'result'
          ]);
          inst.outPorts.event.detach(event);
          done();
        });
        second.send(3);
        chai.expect(inst.element.second).to.equal(3);
      });
      it('should still also fire the event', function(done) {
        inst.element.addEventListener('result', function(event) {
          chai.expect(event.detail).to.equal(8);
          done();
        }
        , false);
        second.send(6);
        chai.expect(inst.element.second).to.equal(6);
      });
    });
  });
});
