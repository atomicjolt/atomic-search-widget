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
<div id="atomic-search-widget">
  <button id="atomic-search-widget-close">Close</button>
  <iframe src="${iframeSrc}">
  </iframe>
</div>
`;
}

const STYLES = `
#atomic-search-widget {
  position: fixed;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 10;
}

#atomic-search-widget iframe {
  width: 100%;
  height: 100%;
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

function onSearch(e) {
  e.preventDefault();

  const modal = document.createElement('div');
  // TODO get course id from current location
  modal.innerHTML = modalHtml(buildLink(6803));
  document.body.appendChild(modal);

  const closeButton = document.getElementById('atomic-search-widget-close');
  closeButton.addEventListener('click', destroyModal(modal));
}

const WIDGET_HTML = `
<form>
<input name="query" type="text">
<button type="submit">Search</button>
</form>
`;

function addWidget() {
  const parent = document.getElementById('atomic-jolt-search-widget');
  parent.innerHTML = WIDGET_HTML;
  const form = parent.querySelector('form');
  form.addEventListener('submit', onSearch);
}

function main() {
  addStyles();
  addWidget();
}

main();
