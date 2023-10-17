import styles from './styles.scss';
import { htmlToElement, SEARCH_SVG } from '../common/html';
import { COURSE } from './org_types';
import { SEARCH_EVENT } from './widget_common';

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

class DesktopWidget extends HTMLElement {
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

    const icon = shadow.querySelector('.icon');
    icon.addEventListener('click', this.toggleOpen.bind(this));
  }
}

export const DESKTOP_WIDGET_NAME = 'atomic-search-enhanced-desktop-widget';

export function registerDesktopWidget() {
  customElements.define(DESKTOP_WIDGET_NAME, DesktopWidget);
}
