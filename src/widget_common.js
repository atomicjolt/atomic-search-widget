import styles from '../styles/styles.scss';

const SEARCH_EVENT = 'ATOMIC_SEARCH';

const SEARCH_SVG = `<svg class="ajas-search-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="-515 337 48 48" enable-background="new -515 337 48 48">
    <path d="M-484,365h-1.6l-0.5-0.5c2-2.3,3.1-5.2,3.1-8.5c0-7.2-5.8-13-13-13s-13,5.8-13,13s5.8,13,13,13c3.2,0,6.2-1.2,8.5-3.1 l0.5,0.5v1.6l10,10l3-3L-484,365z M-496,365c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S-491,365-496,365z"/>
    <path fill="none" d="M-515,337h48v48h-48V337z" />
  </svg>`;

const CLOSE_SVG = `<svg class="ajas-close-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z"/>
    <path d="M0 0h48v48H0z" fill="none"/>
  </svg>`;

export {
  SEARCH_SVG,
  CLOSE_SVG,
  SEARCH_EVENT,
};

export function htmlToElement(htmlText) {
  const template = document.createElement('template');
  template.innerHTML = htmlText.trim();
  return template.content.firstChild;
}

export function initWidget(widget, htmlText) {
  const shadow = widget.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = styles;

  shadow.append(style, htmlToElement(htmlText));

  shadow.querySelector('form').addEventListener('submit', () => {
    const searchText = shadow.querySelector('input').value;
    widget.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { searchText } }));
  });
}

export class BaseWidget extends HTMLElement {
  updateSearchText(newText) {
    this.shadowRoot.querySelector('input').value = newText;
  }
}
