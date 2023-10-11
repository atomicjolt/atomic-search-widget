import styles from './styles.scss';
import { SEARCH_SVG } from '../common/html';
import { createModal, listenForSearchPostMessages } from '../common/brightspace_modal';
import getBrightspaceConfig from '../common/brightspace_config';

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

  createModal(getConfig('link'));
};

function addWidget(setSearchTerm) {
  const parent = document.getElementById('atomic-jolt-search-widget');
  parent.innerHTML = widgetHTML();
  const form = parent.querySelector('form');
  form.addEventListener('submit', onSearch(setSearchTerm));
}

function main() {
  addStyles();

  let searchTerm = '';

  addWidget(term => { searchTerm = term; });
  listenForSearchPostMessages(() => searchTerm);
}

main();
