// course link
// https://atomicj.brightspacedemo.com/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6803&type=lti&rcode=9ADACE5F-1B93-48C6-8E76-09AE53984D7F-1238&srcou=6606

// global nav
// https://atomicj.brightspacedemo.com/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6606&type=lti&rcode=9ADACE5F-1B93-48C6-8E76-09AE53984D7F-1238&srcou=6606

async function getUserID() {
  const response = await fetch('/d2l/api/lp/1.0/users/whoami');
  const body = await response.json();
  return body.Identifier;
}

function redirectToSearch() {
  window.location.href = 'https://atomicj.brightspacedemo.com/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6803&type=lti&rcode=9ADACE5F-1B93-48C6-8E76-09AE53984D7F-1235&srcou=6803&launchFramed=1&framedName=Search';
}

async function onSearch(e) {
  e.preventDefault();
  const form = e.target;
  const query = form.elements.query.value;
  const userID = await getUserID();

  console.log('search params:', { query, userID });

  redirectToSearch();
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
  addWidget();
}

main();
