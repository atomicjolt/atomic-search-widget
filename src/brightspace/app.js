import styles from './styles.scss';
import { SEARCH_SVG } from '../common/html';
import getBrightspaceConfig from '../common/brightspace_config';
import openModal from '../brightspace_common/modal';

const getConfig = getBrightspaceConfig('atomicSearchConfig');

function placeholderText() {
  if (window.location.pathname === '/d2l/home') {
    return 'Search my courses';
  } if (getConfig('orgTypeId') === '3') {
    return 'Search this course';
  }

  return 'Search this organization';
}

function widgetHTML() {
  return `
  <div id="atomic-search-widget">
    <form role="search">
      <label for="atomic-search-text" class="atomic-search-hidden">Search</label>
      <input type="text" name="query" placeholder="${placeholderText()}" id="atomic-search-text" />
      <div class="atomic-search-button">
        <button type="submit" aria-label="submit search">
          ${SEARCH_SVG}
        </button>
      </div>
    </form>
  </div>
  `;
}

function addStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const onSearch = setSearchTerm => e => {
  e.preventDefault();

  const query = e.target.elements.query.value;
  setSearchTerm(query);

  openModal(getConfig('link'));
};

function addWidget(setSearchTerm) {
  const parent = document.getElementById('atomic-jolt-search-widget');
  parent.innerHTML = widgetHTML();
  const form = parent.querySelector('form');
  form.addEventListener('submit', onSearch(setSearchTerm));
}

function listenToPostMessages(getSearchTerm) {
  window.addEventListener('message', event => {
    let message = {};
    if (typeof event.data === 'string') {
      try {
        message = JSON.parse(event.data);
      } catch (_err) {
        // This is some other message we don't need to worry about
      }
    }

    if (message.subject === 'atomicjolt.requestSearchParams') {
      const iframe = event.source;
      iframe.postMessage({ subject: 'atomicjolt.searchParams', search: getSearchTerm() }, '*');
    }
  });
}

function main() {
  addStyles();

  let searchTerm = '';

  addWidget(term => { searchTerm = term; });
  listenToPostMessages(() => searchTerm);
}

main();
