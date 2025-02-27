import registerModal from '../brightspace_common/modal';
import getBrightspaceConfig from '../common/brightspace_config';
import { COURSE, ORG } from './org_types';
import { DESKTOP_WIDGET_NAME, registerDesktopWidget } from './desktop_widget';
import { SEARCH_EVENT } from './widget_common';
import { MOBILE_WIDGET_NAME, registerMobileWidget } from './mobile_widget';

console.log('[AJ] global JS attached');

const MODAL_ELEMENT_NAME = 'atomic-search-enhanced-modal';

const getConfig = getBrightspaceConfig('atomicSearchCustomConfig');

const PARENT_SELECTOR = '.d2l-navigation-s-main-wrapper';
function canInjectWidget() {
  return !!document.querySelector(PARENT_SELECTOR);
}

function addSearchListener(widget, orgId) {
  widget.addEventListener(SEARCH_EVENT, (e) => {
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

function addDesktopWidget(orgType, orgId) {
  const widget = document.createElement(DESKTOP_WIDGET_NAME);
  widget.dataset.orgType = orgType;
  widget.dataset.showBranding = getConfig('showBranding', 'on');
  widget.style.position = 'absolute';
  widget.style.top = '0';
  widget.style.height = '100%';

  const parent = document.querySelector('.d2l-navigation-s-main-wrapper');

  parent.after(widget);

  if (parent.attributes['has-edit-menu']) {
    widget.style.right = '80px';
    parent.style.marginRight = '5rem';
  } else {
    widget.style.right = '0px';
    parent.style.marginRight = '2.5rem';
    widget.parentElement.style.position = 'relative';
  }

  addSearchListener(widget, orgId);
}

function addMobileWidget(orgType, orgId) {
  const widget = document.createElement(MOBILE_WIDGET_NAME);
  widget.dataset.orgType = orgType;
  widget.dataset.showBranding = getConfig('showBranding', 'on');

  const parent = document.querySelector('.d2l-navigation-s-mobile-menu-nav');
  parent.prepend(widget);

  addSearchListener(widget, orgId);
}

function orgData() {
  const courseTitleTag = document.querySelector(
    'header nav .d2l-navigation-s-title-container a',
  );
  if (courseTitleTag) {
    const pathParts = courseTitleTag.href.split('/');
    return [COURSE, pathParts[pathParts.length - 1]];
  }

  const orgId = JSON.parse(
    document.querySelector('html').dataset.heContext,
  ).orgUnitId;
  return [ORG, orgId];
}

function init() {
  if (window.ATOMIC_SEARCH_ENHANCED_LOCKED) {
    console.log('[AJ] global JS loaded twice');
    return;
  }

  window.ATOMIC_SEARCH_ENHANCED_LOCKED = true;

  registerDesktopWidget();
  registerMobileWidget();
  registerModal(MODAL_ELEMENT_NAME);

  if (!canInjectWidget()) {
    console.log('[AJ] page does not have injection location');
    return;
  }

  const [orgType, orgId] = orgData();

  addDesktopWidget(orgType, orgId);
  addMobileWidget(orgType, orgId);
}

init();
