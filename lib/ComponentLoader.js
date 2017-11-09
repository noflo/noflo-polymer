const PolymerComponent = require('./PolymerComponent');

const registerComponent = (loader, binding) => {
  const name = binding.getAttribute('name');
  const inPortsAttr = binding.getAttribute('inports');
  let inPorts = [];
  if (inPortsAttr) { inPorts = inPortsAttr.split(' '); }
  const outPortsAttr = binding.getAttribute('outports');
  let outPorts = [];
  if (outPortsAttr) { outPorts = outPortsAttr.split(' '); }
  const bound = PolymerComponent(name, inPorts, outPorts);
  return loader.registerComponent('polymer', name, bound);
};

module.exports = (loader, callback) => {
  const bindings = document.querySelectorAll('noflo-polymer');
  [].forEach.call(bindings, (binding) => {
    registerComponent(loader, binding);
  });
  return callback(null);
};
