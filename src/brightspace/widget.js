import styles from '../brightspace_common/styles.scss';

import { htmlToElement, NEW_SVG } from '../common/html';

function widgetHtml(placeholderText) {
  return `
    <div class="mobile-widget">
      <form class="form" role="search">
        <label for="atomic-search-text" class="hidden">Search</label>
        <input type="text" name="query" placeholder="${placeholderText}" aria-describedby="powered-by" />
        <p id="powered-by">Powered by <span>Atomic <b>Search</b></span></p>
        <div class="button">
          <button type="submit" aria-label="submit search">
            ${NEW_SVG}
          </button>
        </div>
      </form>
    </div>
  `;
}

export const SEARCH_EVENT = 'ATOMIC_SEARCH';

class Widget extends HTMLElement {
  connectedCallback() {
    const { placeholderText } = this.dataset;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.append(style, htmlToElement(widgetHtml(placeholderText)));

    shadow.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const searchText = shadow.querySelector('input').value;
      this.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { searchText } }));
    });
  }
}

export function registerWidget() {
  customElements.define('atomic-search-widget', Widget);
}
