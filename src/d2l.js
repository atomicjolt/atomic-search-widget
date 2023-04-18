// course link
// https://atomicj.brightspacedemo.com/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6803&type=lti&rcode=9ADACE5F-1B93-48C6-8E76-09AE53984D7F-1238&srcou=6606

// global nav
// https://atomicj.brightspacedemo.com/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6606&type=lti&rcode=9ADACE5F-1B93-48C6-8E76-09AE53984D7F-1238&srcou=6606

// TODO pull this from widget code
function buildLink(ou) {
  return `https://atomicj.brightspacedemo.com/d2l/common/dialogs/quickLink/quickLink.d2l?ou=${ou}&type=lti&rcode=9ADACE5F-1B93-48C6-8E76-09AE53984D7F-1243&srcou=6606`;
}

function modalHtml(iframeSrc) {
  return `
<div id="atomic-search-modal">
  <div id="atomic-search-modal-body">
    <button id="atomic-search-modal-close">&times;</button>
    <iframe src="${iframeSrc}">
    </iframe>
  </div>
</div>
`;
}

const STYLES = `
#atomic-search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  z-index: 1;
  background-color: rgba(0,0,0,0.4);
}

#atomic-search-modal-body {
  background-color: #fefefe;
  margin: 15px auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  height: 80%;
}

#atomic-search-modal-close {
  float: right;
  font-size: 28px;
  font-weight: bold;

  background: none;
  color: inherit;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
}

#atomic-search-modal-close:hover,
#atomic-search-modal-close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

#atomic-search-modal iframe {
  width: 100%;
}
`;

const destroyModal = modal => e => {
  e.preventDefault();
  modal.parentNode.removeChild(modal);
};

function addStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = STYLES;
  document.head.appendChild(styleSheet);
}

const onSearch = setSearchTerm => e => {
  e.preventDefault();

  const query = e.target.elements.query.value;
  setSearchTerm(query);

  const modal = document.createElement('div');
  // TODO get course id from current location
  modal.innerHTML = modalHtml(buildLink(6803));
  document.body.appendChild(modal);

  const closeButton = document.getElementById('atomic-search-modal-close');
  closeButton.addEventListener('click', destroyModal(modal));
};

const WIDGET_HTML = `
<form>
<input name="query" type="text">
<button type="submit">Search</button>
</form>
`;

function addWidget(setSearchTerm) {
  const parent = document.getElementById('atomic-jolt-search-widget');
  parent.innerHTML = WIDGET_HTML;
  const form = parent.querySelector('form');
  form.addEventListener('submit', onSearch(setSearchTerm));
}

function listenToPostMessages(getSearchTerm) {
  window.addEventListener('message', e => {
    if (typeof e.data === 'object' && e.data.subject === 'atomicjolt.fetchsearchterm') {
      e.source.postMessage({ subject: 'atomicjolt.setsearchterm', term: getSearchTerm() }, '*');
    }
  });
}

function iframeResize() {
  console.log('w');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('x');
    setTimeout(() => {
    console.log('y');
      window.top.postMessage({ subject: 'lti.frameResize', height: 500 }, '*');
    }, 0);
  });
}

function main() {
  addStyles();

  let searchTerm = '';

  addWidget(term => { searchTerm = term; });
  listenToPostMessages(() => searchTerm);
}

main();
