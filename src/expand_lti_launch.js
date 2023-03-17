export default function handleTrayExpand(event) {
  // finding of sender based on this: https://stackoverflow.com/a/63161849
  const iframes = Array.from(document.querySelectorAll('iframe'));
  const sender = iframes.find(
    iframe => iframe.contentWindow === event.source
  );
  if (sender) {
    const dialog = sender.closest('[role=dialog]');
    
    if (dialog.getAttribute('aria-label') === 'Atomic Author') {
      dialog.parentElement.style.width = 'width: 888px; max-width: 100%;';
    }
  }
}
