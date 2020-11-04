# noflo-polymer

This project provides a binding between [Polymer](http://www.polymer-project.org/) web components and [NoFlo](http://noflojs.org/), allowing Polymer components to be used as components in a NoFlo graph. The attributes of a Polymer element become the input ports of the NoFlo component, and the events emitted by the Polymer element become the output ports.

## Status

In production with [noflo-ui](https://github.com/noflo/noflo-ui)

## Installation

Add this component to your dependencies:

```bash
$ npm install noflo-polymer --save
```

In addit you need a working setup of Polymer and NoFlo.

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

## Changes

* 2.0.1 (November 10 2017)
  - Made noflo-polymer not import `polymer.html` since paths may be different in production use. Consumers must import it themselves
  - Added a `true` payload to the `noflo:ready` event emitted when a Polymer element is bound to a NoFlo component instance
* 2.0.0 (November 10 2017)
  - Ported components from CoffeeScript to ES6
  - Upgraded Polymer from 1.x to 2.x
