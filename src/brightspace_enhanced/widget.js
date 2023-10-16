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
    const { orgType } = this.dataset;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.append(style, htmlToElement(widgetHtml(orgType)));

    shadow.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const searchText = shadow.querySelector('input').value;
      this.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { searchText } }));
      this.close();
    });

    shadow.querySelector('.icon').addEventListener('click', this.toggleOpen.bind(this));
  }
}

export const WIDGET_ELEMENT_NAME = 'atomic-search-enhanced-widget';

export function registerWidget() {
  customElements.define(WIDGET_ELEMENT_NAME, Widget);
}
