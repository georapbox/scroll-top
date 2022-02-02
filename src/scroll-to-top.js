const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host {
      all: initial;
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      width: 1px;
    }

    :host button {
      position: fixed;
      bottom: 16px;
      right: 16px;
      opacity: 0;
      visibility: hidden;
      cursor: pointer;
    }

    :host([visible]) button {
      opacity: 1;
      visibility: visible;
    }
  </style>

  <div class="container" part="container">
    <button part="button"><slot>Scroll to Top</slot></button>
  </div>
`;

window.customElements.define('scroll-to-top', class ScrollToTop extends HTMLElement {
  constructor() {
    super();

    this.observer = null;
    this.$container = null;
    this.$button = null;

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.appendChild(template.content.cloneNode(true));
  }

  get visibleAfter() {
    return this.getAttribute('visible-after') || '50vh';
  }

  set visibleAfter(value) {
    if (typeof value !== 'string') {
      return;
    }
    this.setAttribute('visible-after', value);
  }

  get visible() {
    return this.getAttribute('visible') !== null;
  }

  set visible(value) {
    if (value) {
      this.setAttribute('visible', '');
    } else {
      this.removeAttribute('visible');
    }
  }

  onClick() {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  setContainerHeight(value) {
    if (typeof value === 'string' && this.$container) {
      this.$container.style.height = value;
    }
  }

  connectedCallback() {
    this.$container = this.shadowRoot.querySelector('div');
    this.$button = this.shadowRoot.querySelector('button');

    this.setContainerHeight(this.visibleAfter);

    try {
      this.observer = new IntersectionObserver(([entry]) => {
        this.visible = !entry.isIntersecting;
      });

      this.observer.observe(this.$container);
    } catch (err) {
      console.error(err);
    }

    this.$button.addEventListener('click', this.onClick);
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.$button.removeEventListener('click', this.onClick);
  }

  attributeChangedCallback(name, _, newValue) {
    if (name === 'visible-after') {
      this.setContainerHeight(newValue);
    }
  }

  static get observedAttributes() {
    return ['visible-after'];
  }
});
