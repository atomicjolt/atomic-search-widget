import $ from 'jquery';

import '../styles/styles.scss';

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

function getCachedResults() {
  try {
    let stored = localStorage.getItem('atomicjoltModuleProgress');
    if (stored) {
      stored = JSON.parse(stored);

      if (Date.now() - stored.time < 3600000) { // one hour
        return stored.data;
      }
    }

    return {};
  } catch (e) {
    console.warn('failed to read from localStorage', e);
    return {};
  }
}

function allModuleProgress(courseIds, cb) {
  const cachedProgress = getCachedResults();

  const missingCourseIds = [];
  courseIds.forEach((id) => {
    if (!cachedProgress[id]) {
      missingCourseIds.push(id);
    }
  });

  if (missingCourseIds.length === 0) {
    cb(cachedProgress);
    return;
  }

  const promises = courseIds.map(id =>
    new Promise((resolve) => {
      $.ajax({
        url: `/courses/${id}/modules/progressions.json?user_id=${ENV.current_user_id}`,
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
          const queryHash = getQueryHash();
          queryHash.ajsearch = message.search;
          queryHash.ajpage = message.page;
          queryHash.ajcontext = message.context;

          if (message.filters && message.filters !== '') {
            queryHash.ajfilters = message.filters;
          } else {
            delete queryHash.ajfilters;
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
      // Ignore errors
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
  if (atomicSearchConfig.accountId && atomicSearchConfig.externalToolId) {
    const toolPath = `external_tools/${atomicSearchConfig.externalToolId}`;

    const contextMatch = window.location.pathname.match(/^\/(courses|accounts)\/[0-9]+/i);
    if (contextMatch) {
      return `${contextMatch[0]}/${toolPath}`;
    }

    return `/accounts/${atomicSearchConfig.accountId}/${toolPath}?launch_type=global_navigation`;
  }

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

  return url;
}

function searchSVG() {
  return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="-515 337 48 48" enable-background="new -515 337 48 48">
    <path d="M-484,365h-1.6l-0.5-0.5c2-2.3,3.1-5.2,3.1-8.5c0-7.2-5.8-13-13-13s-13,5.8-13,13s5.8,13,13,13c3.2,0,6.2-1.2,8.5-3.1 l0.5,0.5v1.6l10,10l3-3L-484,365z M-496,365c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S-491,365-496,365z"/>
    <path fill="none" d="M-515,337h48v48h-48V337z" />
  </svg>`;
}

function closeSVG() {
  return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z"/>
    <path d="M0 0h48v48H0z" fill="none"/>
  </svg>`;
}

function buildBigScreenWidget(toolUrl) {
  let insertAfter;
  let cssClass = '';
  const path = window.location.pathname;

  if (path === '/') { // Dashboard page.
    insertAfter = '.ic-Dashboard-header__title';
    cssClass = 'ajas-search-widget--dashboard';
  } else if (path.match(/^\/courses\/?$/i)) { // All courses page.
    insertAfter = '.header-bar';
    cssClass = 'ajas-search-widget--all-courses';
  } else if (path.match(/^\/courses\/[\d]+\/files\/?$/i)) { // Course files page. Not individual file pages though.
    insertAfter = '.ic-app-crumbs';
    cssClass = 'ajas-search-widget--files';
  } else { // Any course page.
    insertAfter = '.ic-app-crumbs';
    cssClass = 'ajas-search-widget--course';
  }

  const html = `<div class="ajas-search-widget ${cssClass}">
    <form id="ajas-search-form" class="ajas-search-widget__form" action="${toolUrl}" method="get" role="search">
      <label for="ajas-search01" class="ajas-search-widget-hidden">Search</label>
      <input type="text" placeholder="Search..." id="ajas-search01" />
      <button aria-label="submit search" class="ajas-search-widget__btn--search" type="submit">
        ${searchSVG()}
      </button>
    </form>
  </div>`;

  return {
    insertAfter,
    html,
  };
}

function buildSmallScreenWidget(toolUrl) {
  const appendTo = '#mobile-header';
  const parentRelative = true;
  let cssClass = '';
  const path = window.location.pathname;

  // Add a class if it's the Dashboard, All Courses, or Course Files pages.
  if (path === '/' || path.match(/^\/courses\/?$/i) || path.match(/^\/courses\/[\d]+\/files\/?$/i)) {
    cssClass = 'ajas-search-widget--dashboard-small';
  }

  const html = `<div class="ajas-search-widget ajas-search-widget--small ${cssClass}">
    <form class="ajas-search-widget__form" action="${toolUrl}" method="get" role="search">
      <label for="ajas-search02" class="ajas-search-widget-hidden">Search</label>
      <input type="text" placeholder="Search..." id="ajas-search02" />
      <button aria-label="submit search" class="ajas-search-widget__btn--search" type="submit">
        ${searchSVG()}
      </button>
    </form>
    <button class="ajas-search-toggle" type="button" aria-label="toggle search">${searchSVG()}</button>
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
      const bigScreenWidget = buildBigScreenWidget(toolUrl);
      const smallScreenWidget = buildSmallScreenWidget(toolUrl);
      if ($(bigScreenWidget.insertAfter).length === 0) {
        setTimeout(addWidget, 50);
        return;
      }

      $(bigScreenWidget.html).insertAfter(bigScreenWidget.insertAfter);
      $(smallScreenWidget.appendTo).append(smallScreenWidget.html);

      if (smallScreenWidget.parentRelative) { $(smallScreenWidget.appendTo).css('position', 'relative'); }

      $('.ajas-search-widget__form').submit((e) => {
        e.preventDefault();
        const searchVal = $(e.target).find('input').val();
        if (APP_IFRAME) {
          const queryHash = getQueryHash();
          queryHash.ajsearch = encodeURIComponent(searchVal);
          queryHash.ajpage = '1';

          window.history.pushState(
            null,
            '',
            `?${toQuery(queryHash)}`,
          );
          sendQueryVariables(APP_IFRAME);
        } else {
          const ajParam = toolUrl.match(/\?/) ? '&ajsearch=' : '?ajsearch=';
          window.location.href = `${toolUrl}${ajParam}${encodeURIComponent(searchVal)}&ajpage=1`;
        }
      });

      $('.ajas-search-toggle').click((e) => {
        if ($('.ajas-search-widget--small.is-active').length > 0) {
          $('.ajas-search-widget--small').removeClass('is-active');
          $('.ajas-search-toggle').html(searchSVG());
        } else {
          $('.ajas-search-widget--small').addClass('is-active');
          $('.ajas-search-toggle').html(closeSVG());
        }
      });
    }
  }
}

ajEnableListener();
addWidget();
