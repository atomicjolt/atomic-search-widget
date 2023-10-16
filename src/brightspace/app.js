import getBrightspaceConfig from '../common/brightspace_config';
import registerModal from '../brightspace_common/modal';
import { SEARCH_EVENT, registerWidget } from './widget';

const getConfig = getBrightspaceConfig('atomicSearchConfig');

const FRAME_ELEMENT_NAME = 'atomic-search-modal';

function placeholderText() {
  if (window.location.pathname === '/d2l/home') {
    return 'Search my courses';
  } if (getConfig('orgTypeId') === '3') {
    return 'Search this course';
  }

  return 'Search this organization';
}

function addWidget(setSearchTerm) {
  const widget = document.createElement('atomic-search-widget');
  widget.dataset.placeholderText = placeholderText();

  widget.addEventListener(SEARCH_EVENT, e => {
    const query = e.detail.searchText;
    setSearchTerm(query);

    const modal = document.createElement(FRAME_ELEMENT_NAME);
    modal.dataset.frameSrc = getConfig('link');
    document.body.appendChild(modal);
  });

  const parent = document.getElementById('atomic-jolt-search-widget');
  parent.appendChild(widget);
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
  registerWidget();
  registerModal(FRAME_ELEMENT_NAME);

  let searchTerm = '';

  addWidget(term => { searchTerm = term; });
  listenToPostMessages(() => searchTerm);
}

main();
