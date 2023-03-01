export function getQuery() {
  const query = window.location.search.substring(1);
  return new URLSearchParams(query);
}

const VAR_MAPPING = {
  ajsearch: 'search',
  ajpage: 'page',
  ajcontext: 'context',
  ajfilters: 'filters',
};

// sends current query vars to Search, this happens when the app first loads
export function sendQueryVariables(source) {
  const query = getQuery();

  const message = { subject: 'atomicjolt.searchParams' };

  Object.keys(VAR_MAPPING).forEach(queryName => {
    const messageName = VAR_MAPPING[queryName];
    const value = query.get(queryName);
    if (value) {
      message[messageName] = value;
    }
  });

  source.postMessage(JSON.stringify(message), '*');
}

// when Search sends updated variables, we store them as query params
export function receiveQueryVariables(message) {
  const query = getQuery();

  Object.keys(VAR_MAPPING).forEach(queryName => {
    const messageName = VAR_MAPPING[queryName];
    const value = message[messageName];
    if (value) {
      query.set(queryName, value);
    } else {
      query.delete(queryName);
    }
  });

  const newState = `?${query.toString()}`;
  window.history.pushState(
    null,
    '',
    newState
  );
}
