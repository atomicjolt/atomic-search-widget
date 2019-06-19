import $ from 'jquery';

import './styles/styles';

// To use real values, the administrator is expected to place an
// atomicSearchConfig object above this code with their account and tool IDs.
var atomicSearchConfig = window.atomicSearchConfig || {
  accountId: null,
  externalToolId: null,
};

let APP_IFRAME;

function getQueryHash() {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  const hash = {};

  vars.forEach((singleVar) => {
    const pair = singleVar.split('=');
    hash[pair[0]] = pair[1];
  });

  return hash;
}

function getQueryVariable(variable) {
  const queryHash = getQueryHash();

  return queryHash[variable];
}

function toQuery(hash) {
  return $.map(hash, (value, key) => `${key}=${value}`).join('&');
}

function sendQueryVariables(source) {
  const rawValue = getQueryVariable('ajsearch');
  // only decode uri if the value is not undefined.
  const ajsearch = rawValue ? decodeURIComponent(rawValue) : rawValue;
  const ajpage = getQueryVariable('ajpage');
  const ajcontext = getQueryVariable('ajcontext');
  const ajfilters = getQueryVariable('ajfilters');
  source.postMessage(
    JSON.stringify({
      subject: 'atomicjolt.searchParams',
      search: ajsearch,
      page: ajpage,
      context: ajcontext,
      filters: ajfilters,
    }),
    '*'
  );
  $('#ajas-search01').val(ajsearch);
}

function cacheResults(results) {
  try {
    localStorage.setItem('atomicjoltModuleProgress', JSON.stringify({
      time: Date.now(), data: results
    }));
  } catch (e) {
    console.warn('failed to write to localStorage', e);
  }
}

function allModuleProgress(courseIds, cb) {
  // first check if we already have it in local storage
  try {
    let stored = localStorage.getItem('atomicjoltModuleProgress');
    if (stored) {
      stored = JSON.parse(stored);
      if (Date.now() - stored.time < 3600000) { // one hour
        cb(stored.data);
        return;
      }
    }
  } catch (e) {
    console.warn('failed to read from localStorage', e);
  }

  const promises = courseIds.map(id =>
    new Promise((resolve) => {
      $.ajax({
        url: `/courses/${id}/modules/progressions.json`,
        dataType: 'text',
      }).done((data) => {
        const json = JSON.parse(data.replace(/^while\(1\);/, ''));
        resolve({ [id]: json });
      }).fail(() => {
        // sometimes they will get 401's from this call. proceed with modules we
        // did manage to load, otherwise they will be stuck waiting
        resolve({});
      });
    })
  );

  Promise.all(promises).then((results) => {
    const progress = results.reduce((acc, pair) => ({ ...acc, ...pair }), {});
    cb(progress);
    cacheResults(progress);
  }).catch(error => console.error(error));
}

function sendModuleProgress(source, progress) {
  source.postMessage(
    JSON.stringify({
      subject: 'atomicjolt.moduleProgress',
      moduleProgress: progress,
    }),
    '*'
  );
}

function ajHandleComm(event) {
  if (typeof event.data === 'string') {
    try {
      const message = JSON.parse(event.data);

      switch (message.subject) {
        case 'atomicjolt.requestSearchParams': {
          if (!APP_IFRAME) {
            APP_IFRAME = event.source;
            // catch the back button and re-search down below.
            window.addEventListener('popstate', () => sendQueryVariables(APP_IFRAME));
          }
          sendQueryVariables(APP_IFRAME);
          break;
        } case 'atomicjolt.updateSearchParams': {
          const queryHash = {
            ajsearch: message.search,
            ajpage: message.page,
            ajcontext: message.context
          };
          if (message.filters && message.filters !== '') {
            queryHash.ajfilters = message.filters;
          }
          const newState = `?${toQuery(queryHash)}`;
          window.history.pushState(
            null,
            '',
            newState
          );
          $('#ajas-search01').val(message.search);
          break;
        } case 'atomicjolt.requestModuleProgress': {
          // Send a 'ping' back immediately. If the app doesn't receive it, it
          // will assume they don't have global JS enabled.
          event.source.postMessage(
            JSON.stringify({
              subject: 'atomicjolt.ping',
            }), '*'
          );
          if (message.courseIds) {
            allModuleProgress(message.courseIds,
              progress => sendModuleProgress(event.source, progress)
            );
          }
          break;
        } default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

function ajEnableListener() {
  // Create IE + others compatible event handler
  const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
  const eventer = window[eventMethod];
  Window.messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
  // Listen to message from child window
  eventer(Window.messageEvent, ajHandleComm, false);
}

function getToolUrl() {
  const searchWords = ['Search', 'Søk', 'Buscar', 'Rechercher', 'Търсене', 'Cerca', 'Hledat', 'Søg', 'Suche', 'Αναζήτηση', 'Ikastaro', 'Etsi', 'Cuardaigh', 'सभी', 'Keresés', 'Որոնել', 'Cari', 'Cerca', 'Hemî', 'Doorzoek', 'Pesquisar', 'Căutați', 'Поиск', 'Sök', 'Tüm'];
  let url;
  // the linter doesn't like normal for loops, we use 'some' because returning
  // true breaks you out early
  searchWords.some((word) => {
    const baseSelector = `a:contains("${word}")`;
    // this could be within a course or subaccount
    const localNavElement = $(`#section-tabs ${baseSelector}`);
    const globalNavElement = $(`#menu ${baseSelector}`);

    if (localNavElement.attr('href') && localNavElement.text().trim() === word) {
      url = localNavElement.attr('href');
      return true;
    } else if (globalNavElement.attr('href') && globalNavElement.find('.menu-item__text').text().trim() === word) {
      url = globalNavElement.attr('href');
      return true;
    }
    return false;
  });

  if (!url && atomicSearchConfig.accountId && atomicSearchConfig.externalToolId) {
    return `/accounts/${atomicSearchConfig.accountId}/external_tools/${atomicSearchConfig.externalToolId}`;
  }

  return url;
}

function buildWidget(toolUrl) {
  let appendTo;
  let cssClass;
  let parentRelative = false;
  const path = window.location.pathname;

  if (path === '/') { // Dashboard page.
    appendTo = '.ic-Dashboard-header__layout';
    cssClass = 'ajas-search-widget--dashboard';
    parentRelative = true;
  } else if (path.match(/^\/courses\/?$/i)) { // All courses page.
    appendTo = '.header-bar';
    cssClass = 'ajas-search-widget--all-courses';
  } else if (path.match(/^\/courses\/[\d]+\/files\/?$/i)) { // Course files page. Not individual file pages though.
    appendTo = '#main';
    cssClass = 'ajas-search-widget--files';
  } else { // Any course page.
    appendTo = '#main';
    cssClass = 'ajas-search-widget--course';
  }

  const html = `<div class="ajas-search-widget ${cssClass}">
    <form id="ajas-search-form" class="ajas-search-widget__form" action="${toolUrl}" method="get" role="search">
      <label for="ajas-search01" class="ajas-search-widget-hidden">Search</label>
      <input type="text" placeholder="Search..." id="ajas-search01" />
      <button class="ajas-search-widget__btn--search" type="submit">
        <svg role="img" aria-label="submit search" xmlns="http://www.w3.org/2000/svg" viewBox="-515 337 48 48" enable-background="new -515 337 48 48">
          <path d="M-484,365h-1.6l-0.5-0.5c2-2.3,3.1-5.2,3.1-8.5c0-7.2-5.8-13-13-13s-13,5.8-13,13s5.8,13,13,13c3.2,0,6.2-1.2,8.5-3.1
            l0.5,0.5v1.6l10,10l3-3L-484,365z M-496,365c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S-491,365-496,365z"/>
          <path fill="none" d="M-515,337h48v48h-48V337z" />
        </svg>
      </button>
    </form>
  </div>`;

  return {
    appendTo,
    html,
    parentRelative,
  };
}

function addWidget() {
  if (window.location.pathname.match(/^\/(accounts|courses)/i) ||
    window.location.pathname === '/'
  ) {
    const toolUrl = getToolUrl();

    if (toolUrl) {
      const widget = buildWidget(toolUrl);

      $(widget.appendTo).append(widget.html);

      if (widget.parentRelative) { $(widget.appendTo).css('position', 'relative'); }

      $('#ajas-search-form').submit((e) => {
        e.preventDefault();
        const searchVal = $('#ajas-search01').val();
        const ajParam = toolUrl.match(/\?/) ? '&ajsearch=' : '?ajsearch=';
        if (APP_IFRAME) {
          window.history.pushState(
            null,
            '',
            `${ajParam}${encodeURIComponent(searchVal)}&ajpage=1`,
          );
          sendQueryVariables(APP_IFRAME);
        } else {
          window.location.href = `${toolUrl}${ajParam}${encodeURIComponent(searchVal)}&ajpage=1`;
        }
      });
    }
  }
}

ajEnableListener();
addWidget();
