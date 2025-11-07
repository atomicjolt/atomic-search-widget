import registerModal, { CreateModal } from '../brightspace_common/modal';
import ConfigWrapper from '../common/brightspace_config';
import { COURSE, ORG, ORG_TYPE } from './org_types';
import { DesktopWidget, createDesktopWidget } from './desktop_widget';
import { SEARCH_EVENT } from './widget_common';
import { MobileWidget, createMobileWidget } from './mobile_widget';
import checkSupportedOrgs from './check_supported_orgs';

console.log('[AJ] global JS attached');

const MODAL_ELEMENT_NAME = 'atomic-search-enhanced-modal';

const config = new ConfigWrapper('brightspaceCustom');

const PARENT_SELECTOR = '.d2l-navigation-s-main-wrapper';
function canInjectWidget() {
  return !!document.querySelector(PARENT_SELECTOR);
}

type Widget = DesktopWidget | MobileWidget;

function addSearchListener(
  widget: Widget,
  orgId: string,
  createModal: CreateModal,
) {
  widget.addEventListener(SEARCH_EVENT, (e: Event) => {
    const searchText = (e as CustomEvent).detail.searchText;

    let link = config.get('link');
    link = link.replace('{orgUnitId}', orgId);
    link = link.concat(`&ajsearch=${encodeURIComponent(searchText)}`);

    const modal = createModal({ frameSrc: link, query: searchText });
    document.body.appendChild(modal);
  });
}

function addDesktopWidget(
  orgType: ORG_TYPE,
  orgId: string,
  createModal: CreateModal,
) {
  const widget = createDesktopWidget({
    orgType: orgType,
    showBranding: config.get('showBranding', 'on'),
  });
  widget.style.position = 'absolute';
  widget.style.top = '0';
  widget.style.height = '100%';

  const parent = document.querySelector<HTMLElement>(
    '.d2l-navigation-s-main-wrapper',
  )!;

  parent.after(widget);

  if (parent.hasAttribute('has-edit-menu')) {
    widget.style.right = '80px';
    parent.style.marginRight = '5rem';
  } else {
    widget.style.right = '0px';
    parent.style.marginRight = '2.5rem';
    widget.parentElement!.style.position = 'relative';
  }

  addSearchListener(widget, orgId, createModal);
}

function addMobileWidget(
  orgType: ORG_TYPE,
  orgId: string,
  createModal: CreateModal,
) {
  const widget = createMobileWidget({
    orgType: orgType,
    showBranding: config.get('showBranding', 'on'),
  });

  const parent = document.querySelector<HTMLElement>(
    '.d2l-navigation-s-mobile-menu-nav',
  )!;
  parent.prepend(widget);

  addSearchListener(widget, orgId, createModal);
}

function orgData(): [ORG_TYPE, string] {
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


async function init() {
  if (window.ATOMIC_SEARCH_ENHANCED_LOCKED) {
    console.log('[AJ] global JS loaded twice');
    return;
  }

  window.ATOMIC_SEARCH_ENHANCED_LOCKED = true;

  const createModal = registerModal(MODAL_ELEMENT_NAME);

  if (!canInjectWidget()) {
    console.log('[AJ] page does not have injection location');
    return;
  }

  const [orgType, orgId] = orgData();

  const supportedOrgs = config.get('supportedOrgs', []);
  if (supportedOrgs.length > 0) {
    const supported = await checkSupportedOrgs(supportedOrgs, orgId);
    if (!supported) {
      console.log('[AJ] org not supported, not injecting widget');
      return;
    }
  }

  addDesktopWidget(orgType, orgId, createModal);
  addMobileWidget(orgType, orgId, createModal);
}

init();
