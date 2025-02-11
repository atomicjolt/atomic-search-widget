import t from '../brightspace_common/i18n/translate';
import styles from '../brightspace_common/styles.scss';
import { CLOSE_SVG, htmlToElement, SEARCH_SVG } from '../common/html';
import { COURSE } from './org_types';
import { SEARCH_EVENT } from './widget_common';
import watchWidgetSize from './widget_size_watcher';

function widgetHtml(orgType, showBranding) {
  const placeholderText = orgType === COURSE ? t('Search this course') : t('Search my courses');

  const brandingClass = showBranding ? '' : 'no-branding';
  return `
    <div class="desktop-widget ${brandingClass}">
      <form class="form" role="search">
        <label for="atomic-search-text" class="hidden">${t('Search')}</label>
        <input type="text" name="query" placeholder="${placeholderText}" id="atomic-search-text" aria-describedby="powered-by" />
        <p id="powered-by">${t('Powered by <span>Atomic Search</span>')}</p>
        <button type="submit" aria-label="submit search">
          ${SEARCH_SVG}
        </button>
      </form>
      <div style="position: relative">
        <button class="toggle-button"
          aria-label="toggle search"
          aria-haspopup="true"
          aria-expanded="false"
          aria-describedby="search-tooltip"
        >${SEARCH_SVG}${CLOSE_SVG}</button>
        <p id="search-tooltip" class="tooltip">${t('Explore educational materials throughout all your courses using Atomic Search')}</p>
      </div>
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

  // if there's enough space, we show the form and hide the button
  openPermanently() {
    this.widgetEl.classList.add('is-always-open');
  }

  closePermanently() {
    this.widgetEl.classList.remove('is-always-open');
  }

  connectedCallback() {
    const { orgType, showBranding } = this.dataset;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.append(style, htmlToElement(widgetHtml(orgType, showBranding === 'on')));

    shadow.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const searchText = shadow.querySelector('input').value;
      this.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { searchText } }));

      this.close();
    });

    this.toggleButtonEl.addEventListener('click', this.toggleOpen.bind(this));
    watchWidgetSize(this);
  }
}

export const DESKTOP_WIDGET_NAME = 'atomic-search-enhanced-desktop-widget';

export function registerDesktopWidget() {
  customElements.define(DESKTOP_WIDGET_NAME, DesktopWidget);
}
