import { htmlToElement } from '../common/html';
import listenToPostMessages from './events';
import styles from './modal.scss';

function modalHTML(frameSrc) {
  return `
<div class="background">
  <div class="modal">
    <header>
      <h2>Atomic Search</h2>
      <button class="close">&times;</button>
    </header>
    <iframe
      src="${frameSrc}"
      frameborder="0"
    >
    </iframe>
  </div>
</div>
`;
}

class Modal extends HTMLElement {
  connectedCallback() {
    const { frameSrc, query } = this.dataset;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.append(style, htmlToElement(modalHTML(frameSrc)));

    const onMessage = e => listenToPostMessages(e, query);

    window.addEventListener('message', onMessage);

    shadow.querySelector('button').addEventListener('click', e => {
      e.preventDefault();
      window.removeEventListener('message', onMessage);
      this.remove();
    });
  }
}

export default function registerModal(name) {
  customElements.define(name, Modal);
}
