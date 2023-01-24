import {
  SEARCH_SVG,
  initWidget,
  BaseWidget,
  registerWidget,
  CARET_SVG,
} from './widget_common';
import atomicSearchConfig from './config'

function html(cssClass, placeholder) {
  const dropdownHtml = atomicSearchConfig.hasEquella ? `
    <button id="menu-target" type="button" aria-label="open dropdown" class="ajas-search-widget__btn--caret">
      ${CARET_SVG}
    </button>
    <div id="menu-overlay" class="ajas-search-widget__overlay hidden"></div>
    <div id="menu-dropdown" class="ajas-search-widget__dropdown hidden">
      <button type="button">Search openEquella content</button>
    </div>
  ` : ''

  return `<div class="ajas-search-widget ${cssClass}">
      <form id="ajas-search-form" class="ajas-search-widget__form" action="javascript:void(0);" method="get" role="search">
        <label for="ajas-search01" class="ajas-search-widget-hidden">Search</label>
        <input type="text" placeholder="${placeholder}" id="ajas-search01" />
        <button type="submit" aria-label="submit search" class="ajas-search-widget__btn--search ${atomicSearchConfig.hasEquella ? 'ajas-search-widget__btn--search--equella' : ''}" type="submit">
          ${SEARCH_SVG}
        </button>
        ${dropdownHtml}
      </form>
    </div>`;
}

export default class AtomicSearchDesktopWidget extends BaseWidget {
  connectedCallback() {
    const { cssClass, placeholder } = this.dataset;
    const htmlText = html(cssClass, placeholder);

    initWidget(this, htmlText);
  }
}

registerWidget('atomic-search-desktop-widget', AtomicSearchDesktopWidget);
