import registerModal from '../brightspace_common/modal';
import getBrightspaceConfig from '../common/brightspace_config';
import { COURSE, ORG } from './org_types';
import { SEARCH_EVENT, WIDGET_ELEMENT_NAME, registerWidget } from './widget';

console.log('[AJ] global JS attached');

const MODAL_ELEMENT_NAME = 'atomic-search-enhanced-modal';

const getConfig = getBrightspaceConfig('atomicSearchCustomConfig');

function canInjectWidget() {
  return !!document.querySelector('.d2l-navigation-header-right');
}

function addWidget(orgType, orgId) {
  const widget = document.createElement(WIDGET_ELEMENT_NAME);
  widget.dataset.orgType = orgType;
  const parent = document.querySelector('.d2l-navigation-header-right');
  parent.appendChild(widget);

  widget.addEventListener(SEARCH_EVENT, e => {
    const { searchText } = e.detail;

    let link = getConfig('link');
    link = link.replace('{orgUnitId}', orgId);
    link = link.concat(`&ajsearch=${encodeURIComponent(searchText)}`);

    const modal = document.createElement(MODAL_ELEMENT_NAME);
    modal.dataset.frameSrc = link;
    modal.dataset.query = searchText;
    document.body.appendChild(modal);
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
  registerModal(MODAL_ELEMENT_NAME);

  if (!canInjectWidget()) {
    console.log('[AJ] page does not have injection location');
    return;
  }

  const [orgType, orgId] = orgData();

  addWidget(orgType, orgId);
}

init();
