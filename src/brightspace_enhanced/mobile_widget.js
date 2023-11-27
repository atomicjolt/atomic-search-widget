import styles from '../brightspace_common/styles.scss';
import { COURSE } from './org_types';
import { SEARCH_SVG, htmlToElement } from '../common/html';
import { SEARCH_EVENT } from './widget_common';

function widgetHtml(orgType) {
  const placeholderText = orgType === COURSE ? 'Search this course' : 'Search my courses';

  return `
    <div class="mobile-widget">
      <form class="form u-margin" role="search">
        <label for="atomic-search-text" class="hidden">Search</label>
        <input type="text" name="query" placeholder="${placeholderText}" id="atomic-search-text" aria-describedby="powered-by" />
        <p id="powered-by">Powered by <span>Atomic <b>Search</b></span></p>
        <button type="submit" aria-label="submit search">
          ${SEARCH_SVG}
        </button>
      </form>
    </div>
  `;
}

function closeMobileMenu() {
  document.querySelector('.d2l-navigation-s-mobile-menu-mask').click();
}

class MobileWidget extends HTMLElement {
  get widgetEl() {
    return this.shadowRoot.querySelector('.widget');
  }

  toggleOpen() {
    this.widgetEl.classList.toggle('is-open');
  }

  close() {
    this.widgetEl.classList.remove('is-open');
  }

  connectedCallback() {
    const { orgType } = this.dataset;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.append(style, htmlToElement(widgetHtml(orgType)));

    shadow.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const searchText = shadow.querySelector('input').value;
      this.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { searchText } }));
      closeMobileMenu();
    });
  }
}

export const MOBILE_WIDGET_NAME = 'atomic-search-enhanced-mobile-widget';

export function registerMobileWidget() {
  customElements.define(MOBILE_WIDGET_NAME, MobileWidget);
}
