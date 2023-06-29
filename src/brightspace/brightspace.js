// window.atomicSearchConfig = {
//   link: "/d2l/common/dialogs/quickLink/quickLink.d2l?ou={orgUnitId}&type=lti&rcode=9ADACE5F-1B93-48C6-8E76-09AE53984D7F-1307&srcou=6606&launchFramed=1&framedName=Search+(Local)"
// }

import styles from './styles.scss';
import { SEARCH_SVG } from '../canvas/widget_common';

function buildLink(ou) {
  const config = window.atomicSearchConfig;
  if (!config) {
    throw 'No Atomic Search config provided';
  }
  if (!config.link) {
    throw 'No Atomic Search launch link provided';
  }
  return config.link.replace('{orgUnitId}', ou);
}

function modalHtml(iframeSrc) {
  return `
<div id="atomic-search-modal">
  <div id="atomic-search-modal-body">
    <header>
      <h2>Atomic Search</h2>
      <button id="atomic-search-modal-close">&times;</button>
    </header>
    <iframe
      src="${iframeSrc}"
      frameborder="0"
    >
    </iframe>
  </div>
</div>
`;
}

const destroyModal = modal => {
  modal.parentNode.removeChild(modal);
};

function addStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

function getCourseID() {
  const match = window.location.pathname.match(/^\/d2l\/home\/(\d+)/);
  if (match && match.length === 2) {
    return match[1];
  }
  throw 'No Course id found';
}

function startIframeResize(modal) {
  setInterval(() => {
    const height = modal.querySelector('#atomic-search-modal-body').clientHeight - 120;
    modal.querySelector('iframe').height = height;
  }, 100);
}

const onSearch = setSearchTerm => e => {
  e.preventDefault();

  const query = e.target.elements.query.value;
  setSearchTerm(query);

  const modal = document.createElement('div');
  const courseID = getCourseID();
  modal.innerHTML = modalHtml(buildLink(courseID));
  document.body.appendChild(modal);

  const closeButton = document.getElementById('atomic-search-modal-close');

  const resizeIframeInterval = startIframeResize(modal);

  closeButton.addEventListener('click', event => {
    event.preventDefault();
    destroyModal(modal);
    clearInterval(resizeIframeInterval);
  });

};

const WIDGET_HTML = `
  <div id="atomic-search-widget">
    <form role="search">
      <label for="atomic-search-text" class="atomic-search-hidden">Search</label>
      <input type="text" name="query" placeholder="Search this course" id="atomic-search-text" />
      <div class="atomic-search-button">
        <button type="submit" aria-label="submit search">
          ${SEARCH_SVG}
        </button>
      </div>
    </form>
  </div>
`;

function addWidget(setSearchTerm) {
  const parent = document.getElementById('atomic-jolt-search-widget');
  parent.innerHTML = WIDGET_HTML;
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

// function iframeResize() {
//   console.log('w');
//   document.addEventListener('DOMContentLoaded', () => {
//     console.log('x');
//     setTimeout(() => {
//     console.log('y');
//       window.top.postMessage({ subject: 'lti.frameResize', height: 500 }, '*');
//     }, 0);
//   });
// }

function main() {
  addStyles();

  let searchTerm = '';

  addWidget(term => { searchTerm = term; });
  listenToPostMessages(() => searchTerm);
}

main();
