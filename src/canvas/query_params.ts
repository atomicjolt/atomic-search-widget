export function getQuery() {
  const query = window.location.search.substring(1);
  return new URLSearchParams(query);
}

const VAR_MAPPING = {
  ajsearch: 'search',
  ajpage: 'page',
  ajcontext: 'context',
  ajfilters: 'filters',
  ajsmart: 'semantic',
} as const;

// sends current query vars to Search, this happens when the app first loads
export function sendQueryVariables(source: Window) {
  const query = getQuery();

  const message: Record<string, string> = { subject: 'atomicjolt.searchParams' };

  for (const [queryName, messageName] of Object.entries(VAR_MAPPING)) {
    const value = query.get(queryName);
    if (value) {
      message[messageName] = value;
    }
  }

  source.postMessage(JSON.stringify(message), '*');
}

// when Search sends updated variables, we store them as query params
export function receiveQueryVariables(message: Record<string, string>) {
  const query = getQuery();

  for (const [queryName, messageName] of Object.entries(VAR_MAPPING)) {
    const value = message[messageName];
    if (value) {
      query.set(queryName, value);
    } else {
      query.delete(queryName);
    }
  }

  const newState = `?${query.toString()}`;
  window.history.pushState(null, '', newState);
}
