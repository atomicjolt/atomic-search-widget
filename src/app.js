import $ from 'jquery';
import './desktop_widget';
import './mobile_widget';
import { SEARCH_EVENT, EQUELLA_SEARCH } from './widget_common';
import handleTrayExpand from './expand_lti_launch';
import atomicSearchConfig from './config';

let APP_IFRAME;

function updateSearchWidgetText(newText) {
  document.querySelectorAll('atomic-search-desktop-widget,atomic-search-mobile-widget').forEach(widget => {
    widget.updateSearchText(newText);
  });
}

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
  updateSearchWidgetText(ajsearch);
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
          updateSearchWidgetText(message.search);
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
        } case 'atomicjolt.expandCanvasTray': {
          handleTrayExpand(event);
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

    if (localNavElement.attr('href') && localNavElement[0].text.trim() === word) {
      url = localNavElement.attr('href');
      return true;
    }
    if (globalNavElement.attr('href') && globalNavElement.find('.menu-item__text').text().trim() === word) {
      const toolPath = globalNavElement.attr('href').match(/\/(external_tools)\/[0-9]+/i);
      const contextMatch = window.location.pathname.match(/^\/(courses|accounts)\/[0-9]+/i);
      if (contextMatch && toolPath) {
        url = `${contextMatch[0]}${toolPath[0]}`;
      } else {
        url = globalNavElement.attr('href');
      }
      return true;
    }
    return false;
  });

  return url;
}

const BIG_WIDGET_ID = 'ajas-search-widget';

function addBigWidget(placeholder) {
  function buildHTML(cssClass) {
    return `
      <atomic-search-desktop-widget
        id="${BIG_WIDGET_ID}"
        data-css-class="${cssClass}"
        data-placeholder="${placeholder}"
      ></atomic-search-widget>
    `;
  }

  const path = window.location.pathname;
  let node;

  if (path === '/') { // Dashboard page.
    const html = buildHTML('ajas-search-widget--dashboard');
    node = $(html).insertAfter('.ic-Dashboard-header__title');
  } else if (path.match(/^\/courses\/?$/i)) { // All courses page.
    const html = buildHTML('ajas-search-widget--all-courses');
    node = $(html).insertAfter('.header-bar');
  } else if (path.match(/^\/courses\/[\d]+\/files\/?$/i)) { // Course files page. Not individual file pages though.
    // NOTE This one is not working at the moment. It seems that the parent node
    // is removed, and the mutation observer never fires
    const html = buildHTML('ajas-search-widget--files');
    node = $(html).insertAfter('.ic-app-crumbs');
  } else { // Any course page.
    const html = buildHTML('ajas-search-widget--files');
    node = $(html).appendTo('.right-of-crumbs');
  }

  return [node, BIG_WIDGET_ID];
}

const SMALL_WIDGET_ID = 'ajas-search-widget-mobile';

function addSmallWidget(placeholder) {
  const html = `
    <atomic-search-mobile-widget
      id="${SMALL_WIDGET_ID}"
      data-placeholder="${placeholder}"
    ></atomic-search-widget>
  `;

  const node = $(html).insertAfter('.mobile-header-title');
  node.parent().css('position', 'relative');

  return [node, SMALL_WIDGET_ID];
}

const Placeholders = {
  ACCOUNTS: 'Search this account',
  COURSES: 'Search this course',
  DASHBOARD: 'Search my courses',
};

function addWidget(addToDOM, attemptNumber) {
  // Cap the number of times we re-add the widget in case we end up in a loop
  // with canvas
  if (attemptNumber >= 5) return;

  const isSearchableLocation = window.location.pathname.match(/^\/(accounts|courses)/i)
    || window.location.pathname === '/';

  if (!isSearchableLocation) return;

  const toolUrl = getToolUrl();

  if (!toolUrl) return;

  let placeholder = Placeholders.DASHBOARD;

  if (window.location.pathname.match(/^\/(accounts)/i)) {
    placeholder = Placeholders.ACCOUNTS;
  }

  if (window.location.pathname.match(/^\/(courses)/i)) {
    placeholder = Placeholders.COURSES;
  }

  const [widget, id] = addToDOM(placeholder);
  if (widget.length === 0) {
    // not incrementing attemptNumber here because repeating this isn't too
    // bad
    setTimeout(() => addWidget(addToDOM, attemptNumber), 50);
    return;
  }

  widget[0].addEventListener(SEARCH_EVENT, e => {
    const { searchText, searchType } = e.detail;
    if (APP_IFRAME) {
      const queryHash = getQueryHash();
      queryHash.ajsearch = encodeURIComponent(searchText);
      queryHash.ajpage = '1';

      window.history.pushState(
        null,
        '',
        `?${toQuery(queryHash)}`,
      );
      sendQueryVariables(APP_IFRAME);
    } else {
      const query = new URLSearchParams({
        ajsearch: searchText,
        ajpage: '1'
      });
      if (window.location.pathname.match(/\/(discussion_topics)/i)) {
        query.set('ajfilters', 'discussion_replies');
      }
      if (searchType === EQUELLA_SEARCH) {
        query.set('ajcontext', 'OPEN_EQUELLA');
      }
      const queryChar = toolUrl.match(/\?/) ? '&' : '?';
      window.location.href = `${toolUrl}${queryChar}${query.toString()}`;
    }
  });

  const observer = new MutationObserver(mutations => {
    let wasRemoved = false;
    mutations.forEach(mutation => {
      const searchNode = Array.from(mutation.removedNodes).find(
        node => node.id === id
      );
      if (searchNode) {
        wasRemoved = true;
      }

    });
    if (wasRemoved) {
      observer.disconnect();
      addWidget(addToDOM, attemptNumber + 1);
    }
  });

  observer.observe(widget.parent()[0], { childList: true });
}

// an instance of the script is already running
if (!window.ATOMIC_SEARCH_LOCKED) {
  window.ATOMIC_SEARCH_LOCKED = true;
  ajEnableListener();
  addWidget(addBigWidget, 0);
  addWidget(addSmallWidget, 0);
}
