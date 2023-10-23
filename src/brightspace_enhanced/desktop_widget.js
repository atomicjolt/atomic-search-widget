import styles from './styles.scss';
import { CLOSE_SVG, htmlToElement, SEARCH_SVG } from '../common/html';
import { COURSE } from './org_types';
import { SEARCH_EVENT } from './widget_common';

function widgetHtml(orgType) {
  const placeholderText = orgType === COURSE ? 'Search this course' : 'Search my courses';
  return `
    <div class="desktop-widget">
      <form class="form" role="search">
        <label for="atomic-search-text" class="hidden">Search</label>
        <input type="text" name="query" placeholder="${placeholderText}" id="atomic-search-text" />
        <button type="submit" aria-label="submit search">
          ${SEARCH_SVG}
        </button>
      </form>
      <button class="toggle-button"
        aria-label="toggle search"
        aria-haspopup="true"
        aria-expanded="false"
      >${SEARCH_SVG}${CLOSE_SVG}</button>
    <div>
  `;
}

class DesktopWidget extends HTMLElement {
  get widgetEl() {
    return this.shadowRoot.querySelector('.desktop-widget');
  }

  get toggleButtonEl() {
    return this.shadowRoot.querySelector('.toggle-button');
  }

  get inputEl() {
    return this.shadowRoot.querySelector('input');
  }

  toggleOpen() {
    if (this.widgetEl.classList.contains('is-open')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.widgetEl.classList.add('is-open');
    this.toggleButtonEl.setAttribute('aria-expanded', 'true');
    // It can't be focused immediately because the element is still hidden I guess
    setTimeout(() => {
      this.inputEl.focus();
    }, 50);
  }

  close() {
    this.widgetEl.classList.remove('is-open');
    this.toggleButtonEl.setAttribute('aria-expanded', 'false');
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

    this.toggleButtonEl.addEventListener('click', this.toggleOpen.bind(this));
  }
}

export const DESKTOP_WIDGET_NAME = 'atomic-search-enhanced-desktop-widget';

export function registerDesktopWidget() {
  customElements.define(DESKTOP_WIDGET_NAME, DesktopWidget);
}
