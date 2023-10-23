import styles from '../../styles/styles.scss';
import { htmlToElement } from '../common/html';
import atomicSearchConfig from './config';

const SEARCH_EVENT = 'ATOMIC_SEARCH';
const DEFAULT_SEARCH = 'DEFAULT';
const EQUELLA_SEARCH = 'EQUELLA';

const CARET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="9" height="4">
    <g transform="matrix(0.28571433 0 0 0.28571433 0.35714287 -0)">
      <path d="M0.15 0L14.5 14.35L28.85 0L0.15 0" stroke="none" fill="currentFill" fill-rule="nonzero" />
    </g>
  </svg>`;

export {
  CARET_SVG,
  SEARCH_EVENT,
  DEFAULT_SEARCH,
  EQUELLA_SEARCH,
};

export function initWidget(widget, htmlText) {
  const shadow = widget.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = styles;

  shadow.append(style, htmlToElement(htmlText));

  shadow.querySelector('form').addEventListener('submit', e => {
    const searchText = shadow.querySelector('input').value;
    const searchType = e.submitter.value || DEFAULT_SEARCH;
    widget.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { searchText, searchType } }));
  });

  const menuTarget = shadow.getElementById('menu-target');
  const menuOverlay = shadow.getElementById('menu-overlay');
  const menuDropdown = shadow.getElementById('menu-dropdown');

  if (menuTarget && menuOverlay && menuDropdown) {
    menuTarget.addEventListener('click', () => {
      menuOverlay.classList.remove('hidden');
      menuDropdown.classList.remove('hidden');
    });

    [menuOverlay, menuDropdown].forEach(element => {
      element.addEventListener('click', () => {
        menuOverlay.classList.add('hidden');
        menuDropdown.classList.add('hidden');
      });
    });
  }

  // canvas has global keyboard shortcuts. Normally they don't apply when you're
  // in an input, but since this is a shadow DOM their check doesn't work. So we
  // just stop the event from bubbling here.
  shadow.querySelector('input').addEventListener('keydown', e => {
    e.stopPropagation();
  });
}

export class BaseWidget extends HTMLElement {
  updateSearchText(newValue) {
    // undefined will get turned into text, so ignore all falsey values
    const text = newValue || '';
    this.shadowRoot.querySelector('input').value = text;
  }
}

// multiple instances of the script can be running in some cases, this prevents
// that from throwing an error
export function registerWidget(name, klass) {
  if (!customElements.get(name)) {
    customElements.define(name, klass);
  }
}

function userHasEquella() {
  return atomicSearchConfig.hasEquella;
}

export const getEquellaDomData = () => {
  const withEquella = userHasEquella();
  const dropdownHtml = withEquella ? `
    <button id="menu-target" type="button" aria-label="open dropdown" class="ajas-search-widget__btn--caret">
      ${CARET_SVG}
    </button>
    <div id="menu-overlay" class="ajas-search-widget__overlay hidden"></div>
    <div id="menu-dropdown" class="ajas-search-widget__dropdown hidden">
      <button type="submit" value="${EQUELLA_SEARCH}">Search openEQUELLA content</button>
    </div>
  ` : '';

  const equellaClass = withEquella ? 'ajas-search-widget--equella' : '';

  return { dropdownHtml, equellaClass };
};
