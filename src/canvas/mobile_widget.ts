import {
  initWidget,
  BaseWidget,
  registerWidget,
  getEquellaDomData,
} from './widget_common';
import { CLOSE_SVG, SEARCH_SVG } from '../common/html';

function html(placeholder: string) {
  const { dropdownHtml, equellaClass } = getEquellaDomData();

  return `<div class="ajas-search-widget ajas-search-widget--small ${equellaClass}">
    <button class="ajas-search-toggle" type="button" aria-label="toggle search">
      ${SEARCH_SVG}
      ${CLOSE_SVG}
    </button>
    <form class="ajas-search-widget__form" action="javascript:void(0);" method="get" role="search">
      <label for="ajas-search02" class="ajas-search-widget-hidden">Search</label>
      <input type="text" placeholder="${placeholder}" id="ajas-search02" aria-describedby="powered-by" />
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

export default class AtomicSearchMobileWidget extends BaseWidget {
  _onConnect() {
    const { placeholder } = this.dataset;
    const htmlText = html(placeholder!);

    initWidget(this, htmlText);

    const toggleBtn = this.shadowRoot!.querySelector('.ajas-search-toggle')!;
    const wrapper = this.shadowRoot!.querySelector('.ajas-search-widget--small')!;

    toggleBtn.addEventListener('click', () => {
      wrapper.classList.toggle('is-active');
    });
  }
}

registerWidget('atomic-search-mobile-widget', AtomicSearchMobileWidget);
