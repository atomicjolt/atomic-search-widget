import { htmlToElement } from '../common/html';
import listenToPostMessages from './events';
import styles from './modal.scss';

function modalHTML(frameSrc: string) {
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

type ModalData = {
  frameSrc: string;
  query: string;
}

class Modal extends HTMLElement {
  connectedCallback() {
    const { frameSrc, query } = this.dataset as ModalData;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.append(style, htmlToElement(modalHTML(frameSrc)));

    const onMessage = (e: MessageEvent) => listenToPostMessages(e, query);

    window.addEventListener('message', onMessage);

    shadow.querySelector('button')!.addEventListener('click', (e) => {
      e.preventDefault();
      window.removeEventListener('message', onMessage);
      this.remove();
    });
  }
}

export default function registerModal(name: string) {
  customElements.define(name, Modal);
}
