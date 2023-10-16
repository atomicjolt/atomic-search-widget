function modalHTML(frameSrc) {
  return `
<div id="atomic-search-modal">
  <div id="atomic-search-modal-body">
    <header>
      <h2>Atomic Search</h2>
      <button id="atomic-search-modal-close">&times;</button>
    </header>
    <iframe
      src="${frameSrc}"
      frameborder="0"
    >
    </iframe>
  </div>
</div>
`;
}

const destroyModal = modal => {
  modal.parentNode.removeChild(modal);
};

export default function openModal(frameSrc) {
  const modal = document.createElement('div');
  modal.innerHTML = modalHTML(frameSrc);
  document.body.appendChild(modal);

  const closeButton = document.getElementById('atomic-search-modal-close');

  closeButton.addEventListener('click', event => {
    event.preventDefault();
    destroyModal(modal);
  });
}
