import registerModal from '../brightspace_common/modal';
import getBrightspaceConfig from '../common/brightspace_config';
import { COURSE, ORG, ORG_TYPE } from './org_types';
import { DESKTOP_WIDGET_NAME, DesktopWidget, registerDesktopWidget } from './desktop_widget';
import { SEARCH_EVENT } from './widget_common';
import { MOBILE_WIDGET_NAME, MobileWidget, registerMobileWidget } from './mobile_widget';

console.log('[AJ] global JS attached');

const MODAL_ELEMENT_NAME = 'atomic-search-enhanced-modal';

const getConfig = getBrightspaceConfig('atomicSearchCustomConfig');

const PARENT_SELECTOR = '.d2l-navigation-s-main-wrapper';
function canInjectWidget() {
  return !!document.querySelector(PARENT_SELECTOR);
}

type Widget = DesktopWidget | MobileWidget;

function addSearchListener(widget: Widget, orgId: string) {
  widget.addEventListener(SEARCH_EVENT, (e: Event) => {
    const searchText = (e as CustomEvent).detail.searchText;

    let link = getConfig('link');
    link = link.replace('{orgUnitId}', orgId);
    link = link.concat(`&ajsearch=${encodeURIComponent(searchText)}`);

    const modal = document.createElement(MODAL_ELEMENT_NAME);
    modal.dataset.frameSrc = link;
    modal.dataset.query = searchText;
    document.body.appendChild(modal);
  });
}

function addDesktopWidget(orgType: ORG_TYPE, orgId: string) {
  const widget = document.createElement(DESKTOP_WIDGET_NAME) as DesktopWidget;
  widget.dataset.orgType = orgType;
  widget.dataset.showBranding = getConfig('showBranding', 'on');
  widget.style.position = 'absolute';
  widget.style.top = '0';
  widget.style.height = '100%';

  const parent = document.querySelector<HTMLElement>('.d2l-navigation-s-main-wrapper')!;

  parent.after(widget);

  if (parent.hasAttribute('has-edit-menu')) {
    widget.style.right = '80px';
    parent.style.marginRight = '5rem';
  } else {
    widget.style.right = '0px';
    parent.style.marginRight = '2.5rem';
    widget.parentElement!.style.position = 'relative';
  }

  addSearchListener(widget, orgId);
}

function addMobileWidget(orgType: ORG_TYPE, orgId: string) {
  const widget = document.createElement(MOBILE_WIDGET_NAME) as MobileWidget;
  widget.dataset.orgType = orgType;
  widget.dataset.showBranding = getConfig('showBranding', 'on');

  const parent = document.querySelector<HTMLElement>('.d2l-navigation-s-mobile-menu-nav')!;
  parent.prepend(widget);

  addSearchListener(widget, orgId);
}

function orgData() {
  const courseTitleTag = document.querySelector<HTMLAnchorElement>(
    'header nav .d2l-navigation-s-title-container a',
  );
  if (courseTitleTag) {
    const pathParts = courseTitleTag.href.split('/');
    return [COURSE, pathParts[pathParts.length - 1]];
  }

  const orgId = JSON.parse(
    document.querySelector('html')!.dataset.heContext!,
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
