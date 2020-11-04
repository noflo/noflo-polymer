import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

class NofloPolymer extends PolymerElement {
  static get properties() {
    return {
      element: {
        type: String,
      },
      inports: {
        type: String,
      },
      outports: {
        type: String,
      },
    };
  }
}

customElements.define('noflo-polymer', NofloPolymer);
