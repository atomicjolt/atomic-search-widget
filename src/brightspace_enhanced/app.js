import { COURSE, ORG } from './org_types';
import Widget, {SEARCH_EVENT} from './widget';

console.log('[AJ] global JS attached');

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
    console.log(e);
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
  console.log({orgType, orgId});

  addWidget(orgType, orgId);
}

init();
