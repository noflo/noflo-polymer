import { PolymerElement } from '../../node_modules/@polymer/polymer/polymer-element.js';

class TestElement extends PolymerElement {
  static get properties() {
    return {
      first: {
        type: String,
        observer: 'firstChanged',
      },
      second: {
        type: String,
        observer: 'secondChanged',
      },
    };
  }

  firstChanged() {
    this.count();
  }

  secondChanged() {
    this.count();
  }

  count() {
    if (this.first === null || this.second === null) {
      return;
    }
    this.dispatchEvent(new CustomEvent('result', {
      detail: this.first + this.second,
    }));
  }
}

customElements.define('test-element', TestElement);
