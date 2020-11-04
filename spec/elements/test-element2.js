import { PolymerElement } from '../../node_modules/@polymer/polymer/polymer-element.js';

class TestElement2 extends PolymerElement {
  static get properties() {
    return {
      first: {
        type: Number,
        value: 0,
        observer: 'firstChanged',
      },
      second: {
        type: Number,
        value: 0,
        observer: 'secondChanged',
      },
    };
  }

  firstChanged(val) {
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

customElements.define('test-element2', TestElement2);
