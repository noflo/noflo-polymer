const noflo = require('noflo');

const bindAllEvents = (element, port, outports) => {
  const originalFire = element.fire.bind(element);
  const el = element;
  el.fire = (event, detail, toNode) => {
    if (Array.from(outports).includes(event)) {
      // If an event has a dedicated port, then it should not be bound here
      originalFire(event, detail, toNode);
      return;
    }
    if (event.indexOf('-changed') !== -1) {
      // Polymer 1.x fires an event for each changed property. Ignore these
      originalFire(event, detail, toNode);
      return;
    }
    const groups = event.split(':');
    groups.forEach((grp) => {
      port.beginGroup(grp);
    });
    const value = detail.value ? detail.value : detail;
    port.send(value);
    groups.forEach(() => {
      port.endGroup();
    });
    originalFire(event, detail, toNode);
  };
};

const setUp = (component, outports) => {
  outports.forEach((outport) => {
    if (outport === 'element') { return; }
    if (outport === 'event') {
      // Fluxified event binding
      bindAllEvents(component.element, component.outPorts.event, outports);
      return;
    }
    const handler = component.eventHandlers[outport];
    component.element.addEventListener(outport, handler, false);
  });
  if (component.outPorts.element.isAttached()) {
    component.outPorts.element.send(component.element);
    component.outPorts.element.disconnect();
  }
  component.element.fire('noflo:ready');
};

module.exports = (name, inports, outports) => {
  const factory = () => {
    const c = new noflo.Component();
    c.element = null;
    c.eventHandlers = {};
    c.inPorts.add('selector', {
      datatype: 'string',
      description: 'DOM selector for getting the element',
    });
    c.inPorts.add('element', {
      datatype: 'object',
      description: 'Existing Polymer element instance',
    });
    c.inPorts.add('event', {
      datatype: 'string',
      description: 'Fire an event on polymer element',
    });
    c.outPorts.add('element', {
      datatype: 'object',
    });
    c.outPorts.add('error', {
      datatype: 'object',
    });

    inports.forEach((inport) => {
      // Add exposed inports
      c.inPorts.add(inport, {
        datatype: 'all',
      });
      c.inPorts[inport].on('connect', () => {
        if (Array.isArray(c.element[inport])) {
          return;
        }
        // Only clear the array on first connect
        let connected = 0;
        c.inPorts[inport].listAttached().forEach((socket) => {
          if (socket.isConnected()) {
            connected += 1;
          }
        });
        if (connected !== 1) {
          return;
        }
        c.element[inport].splice(0, c.element[inport].length);
      });
      c.inPorts[inport].on('data', (data) => {
        if (typeof c.element[inport] === 'function') {
          // Port handler is a function, call it with the given value
          c.element[inport](data);
          return;
        }
        if (Array.isArray(c.element[inport])) {
          if (Array.isArray(data)) {
            c.element[inport] = data;
            return;
          }
          c.element[inport].push(data);
          return;
        }
        c.element[inport] = data;
      });
    });

    outports.forEach((outport) => {
      // Add exposed outport
      c.outPorts.add(outport, {
        datatype: 'all',
      });
      c.eventHandlers[outport] = (event) => {
        // Register event handler for the outport event
        if (!c.outPorts[outport].isAttached()) { return; }
        c.outPorts[outport].send(event.detail);
      };
    });

    // Bind instance to a received query selector result
    c.inPorts.selector.on('data', (selector) => {
      c.element = document.querySelector(selector);
      if (!c.element) {
        c.error(`No element matching '${selector}' found`);
        return;
      }
      setUp(c, outports);
    });
    c.inPorts.element.on('data', (element) => {
      c.element = element;
      if (!c.element) {
        c.error('No element provided');
        return;
      }
      setUp(c, outports);
    });
    c.inPorts.event.on('data', (event) => {
      if (!c.element) {
        return;
      }
      c.element.fire(event);
    });

    c.tearDown = (callback) => {
      outports.forEach((outport) => {
        if (name === 'element') { return; }
        c.element.removeEventListener(outport, c.eventHandlers[outport], false);
        c.outPorts[outport].disconnect();
      });
      c.element = null;
      callback();
    };

    return c;
  };
  return factory;
};
