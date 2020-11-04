const noflo = require('noflo');

describe('Polymer component binding', () => {
  const loader = new noflo.ComponentLoader('/noflo-polymer');
  before((done) => {
    const fixtures = document.createElement('div');
    fixtures.id = 'fixtures';
    fixtures.innerHTML = `\
<noflo-polymer name="test-element" inports="first second" outports="result"></noflo-polymer>
<noflo-polymer name="test-element2" inports="first second" outports="event"></noflo-polymer>\
`;
    document.body.append(fixtures);
    done();
  });

  describe('with new ComponentLoader', () => {
    it('there shouldn\'t be any registered components', () => chai.expect(loader.components).to.be.a('null'));
    it('should be able to list installed components', done => loader.listComponents(() => {
      chai.expect(loader.components).to.be.an('object');
      chai.expect(loader.components).not.to.be.empty;
      done();
    }));
    it('should have the Polymer-built components registered', () => {
      chai.expect(loader.components['polymer/test-element']).to.be.a('function');
      chai.expect(loader.components['polymer/test-element2']).to.be.a('function');
    });
  });
  describe('component with direct event-port mapping', () => {
    let inst = null;
    let element = null;
    let first = null;
    let second = null;
    let result = null;
    let event = null;
    let error = null;

    before(() => {
      element = noflo.internalSocket.createSocket();
      first = noflo.internalSocket.createSocket();
      second = noflo.internalSocket.createSocket();
      event = noflo.internalSocket.createSocket();
    });
    after((done) => {
      if (!inst) {
        done();
        return;
      }
      inst.shutdown(done);
    });
    describe('on component loading', () => {
      it('should be possible to load', done => loader.load('polymer/test-element', (err, instance) => {
        if (err) { return done(err); }
        chai.expect(instance).to.be.an('object');
        inst = instance;
        inst.start(done);
      }));
      it('should contain the required inPorts', () => {
        chai.expect(inst.inPorts.ports).to.have.keys('element', 'event', 'selector', 'first', 'second');
      });
      it('should contain the required outPorts', () => {
        chai.expect(inst.outPorts.ports).to.have.keys('element', 'error', 'result');
      });
    });
    describe('on instantiation', () => {
      before(() => {
        inst.inPorts.element.attach(element);
        inst.inPorts.first.attach(first);
        inst.inPorts.second.attach(second);
      });
      it('should fail if the element is not an object', (done) => {
        error = noflo.internalSocket.createSocket();
        inst.outPorts.error.attach(error);
        error.on('data', (err) => {
          chai.expect(err).to.be.an('error');
          chai.expect(err.message).to.contain('is not an object');
          inst.outPorts.error.detach(error);
          done();
        });
        element.send('Fail!');
      });
      it('should receive the element and activate', () => {
        const el = document.createElement('test-element');
        document.querySelector('#fixtures').appendChild(el);
        element.send(el);
        chai.expect(inst.element).to.be.ok;
      });
      it('should receive the first value', () => {
        first.send(2);
      });
      it('should have made it available via element props', () => {
        chai.expect(inst.element.first).to.equal(2);
      });
    });
    describe('on event', () => {
      beforeEach(() => {
        result = noflo.internalSocket.createSocket();
        inst.outPorts.result.attach(result);
        error = noflo.internalSocket.createSocket();
        inst.outPorts.error.attach(error);
      });
      afterEach(() => {
        inst.outPorts.result.detach(result);
        inst.outPorts.error.detach(error);
      });
      it('should send to outport', (done) => {
        error.on('data', done);
        result.on('data', (data) => {
          chai.expect(data).to.equal(5);
          done();
        });
        second.send(3);
      });
      it('should have made it available via element props', () => {
        chai.expect(inst.element.second).to.equal(3);
      });
    });
  });
  describe('component with Fluxified event-port mapping', () => {
    let inst = null;
    let element = null;
    let first = null;
    let second = null;
    let event = null;
    let error = null;
    before(() => {
      element = noflo.internalSocket.createSocket();
      first = noflo.internalSocket.createSocket();
      second = noflo.internalSocket.createSocket();
    });
    after((done) => {
      if (!inst) {
        done();
        return;
      }
      inst.shutdown(done);
    });
    describe('on component loading', () => {
      it('should be possible to load', done => loader.load('polymer/test-element2', (err, instance) => {
        if (err) { return done(err); }
        chai.expect(instance).to.be.an('object');
        inst = instance;
        inst.start(done);
      }));
      it('should contain the required inPorts', () => {
        chai.expect(inst.inPorts.ports).to.have.keys('element', 'event', 'selector', 'first', 'second');
      });
      it('should contain the required outPorts', () => {
        chai.expect(inst.outPorts.ports).to.have.keys('element', 'error', 'event');
      });
    });
    describe('on instantiation', () => {
      it('should receive the element', () => {
        inst.inPorts.element.attach(element);
        inst.inPorts.first.attach(first);
        inst.inPorts.second.attach(second);
        const el = document.createElement('test-element2');
        document.querySelector('#fixtures').appendChild(el);
        element.send(el);
        chai.expect(inst.element).to.be.ok;
      });
      it('should receive the first value', () => {
        first.send(2);
        chai.expect(inst.element.first).to.equal(2);
      });
    });
    describe('on event', () => {
      before(() => {
        event = noflo.internalSocket.createSocket();
        inst.outPorts.event.attach(event);
        error = noflo.internalSocket.createSocket();
        inst.outPorts.error.attach(error);
      });
      after(() => {
        inst.outPorts.event.detach(event);
        inst.outPorts.error.detach(error);
      });
      it('should send to outport', (done) => {
        const groups = [];
        error.on('data', done);
        event.on('data', (data) => {
          chai.expect(data).to.eql({
            action: 'result',
            payload: 5,
          });
          inst.outPorts.event.detach(event);
          done();
        });
        second.send(3);
        chai.expect(inst.element.second).to.equal(3);
      });
      it('should still also fire the event', (done) => {
        error.on('data', done);
        inst.element.addEventListener('result', (event) => {
          chai.expect(event.detail).to.equal(8);
          done();
        },
        false);
        second.send(6);
        chai.expect(inst.element.second).to.equal(6);
      });
    });
  });
  describe('component bound via selector', () => {
    let inst = null;
    let selector = null;
    let element = null;
    let error = null;
    after((done) => {
      if (!inst) {
        done();
        return;
      }
      inst.shutdown(done);
    });
    describe('on component loading', () => {
      it('should be possible to load', done => loader.load('polymer/test-element2', (err, instance) => {
        if (err) { return done(err); }
        chai.expect(instance).to.be.an('object');
        inst = instance;
        inst.start(done);
      }));
    });
    describe('on instantiation', () => {
      before(() => {
        selector = noflo.internalSocket.createSocket();
        inst.inPorts.selector.attach(selector);
      });
      beforeEach(() => {
        element = noflo.internalSocket.createSocket();
        inst.outPorts.element.attach(element);
        error = noflo.internalSocket.createSocket();
        inst.outPorts.error.attach(error);
      });
      afterEach(() => {
        inst.outPorts.element.detach(element);
        inst.outPorts.error.detach(error);
      });
      it('should fail if the element doesn\'t exist', (done) => {
        error.on('data', (err) => {
          chai.expect(err).to.be.an('error');
          chai.expect(err.message).to.contain('No element matching');
          done();
        });
        element.on('data', () => {
          done(new Error('Received unexpected data'));
        });
        selector.send('#element-not-found');
      });
      it('should fail to bind to a wrong element', (done) => {
        const el = document.createElement('test-element');
        el.id = 'wrong-tagname';
        document.querySelector('#fixtures').appendChild(el);
        error.on('data', (err) => {
          chai.expect(err).to.be.an('error');
          chai.expect(err.message).to.contain('element instead of TEST-ELEMENT2');
          done();
        });
        element.on('data', () => {
          done(new Error('Received unexpected data'));
        });
        selector.send('#wrong-tagname');
      });
      it('should send the element out', (done) => {
        const el = document.createElement('test-element2');
        el.id = 'selector-test';
        document.querySelector('#fixtures').appendChild(el);
        error.on('data', done);
        element.on('data', (boundElement) => {
          chai.expect(boundElement).to.equal(el);
          chai.expect(boundElement).to.equal(inst.element);
          done();
        });
        selector.send('#selector-test');
      });
      it('should fail to re-bind to a different element', (done) => {
        const el = document.createElement('test-element2');
        el.id = 'selector-test2';
        document.querySelector('#fixtures').appendChild(el);
        error.on('data', (err) => {
          chai.expect(err).to.be.an('error');
          chai.expect(err.message).to.contain('already bound');
          done();
        });
        element.on('data', () => {
          done(new Error('Received unexpected data'));
        });
        selector.send('#selector-test2');
      });
    });
  });
  describe('component events when bound via selector', () => {
    let inst = null;
    let selector = null;
    let element = null;
    let error = null;
    after((done) => {
      if (!inst) {
        done();
        return;
      }
      inst.shutdown(done);
    });
    describe('on component loading', () => {
      it('should be possible to load', done => loader.load('polymer/test-element2', (err, instance) => {
        if (err) { return done(err); }
        chai.expect(instance).to.be.an('object');
        inst = instance;
        inst.start(done);
      }));
    });
    describe('on instantiation', () => {
      before(() => {
        selector = noflo.internalSocket.createSocket();
        inst.inPorts.selector.attach(selector);
      });
      beforeEach(() => {
        element = noflo.internalSocket.createSocket();
        inst.outPorts.element.attach(element);
        error = noflo.internalSocket.createSocket();
        inst.outPorts.error.attach(error);
      });
      afterEach(() => {
        inst.outPorts.element.detach(element);
        inst.outPorts.error.detach(error);
      });
      it('should fire noflo:ready when bound', (done) => {
        const el = document.createElement('test-element2');
        el.id = 'selector-test-event';
        document.querySelector('#fixtures').appendChild(el);
        error.on('data', done);
        el.addEventListener('noflo:ready', (event) => {
          chai.expect(event.detail).to.equal(true);
          done();
        }, false);
        selector.send('#selector-test-event');
      });
    });
  });
});
