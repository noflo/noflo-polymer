const noflo = require('noflo');

module.exports = (name, inports, outports) => {
  const factory = () => {
    const c = new noflo.Component();
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
      // Add inports declared via element attributes
      c.inPorts.add(inport, {
        datatype: 'all',
      });
    });

    outports.forEach((outport) => {
      // Add outports declared via element attributes
      c.outPorts.add(outport, {
        datatype: 'all',
      });
    });

    c.setUp = (callback) => {
      c.element = null;
      c.ctx = null;
      c.eventHandlers = {};
      callback();
    };
    c.tearDown = (callback) => {
      if (c.element) {
        // Detach outport event listeners
        outports.forEach((outport) => {
          if (name === 'element') {
            return;
          }
          if (!c.eventHandlers[outport]) {
            return;
          }
          c.element.removeEventListener(outport, c.eventHandlers[outport], false);
        });
        // Restore the original Polymer fire method
        if (c.originalFire) {
          c.element.fire = c.originalFire;
          delete c.originalFire;
        }
        // Clear state
        c.element = null;
        c.eventHandlers = {};
      }
      if (c.ctx) {
        c.ctx.deactivate();
        c.ctx = null;
      }
      callback();
    };

    c.bindToElement = (element, output, context) => {
      if (typeof element !== 'object') {
        output.done(new Error(`${c.nodeId} received an element that is not an object`));
        return;
      }
      if (element.tagName !== name.toUpperCase()) {
        output.done(new Error(`${c.nodeId} received a ${element.tagName} element instead of ${name.toUpperCase()}`));
        return;
      }
      if (c.element) {
        output.done(new Error(`${c.nodeId} is already bound to an element. Rebinding not allowed`));
        return;
      }

      c.element = element;
      c.ctx = context;
      output.send({
        element,
      });

      // Bind outports to events
      outports.forEach((outport) => {
        if (outport === 'element') {
          return;
        }

        if (outport === 'event') {
          // The catch-all port for fluxified events. Override original fire method
          c.originalFire = element.fire.bind(element);
          const el = element;
          el.fire = (event, detail, toNode) => {
            if (outports.indexOf(event) !== -1) {
              // If an event has a dedicated port, then it should not be bound here
              c.originalFire(event, detail, toNode);
              return;
            }
            if (event.indexOf('-changed') !== -1) {
              // Polymer 1.x fires an event for each changed property. Ignore these
              c.originalFire(event, detail, toNode);
              return;
            }
            const value = (detail && detail.value) ? detail.value : detail;
            output.send({
              event: {
                action: event,
                payload: value,
              },
            });
            c.originalFire(event, detail, toNode);
          };
          return;
        }
        // Direct event-to-outport mapping
        c.eventHandlers[outport] = (event) => {
          // Register event handler for the outport event
          const message = {};
          message[outport] = event.detail;
          output.send(message);
        };
        element.addEventListener(outport, c.eventHandlers[outport], false);
      });

      c.element.fire('noflo:ready', true);
    };

    c.process((input, output, context) => {
      if (input.hasData('element')) {
        // Received an element instance, set up bindings
        const element = input.getData('element');
        c.bindToElement(element, output, context);
        return;
      }
      if (input.hasData('selector')) {
        // Received a query selector. Find element and bind
        const selector = input.getData('selector');
        const element = document.querySelector(selector);
        if (!element) {
          output.done(new Error(`No element matching '${selector}' found`));
          return;
        }
        c.bindToElement(element, output, context);
        return;
      }
      // Keep other inputs in buffer until we have element bound
      if (!c.element) {
        return;
      }

      // Keep track of whether this context activated
      let activated = false;

      if (input.hasData('event')) {
        // Fire an event on the element
        activated = true;
        const event = input.getData('event');
        c.element.fire(input.getData(event));
      }

      // Check for data on each inPort
      inports.forEach((inport) => {
        if (!input.hasData(inport)) {
          return;
        }
        if (typeof c.element[inport] === 'function') {
          // Property bound to inport is a function, call it with data
          activated = true;
          c.element[inport](input.getData(inport));
          return;
        }
        if (Array.isArray(c.element[inport])) {
          // Property bound to inport is an array, work with streams
          if (!input.hasStream(inport)) {
            return;
          }
          activated = true;
          const packets = input.getStream(inport).filter(ip => ip.type === 'data').map(ip => ip.data);
          c.element[inport] = packets;
          return;
        }
        activated = true;
        c.element[inport] = input.getData(inport);
      });

      if (!activated) {
        return;
      }
      output.done();
    });

    return c;
  };
  return factory;
};
