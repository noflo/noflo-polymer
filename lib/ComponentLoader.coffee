PolymerComponent = require './PolymerComponent'

registerComponent = (loader, binding) ->
  name = binding.getAttribute 'name'
  inPortsAttr = binding.getAttribute 'inports'
  inPorts = []
  inPorts = inPortsAttr.split ' ' if inPortsAttr
  outPortsAttr = binding.getAttribute 'outports'
  outPorts = []
  outPorts = outPortsAttr.split ' ' if outPortsAttr
  bound = PolymerComponent name, inPorts, outPorts
  loader.registerComponent 'polymer', name, bound

module.exports = (loader) ->
  bindings = document.querySelectorAll 'noflo-polymer'
  for binding in bindings
    registerComponent loader, binding
