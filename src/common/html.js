export function htmlToElement(htmlText) {
  const template = document.createElement('template');
  template.innerHTML = htmlText.trim();
  return template.content.firstChild;
}

export const SEARCH_SVG = `<svg class="ajas-search-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="-515 337 48 48" enable-background="new -515 337 48 48">
    <path d="M-484,365h-1.6l-0.5-0.5c2-2.3,3.1-5.2,3.1-8.5c0-7.2-5.8-13-13-13s-13,5.8-13,13s5.8,13,13,13c3.2,0,6.2-1.2,8.5-3.1 l0.5,0.5v1.6l10,10l3-3L-484,365z M-496,365c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S-491,365-496,365z"/>
    <path fill="none" d="M-515,337h48v48h-48V337z" />
  </svg>`;

export const NEW_SVG = `<svg class="ajas-search-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.8 64.6">
  <g>
    <path class="a" d="M52.5,55.9a5.9,5.9,0,0,1-2.3.4H14.6a8,8,0,0,1-8-8v-32a8,8,0,0,1,8-8H50.2a8,8,0,0,1,8,8v32A8.2,8.2,0,0,1,56.7,53L43.5,39.8a13.6,13.6,0,0,0,2.3-7.5A13.4,13.4,0,1,0,32.4,45.7a12.9,12.9,0,0,0,7.5-2.4Zm-20.1-32a8.4,8.4,0,1,0,8.4,8.4A8.5,8.5,0,0,0,32.4,23.9Z"/>
    <rect class="b" width="64.7" height="64.7"/>
  </g>
</svg>`;

export const CLOSE_SVG = `<svg class="ajas-close-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z"/>
    <path d="M0 0h48v48H0z" fill="none"/>
  </svg>`;
