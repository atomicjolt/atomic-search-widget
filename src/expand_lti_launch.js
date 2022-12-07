export default function handleTrayExpand(event) {
  // finding of sender based on this: https://stackoverflow.com/a/63161849
  const iframes = Array.from(document.querySelectorAll('iframe'));
  const sender = iframes.find(
    iframe => iframe.contentWindow === event.source
  );
  sender.closest('[role=dialog]').parentElement.style.width = '900px';
}
