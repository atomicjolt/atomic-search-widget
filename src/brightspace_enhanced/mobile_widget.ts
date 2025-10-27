import styles from '../brightspace_common/styles.scss';
import { COURSE, ORG_TYPE } from './org_types';
import { SEARCH_SVG, htmlToElement } from '../common/html';
import { SEARCH_EVENT } from './widget_common';
import t from '../brightspace_common/i18n/translate';

function widgetHtml(orgType: ORG_TYPE, showBranding: boolean) {
  const placeholderText =
    orgType === COURSE ? t('Search this course') : t('Search my courses');

  const brandingClass = showBranding ? '' : 'no-branding';
  return `
    <div class="mobile-widget ${brandingClass}">
      <form class="form u-margin" role="search">
        <label for="atomic-search-text" class="hidden">${t('Search')}</label>
        <input type="text" name="query" placeholder="${placeholderText}" id="atomic-search-text" aria-describedby="powered-by" />
        <p id="powered-by">${t('Powered by <span>Atomic Search</span>')}</p>
        <button type="submit" aria-label="submit search">
          ${SEARCH_SVG}
        </button>
      </form>
    </div>
  `;
}

function closeMobileMenu() {
  document.querySelector<HTMLElement>('.d2l-navigation-s-mobile-menu-mask')!.click();
}

type WidgetDataset = {
  orgType: ORG_TYPE;
  showBranding: 'on' | 'off';
}

export class MobileWidget extends HTMLElement {
  props!: WidgetDataset;

  get widgetEl() {
    return this.shadowRoot!.querySelector('.widget')!;
  }

  toggleOpen() {
    this.widgetEl.classList.toggle('is-open');
  }

  close() {
    this.widgetEl.classList.remove('is-open');
  }

  connectedCallback() {
    const { orgType, showBranding } = this.props;

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.append(
      style,
      htmlToElement(widgetHtml(orgType, showBranding === 'on')),
    );

    shadow.querySelector('form')!.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchText = shadow.querySelector('input')!.value;
      this.dispatchEvent(
        new CustomEvent(SEARCH_EVENT, { detail: { searchText } }),
      );
      closeMobileMenu();
    });
  }
}

export const MOBILE_WIDGET_NAME = 'atomic-search-enhanced-mobile-widget';
customElements.define(MOBILE_WIDGET_NAME, MobileWidget);

export function createMobileWidget(props: WidgetDataset) {
  const widget = document.createElement(MOBILE_WIDGET_NAME) as MobileWidget;
  widget.props = props;
  return widget;
}

