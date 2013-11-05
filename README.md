# noflo-polymer [![Build Status](https://secure.travis-ci.org/noflo/noflo-polymer.png?branch=master)](http://travis-ci.org/noflo/noflo-polymer)

This project provides a binding between [Polymer](http://www.polymer-project.org/) web components and [NoFlo](http://noflojs.org/), allowing Polymer components to be used as components in a NoFlo graph. The attributes of a Polymer element become the input ports of the NoFlo component, and the events emitted by the Polymer element become the output ports.

## Installation

Add this component to your dependencies in `component.json`. In additionally you need a working installation of Polymer.

## Usage

Since Polymer elements [don't support introspection yet](https://github.com/Polymer/polymer/issues/336), you need to utilize the `noflo-polymer` custom element for informing NoFlo of the attributes and events of your custom elements.

For example:

```html
<noflo-polymer name="the-graph" inports="graph width height" outports="changed"></noflo-polymer>
```

After this you'll have a `polymer/the-graph` component available with the following ports:

* Input
  - element (for providing an element instance either queried from DOM or as a result of `document.createElement`
  - graph (modifies the graph attribute)
  - width (modifies the width attribute)
  - height (modifies the height attribute)
* Output
  - element (the same element instance, passed through
  - changed (sends output when the element fires a `changed` event)
