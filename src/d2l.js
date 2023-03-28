async function getUserID() {
  const response = await fetch('/d2l/api/lp/1.0/users/whoami');
  const body = await response.json();
  return body.Identifier;
}

function redirectToSearch() {
  window.location.href = 'https://atomicj.brightspacedemo.com/d2l/lms/quizzing/quizzing.d2l?ou=6803';
}

async function onSearch(e) {
  e.preventDefault();
  const form = e.target;
  const query = form.elements.query.value;
  const userID = await getUserID();
  console.log({query, userID})
  // redirectToSearch();
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
  console.log('WIDGET LOADED');
  addWidget();
}

main();
