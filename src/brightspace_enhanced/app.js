import getBrightspaceConfig from '../common/brightspace_config';
import { COURSE, ORG } from './org_types';
import Widget, { SEARCH_EVENT } from './widget';

console.log('[AJ] global JS attached');

const getConfig = getBrightspaceConfig('atomicSearchCustomConfig');

function registerWidget() {
  customElements.define('atomic-search-widget', Widget);
}

function canInjectWidget() {
  return !!document.querySelector('.d2l-navigation-header-right');
}

function addWidget(orgType, orgId) {
  const widget = document.createElement('atomic-search-widget');
  widget.dataset.orgType = orgType;
  const parent = document.querySelector('.d2l-navigation-header-right');
  parent.appendChild(widget);

  widget.addEventListener(SEARCH_EVENT, e => {
    const { searchText } = e.detail;

    let link = getConfig('link');
    link = link.replace('{orgUnitId}', orgId);
    link = link.concat(`&ajsearch=${encodeURIComponent(searchText)}`);
    window.location.href = link;
  });
}

function orgData() {
  const courseTitleTag = document.querySelector('header nav .d2l-navigation-s-title-container a');
  if (courseTitleTag) {
    const pathParts = courseTitleTag.href.split('/');
    return [COURSE, pathParts[pathParts.length - 1]];
  }

  const orgId = JSON.parse(document.querySelector('html').dataset.heContext).orgUnitId;
  return [ORG, orgId];
}

function getSearchTerm() {
  return new URLSearchParams(window.location.search).get('ajsearch');
}

function listenToMessages() {
  if (document.getElementById('atomic-jolt-search-widget')) return;

  window.addEventListener('message', event => {
    let message = {};
    if (typeof event.data === 'string') {
      try {
        message = JSON.parse(event.data);
      } catch (_err) {
        return;
      }
    }

    switch (message.subject) {
      case 'atomicjolt.requestSearchParams': {
        const searchFrame = event.source;
        const searchTerm = getSearchTerm();
        if (!searchTerm) return;

        searchFrame.postMessage({ subject: 'atomicjolt.searchParams', search: searchTerm }, '*');
        break;
      }
      default:
    }
  });
}

function init() {
  if (window.ATOMIC_SEARCH_ENHANCED_LOCKED) {
    console.log('[AJ] global JS loaded twice');
    return;
  }

  window.ATOMIC_SEARCH_ENHANCED_LOCKED = true;

  registerWidget();

  if (!canInjectWidget()) {
    console.log('[AJ] page does not have injection location');
    return;
  }

  const [orgType, orgId] = orgData();

  addWidget(orgType, orgId);

  listenToMessages();
}

init();
