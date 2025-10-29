import './desktop_widget';
import './mobile_widget';
import { SEARCH_EVENT, EQUELLA_SEARCH } from './widget_common';
import handleTrayExpand from './expand_lti_launch';
import atomicSearchConfig from './config';
import {
  getQuery,
  receiveQueryVariables,
  sendQueryVariables,
} from './query_params';
import { htmlToElement } from '../common/html';

let APP_IFRAME;

function updateSearchWidgetText(newText) {
  document
    .querySelectorAll(
      'atomic-search-desktop-widget,atomic-search-mobile-widget',
    )
    .forEach((widget) => {
      widget.updateSearchText(newText);
    });
}

function cacheResults(results) {
  try {
    localStorage.setItem(
      'atomicjoltModuleProgress',
      JSON.stringify({
        time: Date.now(),
        data: results,
      }),
    );
  } catch (e) {
    console.warn('failed to write to localStorage', e);
  }
}

function getCachedResults() {
  try {
    let stored = localStorage.getItem('atomicjoltModuleProgress');
    if (stored) {
      stored = JSON.parse(stored);

      if (Date.now() - stored.time < 3600000) {
        // one hour
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

  const promises = courseIds.map(
    (id) =>
      new Promise((resolve) => {
        fetch(
          `/courses/${id}/modules/progressions.json?user_id=${ENV.current_user_id}`,
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then((data) => {
            const json = JSON.parse(data.replace(/^while\(1\);/, ''));
            resolve({ [id]: json });
          })
          .catch(() => {
            // sometimes they will get 401's from this call. proceed with modules we
            // did manage to load, otherwise they will be stuck waiting
            resolve({});
          });
      }),
  );

  Promise.all(promises)
    .then((results) => {
      const progress = results.reduce((acc, pair) => ({ ...acc, ...pair }), {});
      cb(progress);
      cacheResults(progress);
    })
    .catch((error) => console.error(error));
}

function sendModuleProgress(source, progress) {
  source.postMessage(
    JSON.stringify({
      subject: 'atomicjolt.moduleProgress',
      moduleProgress: progress,
    }),
    '*',
  );
}

// sends the current query parameters to the search widget, and to Search
function pushQuery(sourceFrame) {
  sendQueryVariables(sourceFrame);
  updateSearchWidgetText(getQuery().get('ajsearch'));
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
            window.addEventListener('popstate', () => pushQuery(APP_IFRAME));
          }
          pushQuery(APP_IFRAME);
          break;
        }
        case 'atomicjolt.updateSearchParams': {
          receiveQueryVariables(message);
          updateSearchWidgetText(message.search);
          break;
        }
        case 'atomicjolt.requestModuleProgress': {
          // Send a 'ping' back immediately. If the app doesn't receive it, it
          // will assume they don't have global JS enabled.
          event.source.postMessage(
            JSON.stringify({
              subject: 'atomicjolt.ping',
            }),
            '*',
          );
          if (message.courseIds) {
            allModuleProgress(message.courseIds, (progress) =>
              sendModuleProgress(event.source, progress),
            );
          }
          break;
        }
        case 'atomicjolt.expandCanvasTray': {
          handleTrayExpand(event);
          break;
        }
        default:
          break;
      }
    } catch {
      // Ignore errors
    }
  }
}

function ajEnableListener() {
  // Create IE + others compatible event handler
  const eventMethod = window.addEventListener
    ? 'addEventListener'
    : 'attachEvent';
  const eventer = window[eventMethod];
  Window.messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
  // Listen to message from child window
  eventer(Window.messageEvent, ajHandleComm, false);
}

// in consortium searches, the id might be something like 4346~2848
const PATH_REGEX = /^\/(courses|accounts)\/[0-9~]+/i;
const EXTERNAL_TOOL_REGEX = /\/external_tools\/[0-9]+/i;
const SEARCH_WORDS = [
  'Search',
  'Søk',
  'Buscar',
  'Rechercher',
  'Търсене',
  'Cerca',
  'Hledat',
  'Søg',
  'Suche',
  'Αναζήτηση',
  'Ikastaro',
  'Etsi',
  'Cuardaigh',
  'सभी',
  'Keresés',
  'Որոնել',
  'Cari',
  'Cerca',
  'Hemî',
  'Doorzoek',
  'Pesquisar',
  'Căutați',
  'Поиск',
  'Sök',
  'Tüm',
];

function elementMatchesSearchWord(el) {
  return SEARCH_WORDS.some((word) => el.textContent.trim() === word || el.textContent.trim().startsWith(`Search (`));
}

function getToolUrl() {
  if (atomicSearchConfig.accountId && atomicSearchConfig.externalToolId) {
    const toolPath = `external_tools/${atomicSearchConfig.externalToolId}`;

    const contextMatch = window.location.pathname.match(PATH_REGEX);
    if (contextMatch) {
      return `${contextMatch[0]}/${toolPath}`;
    }

    return `/accounts/${atomicSearchConfig.accountId}/${toolPath}?launch_type=global_navigation`;
  }

  for (let i = 0; i < SEARCH_WORDS.length; i++) {
    const word = SEARCH_WORDS[i];
    const baseSelector = `a[href*="/external_tools/"]`;
    // this could be within a course or subaccount
    const localNavLinks = Array.from(
      document.querySelectorAll(`#section-tabs ${baseSelector}`),
    );

    const localNavElement = localNavLinks.find(
      (link) => elementMatchesSearchWord(link)
    );
    if (localNavElement) {
      return localNavElement.href;
    }

    const globalNavLinks = Array.from(document.querySelectorAll(`#menu ${baseSelector}`));
    const globalNavElement = globalNavLinks.find((link) => {
      const textEl = link.querySelector('.menu-item__text');
      return (
        textEl &&
        elementMatchesSearchWord(textEl)
      );
    });

    if (globalNavElement) {
      const toolPath = globalNavElement.href.match(EXTERNAL_TOOL_REGEX);
      const contextMatch = window.location.pathname.match(PATH_REGEX);
      if (contextMatch && toolPath) {
        return `${contextMatch[0]}${toolPath[0]}`;
      }

      return globalNavElement.href;
    }

    if (
      globalNavElement.attr('href') &&
      globalNavElement.find('.menu-item__text').text().trim() === word
    ) {
      const toolPath = globalNavElement.attr('href').match(EXTERNAL_TOOL_REGEX);
      const contextMatch = window.location.pathname.match(PATH_REGEX);
      if (contextMatch && toolPath) {
        return `${contextMatch[0]}${toolPath[0]}`;
      }
    }
  }

  return null;
}

const BIG_WIDGET_ID = 'ajas-search-widget';

function addBigWidget(placeholder) {
  function buildHTML(cssClass) {
    const htmlText = `
      <atomic-search-desktop-widget
        id="${BIG_WIDGET_ID}"
        data-css-class="${cssClass}"
        data-placeholder="${placeholder}"
      ></atomic-search-widget>
    `;
    return htmlToElement(htmlText);
  }

  const path = window.location.pathname;
  let node;

  if (path === '/') {
    // Dashboard page.
    node = buildHTML('ajas-search-widget--dashboard');

    document.querySelector('.ic-Dashboard-header__actions').appendChild(node);
  } else if (path.match(/^\/courses\/?$/i)) {
    // All courses page.
    node = buildHTML('ajas-search-widget--all-courses');

    document.querySelector('.header-bar').after(node);
  } else if (path.match(/^\/courses\/[\d]+\/files\/?$/i)) {
    // Course files page. Not individual file pages though.
    // NOTE This one is not working at the moment. It seems that the parent node
    // is removed, and the mutation observer never fires
    node = buildHTML('ajas-search-widget--files');
    document.querySelector('.ic-app-crumbs').after(node);
  } else {
    // Any course page.
    node = buildHTML('ajas-search-widget--files');
    node = document.querySelector('.right-of-crumbs').appendChild(node);
  }

  return [node, BIG_WIDGET_ID];
}

const SMALL_WIDGET_ID = 'ajas-search-widget-mobile';

function addSmallWidget(placeholder) {
  const node = htmlToElement(`
    <atomic-search-mobile-widget
      id="${SMALL_WIDGET_ID}"
      data-placeholder="${placeholder}"
    ></atomic-search-widget>
  `);


  document.querySelector('.mobile-header-title').after(node);
  node.parent().css('position', 'relative');

  return [node, SMALL_WIDGET_ID];
}

const Placeholders = {
  ACCOUNTS: 'Search this account (local)',
  COURSES: 'Search this course (local)',
  DASHBOARD: 'Search my courses (local)',
};

function addWidget(addToDOM, attemptNumber) {
  // Cap the number of times we re-add the widget in case we end up in a loop
  // with canvas
  if (attemptNumber >= 5) return;

  const isSearchableLocation =
    window.location.pathname.match(/^\/(accounts|courses)/i) ||
    window.location.pathname === '/';

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
  if (!widget) {
    // not incrementing attemptNumber here because repeating this isn't too
    // bad
    setTimeout(() => addWidget(addToDOM, attemptNumber), 50);
    return;
  }

  widget.addEventListener(SEARCH_EVENT, (e) => {
    const { searchText, searchType } = e.detail;
    if (APP_IFRAME) {
      const query = getQuery();
      query.set('ajsearch', searchText);
      query.set('ajpage', '1');

      if (searchType === EQUELLA_SEARCH) {
        query.set('ajcontext', 'OPEN_EQUELLA');
      }

      window.history.pushState(null, '', `?${query.toString()}`);
      pushQuery(APP_IFRAME);
    } else {
      const query = new URLSearchParams({
        ajsearch: searchText,
        ajpage: '1',
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

  const observer = new MutationObserver((mutations) => {
    let wasRemoved = false;
    mutations.forEach((mutation) => {
      const searchNode = Array.from(mutation.removedNodes).find(
        (node) => node.id === id,
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

  observer.observe(widget.parentElement, { childList: true });
}

// an instance of the script is already running
if (!window.ATOMIC_SEARCH_LOCKED) {
  window.ATOMIC_SEARCH_LOCKED = true;
  ajEnableListener();
  addWidget(addBigWidget, 0);
  addWidget(addSmallWidget, 0);
}
