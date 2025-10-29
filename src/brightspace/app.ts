import registerModal, { CreateModal } from '../brightspace_common/modal';
import { SEARCH_EVENT, createWidget } from './widget';
import t from '../brightspace_common/i18n/translate';
import ConfigWrapper from '../common/brightspace_config';

const config = new ConfigWrapper('brightspaceStandard');

const FRAME_ELEMENT_NAME = 'atomic-search-modal';

function placeholderText() {
  if (window.location.pathname === '/d2l/home') {
    return t('Search my courses');
  }
  if (config.get('orgTypeId') === '3') {
    return t('Search this course');
  }

  return t('Search this organization');
}

function addWidget(createModal: CreateModal) {
  const widget = createWidget({
    placeholderText: placeholderText(),
    showBranding: config.get('showBranding', 'on'),
  });

  widget.addEventListener(SEARCH_EVENT, (e: Event) => {
    const query = (e as CustomEvent).detail.searchText;

    const modal = createModal({
      frameSrc: config.get('link'),
      query: query,
    });
    document.body.appendChild(modal);
  });

  const parent = document.getElementById('atomic-jolt-search-widget')!;
  parent.appendChild(widget);
}

function main() {
  const createModal = registerModal(FRAME_ELEMENT_NAME);

  addWidget(createModal);
}

main();
