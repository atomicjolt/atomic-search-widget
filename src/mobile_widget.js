import { initWidget, SEARCH_SVG } from './widget_common';

function html(placeholder) {
  return `<div class="ajas-search-widget ajas-search-widget--small">
    <button class="ajas-search-toggle" type="button" aria-label="toggle search">${SEARCH_SVG}</button>
    <form class="ajas-search-widget__form" action="javascript:void(0);" method="get" role="search">
      <label for="ajas-search02" class="ajas-search-widget-hidden">Search</label>
      <input type="text" placeholder="${placeholder}" id="ajas-search02" />
      <button aria-label="submit search" class="ajas-search-widget__btn--search" type="submit">
        ${SEARCH_SVG}
      </button>
    </form>
  </div>`;
}

export default class AtomicSearchMobileWidget extends HTMLElement {
  connectedCallback() {
    const { placeholder } = this.dataset;
    const htmlText = html(placeholder);

    initWidget(this, htmlText);
  }
}

customElements.define('atomic-search-mobile-widget', AtomicSearchMobileWidget);
