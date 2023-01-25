import {
  SEARCH_SVG,
  initWidget,
  BaseWidget,
  registerWidget,
  getEquellaDomData
} from './widget_common';
function html(cssClass, placeholder) {
  const { dropdownHtml, searchButtonClass } = getEquellaDomData()

  return `<div class="ajas-search-widget ${cssClass}">
      <form id="ajas-search-form" class="ajas-search-widget__form" action="javascript:void(0);" method="get" role="search">
        <label for="ajas-search01" class="ajas-search-widget-hidden">Search</label>
        <input type="text" placeholder="${placeholder}" id="ajas-search01" />
        <button type="submit" aria-label="submit search" class="ajas-search-widget__btn--search ${searchButtonClass}" type="submit">
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
