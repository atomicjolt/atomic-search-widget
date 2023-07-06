import styles from '../../styles/styles.scss';
import atomicSearchConfig from './config';

const SEARCH_EVENT = 'ATOMIC_SEARCH';
const DEFAULT_SEARCH = 'DEFAULT';
const EQUELLA_SEARCH = 'EQUELLA';

const SEARCH_SVG = `<svg class="ajas-search-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="-515 337 48 48" enable-background="new -515 337 48 48">
    <path d="M-484,365h-1.6l-0.5-0.5c2-2.3,3.1-5.2,3.1-8.5c0-7.2-5.8-13-13-13s-13,5.8-13,13s5.8,13,13,13c3.2,0,6.2-1.2,8.5-3.1 l0.5,0.5v1.6l10,10l3-3L-484,365z M-496,365c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S-491,365-496,365z"/>
    <path fill="none" d="M-515,337h48v48h-48V337z" />
  </svg>`;

const CLOSE_SVG = `<svg class="ajas-close-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z"/>
    <path d="M0 0h48v48H0z" fill="none"/>
  </svg>`;

const CARET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="9" height="4">
    <g transform="matrix(0.28571433 0 0 0.28571433 0.35714287 -0)">
      <path d="M0.15 0L14.5 14.35L28.85 0L0.15 0" stroke="none" fill="currentFill" fill-rule="nonzero" />
    </g>
  </svg>`;

export {
  SEARCH_SVG,
  CLOSE_SVG,
  CARET_SVG,
  SEARCH_EVENT,
  DEFAULT_SEARCH,
  EQUELLA_SEARCH,
};

export function htmlToElement(htmlText) {
  const template = document.createElement('template');
  template.innerHTML = htmlText.trim();
  return template.content.firstChild;
}

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
