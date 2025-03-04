import t from '../brightspace_common/i18n/translate';
import styles from '../brightspace_common/styles.scss';

import { htmlToElement, SEARCH_SVG } from '../common/html';

function widgetHtml(placeholderText, showBranding) {
  const brandingClass = showBranding ? '' : 'no-branding';
  return `
    <div class="mobile-widget ${brandingClass}">
      <form class="form" role="search">
        <label for="atomic-search-text" class="hidden">${t('Search')}</label>
        <input type="text" name="query" placeholder="${placeholderText}" aria-describedby="powered-by" />
        <p id="powered-by">${t('Powered by <span>Atomic Search</span>')}</p>
        <div class="button">
          <button type="submit" aria-label="submit search">
            ${SEARCH_SVG}
          </button>
        </div>
      </form>
    </div>
  `;
}

export const SEARCH_EVENT = 'ATOMIC_SEARCH';

class Widget extends HTMLElement {
  connectedCallback() {
    const { placeholderText, showBranding } = this.dataset;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.append(
      style,
      htmlToElement(widgetHtml(placeholderText, showBranding === 'on')),
    );

    shadow.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const searchText = shadow.querySelector('input').value;
      this.dispatchEvent(
        new CustomEvent(SEARCH_EVENT, { detail: { searchText } }),
      );
    });
  }
}

export function registerWidget() {
  customElements.define('atomic-search-widget', Widget);
}
