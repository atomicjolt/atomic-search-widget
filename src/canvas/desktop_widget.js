import {
  initWidget,
  BaseWidget,
  registerWidget,
  getEquellaDomData
} from './widget_common';
import { SEARCH_SVG } from '../common/html';

function html(cssClass, placeholder) {
  const { dropdownHtml, equellaClass } = getEquellaDomData();

  return `<div class="ajas-search-widget ${cssClass} ${equellaClass}">
      <form id="ajas-search-form" class="ajas-search-widget__form" action="javascript:void(0);" method="get" role="search">
        <label for="ajas-search01" class="ajas-search-widget-hidden">Search</label>
        <input type="text" placeholder="${placeholder}" id="ajas-search01" aria-describedby="powered-by" />
        <p id="powered-by">Powered by <span>Atomic Search</span></p>
        <div class="ajas-search-widget__btn-group">
          <button type="submit" aria-label="submit search" class="ajas-search-widget__btn--search">
            ${SEARCH_SVG}
          </button>
          ${dropdownHtml}
        </div>
      </form>
    </div>`;
}

export default class AtomicSearchDesktopWidget extends BaseWidget {
  _onConnect() {
    const { cssClass, placeholder } = this.dataset;
    const htmlText = html(cssClass, placeholder);

    initWidget(this, htmlText);
  }
}

registerWidget('atomic-search-desktop-widget', AtomicSearchDesktopWidget);
