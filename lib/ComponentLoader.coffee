PolymerComponent = require './PolymerComponent'

registerComponent = (loader, binding) ->
  name = binding.getAttribute 'name'
  inPorts = binding.getAttribute('inports').split ' '
  outPorts = binding.getAttribute('outports').split ' '
  bound = PolymerComponent name, inPorts, outPorts
  loader.registerComponent 'polymer', name, bound

module.exports = (loader) ->
  bindings = document.querySelectorAll 'noflo-polymer'
  for binding in bindings
    registerComponent loader, binding
