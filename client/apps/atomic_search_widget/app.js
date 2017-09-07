import $ from 'jquery';

import './styles/styles';

// To use real values, the administrator is expected to place an
// atomicSearchConfig object above this code with their account and tool IDs.
var atomicSearchConfig = atomicSearchConfig || {
  accountId: null,
  externalToolId: null,
};

function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');

  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');

    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }

  console.log('Query variable %s not found', variable);
}

function ajHandleComm(event) {
  try {
    const message = JSON.parse(event.data);
    switch (message.subject) {
      case 'atomicjolt.requestSearchParams': {
        const ajsearch = getQueryVariable('ajsearch');
        event.source.postMessage(JSON.stringify({ subject: 'atomicjolt.searchParams', search: ajsearch }), '*');
        $('#atomic-search-widget').val(ajsearch);
        break;
      }
      default:
        break;
    }
  } catch (error) {}
}

function ajEnableListener() {
  // Create IE + others compatible event handler
  const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
  const eventer = window[eventMethod];
  this.messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
  // Listen to message from child window
  eventer(this.messageEvent, ajHandleComm, false);
}

function getToolUrl() {
  const baseSelector = 'a:contains("Search")';
  const courseNavElement = $(`#section-tabs ${baseSelector}`);
  const globalNavElement = $(`#menu ${baseSelector}`);

  if (courseNavElement.attr('href')) {
    return courseNavElement.attr('href');
  } else if (atomicSearchConfig.accountId && atomicSearchConfig.externalToolId) {
    return `/accounts/${atomicSearchConfig.accountId}/external_tools/${atomicSearchConfig.externalToolId}`;
  }

  return globalNavElement.attr('href'); // May be undefined.
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
  } else if (path.match(/^\/courses\/[\d]+\/files/i)) { // Course files page.
    appendTo = '#main';
    cssClass = 'ajas-search-widget--files';
  } else { // Any course page.
    appendTo = '#main';
    cssClass = 'ajas-search-widget--course';
  }

  const html = `<div class="ajas-search-widget ${cssClass}">
    <form id="form" class="ajas-search-widget__form" action="${toolUrl}" method="get" role="search">
      <label for="ajas-search01" class="ajas-search-widget-hidden">Search</label>
      <input type="text" placeholder="Search..." id="ajas-search01" />
      <button class="ajas-search-widget__btn--search" type="submit" id="submit">
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
  if (window.location.pathname.match(/^\/courses/i) || window.location.pathname === '/') {
    const toolUrl = getToolUrl();

    if (toolUrl) {
      const widget = buildWidget(toolUrl);

      $(widget.appendTo).append(widget.html);

      if (widget.parentRelative) { $(widget.appendTo).css('position', 'relative'); }

      $('#atomic-search-widget-form').submit((e) => {
        e.preventDefault();
        const searchVal = $('#atomic-search-widget').val();
        const ajParam = toolUrl.match(/\?/) ? '&ajsearch=' : '?ajsearch=';

        window.location.href = toolUrl + ajParam + encodeURIComponent(searchVal);
      });
    }
  }
}

ajEnableListener();
addWidget();

