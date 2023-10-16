import styles from './styles.scss';
import { htmlToElement, SEARCH_SVG } from '../common/html';
import { COURSE } from './org_types';

function widgetHtml(orgType) {
  const placeholderText = orgType === COURSE ? 'Search this course' : 'Search my courses';
  return `
    <div class="widget">
      <button class="icon">${SEARCH_SVG}</button>
      <form class="form" role="search">
        <label for="atomic-search-text" class="hidden">Search</label>
        <input type="text" name="query" placeholder="${placeholderText}" id="atomic-search-text" />
        <div class="atomic-search-button">
          <button type="submit" aria-label="submit search">
            ${SEARCH_SVG}
          </button>
        </div>
      </form>
    <div>
  `;
}

function mobileHtml(orgType) {
  const placeholderText = orgType === COURSE ? 'Search this course' : 'Search my courses';

  return `
    <form class="form" role="search">
      <label for="atomic-search-text" class="hidden">Search</label>
      <input type="text" name="query" placeholder="${placeholderText}" id="atomic-search-text" />
      <div class="atomic-search-button">
        <button type="submit" aria-label="submit search">
          ${SEARCH_SVG}
        </button>
      </div>
    </form>
  `;
}

export const SEARCH_EVENT = 'ATOMIC_SEARCH';

class Widget extends HTMLElement {
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
    const { orgType, isMobile } = this.dataset;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    const htmlBuilder = isMobile ? mobileHtml : widgetHtml;
    shadow.append(style, htmlToElement(htmlBuilder(orgType)));

    shadow.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const searchText = shadow.querySelector('input').value;
      this.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { searchText } }));

      // TODO make a separate mobile widget?
      if (isMobile) {
        document.querySelector('.d2l-navigation-s-mobile-menu-mask').click();
      } else {
        this.close();
      }
    });

    // TODO make a separate mobile widget?
    const icon = shadow.querySelector('.icon');
    if (icon) {
      icon.addEventListener('click', this.toggleOpen.bind(this));
    }
  }
}

export const WIDGET_ELEMENT_NAME = 'atomic-search-enhanced-widget';

export function registerWidget() {
  customElements.define(WIDGET_ELEMENT_NAME, Widget);
}
