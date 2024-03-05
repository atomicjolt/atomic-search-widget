import getBrightspaceConfig from '../common/brightspace_config';
import registerModal from '../brightspace_common/modal';
import { SEARCH_EVENT, registerWidget } from './widget';
import t from '../brightspace_common/i18n/translate';

const getConfig = getBrightspaceConfig('atomicSearchConfig');

const FRAME_ELEMENT_NAME = 'atomic-search-modal';

function placeholderText() {
  if (window.location.pathname === '/d2l/home') {
    return t('Search my courses');
  } if (getConfig('orgTypeId') === '3') {
    return t('Search this course');
  }

  return t('Search this organization');
}

function addWidget() {
  const widget = document.createElement('atomic-search-widget');
  widget.dataset.placeholderText = placeholderText();

  widget.addEventListener(SEARCH_EVENT, e => {
    const query = e.detail.searchText;

    const modal = document.createElement(FRAME_ELEMENT_NAME);
    modal.dataset.frameSrc = getConfig('link');
    modal.dataset.query = query;
    document.body.appendChild(modal);
  });

  const parent = document.getElementById('atomic-jolt-search-widget');
  parent.appendChild(widget);
}

function main() {
  registerWidget();
  registerModal(FRAME_ELEMENT_NAME);

  addWidget();
}

main();
