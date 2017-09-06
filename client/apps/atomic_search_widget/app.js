import './styles/styles';

// To use real values, the administrator is expected to place an
// atomicSearchConfig object above this code with their account and tool IDs.
var atomicSearchConfig = atomicSearchConfig || {
  accountId: null,
  externalToolId: null,
};

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  console.log('Query variable %s not found', variable);
}

function ajHandleComm(e) {
  try {
    var message = JSON.parse(e.data);
    switch (message.subject) {
      case 'atomicjolt.requestSearchParams': {
        var ajsearch = getQueryVariable('ajsearch');
        e.source.postMessage(JSON.stringify({ subject: 'atomicjolt.searchParams', search: ajsearch }), '*');
        $('#atomic-search-widget').val(ajsearch);
        break;
      }
      default:
        break;
    }
  } catch(e){}
}

function ajEnableListener() {
  // Create IE + others compatible event handler
  var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
  var eventer = window[eventMethod];
  this.messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
  // Listen to message from child window
  eventer(this.messageEvent, ajHandleComm, false);
}

function getToolUrl() {
  var baseSelector = 'a:contains("Search")';
  var courseNavElement = $('#section-tabs ' + baseSelector);
  var globalNavElement = $('#menu ' + baseSelector);

  if (courseNavElement.attr('href')) {
    return courseNavElement.attr('href');
  } else if (atomicSearchConfig.accountId && atomicSearchConfig.externalToolId) {
    return "/accounts/" + atomicSearchConfig.accountId + "/external_tools/" + atomicSearchConfig.externalToolId;
  } else {
    return globalNavElement.attr('href'); // May be undefined.
  }
}

function buildWidget(toolUrl){
  var appendTo, positionCSS, html;
  var width = "300px";

  if (window.location.pathname == '/') { // Dashboard page.
    positionCSS = 'position: relative; margin: 15px 0 0;';
    appendTo = '#right-side-wrapper';
    width = "240px";
  } else if (window.location.pathname.match(/^\/courses\/?$/i)) { // All courses page.
    positionCSS = 'position: absolute; right: 24px; top: 30px;';
    appendTo = '.header-bar';
  } else { // Any course page.
    positionCSS = 'position: absolute; right: 24px; top: -52px;'
    appendTo = '#main';
  }

  html = '<form id="atomic-search-widget-form" style="' + positionCSS + '" action="' + toolUrl + '" method="GET">';
  html += '<div style="box-sizing: border-box;display: -webkit-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-align-items: center; align-items: center; height: 40px; width: ' + width + '; padding: 5px 10px; background: #f5f5f5; border: 1px solid #dddddd; border-radius: 3px;"><div style="box-sizing: border-box;width: 280px; position: relative;"><label for="atomic-search-widget" style="display: none;">Atomic Search</label><input name="ajsearch" id="atomic-search-widget" type="text" placeholder="Search..." style="box-sizing: border-box;width: 100%; font-family: LatoWeb, sans-serif; font-weight: normal; height: 30px; border: 1px solid #dddddd; border-radius: 3px; font-size: 14px; padding: 0 35px 0 10px; color: #333333;margin: 0;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-515 337 48 48" enable-background="new -515 337 48 48"style="height: 18px;position: absolute;right: 7px;top: 6px;pointer-events: none;"><defs> <style>.cls-2{fill: #777777;}</style> </defs><path class="cls-2" d="M-484,365h-1.6l-0.5-0.5c2-2.3,3.1-5.2,3.1-8.5c0-7.2-5.8-13-13-13s-13,5.8-13,13s5.8,13,13,13c3.2,0,6.2-1.2,8.5-3.1l0.5,0.5v1.6l10,10l3-3L-484,365z M-496,365c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S-491,365-496,365z"/><path fill="none" d="M-515,337h48v48h-48V337z"/></svg></div></div>';
  html += '</form>';

  return {
    appendTo: appendTo,
    html: html,
  };
}

function addWidget() {
  if (window.location.pathname.match(/^\/courses/i) || window.location.pathname == '/') {
    var toolUrl = getToolUrl();

    if (toolUrl) {
      var widget = buildWidget(toolUrl);

      $(widget.appendTo).append(widget.html);

      $('#atomic-search-widget-form').submit(function(e) {
        e.preventDefault();
        var searchVal = $('#atomic-search-widget').val();
        var ajParam = toolUrl.indexOf('?') > -1 ? '&ajsearch=' : '?ajsearch=';

        window.location.href = toolUrl + ajParam + encodeURIComponent(searchVal);
      });
    }
  }
}

ajEnableListener();
addWidget();

