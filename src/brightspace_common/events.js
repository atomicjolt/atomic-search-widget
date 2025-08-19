export default function listenToPostMessages(e, searchTerm) {
  let message = {};
  if (typeof e.data === 'string') {
    try {
      message = JSON.parse(e.data);
    } catch (_err) {
      // This is some other message we don't need to worry about
    }
  }

  if (message.subject === 'atomicjolt.requestSearchParams') {
    if (searchTerm) {
      const iframe = e.source;
      iframe.postMessage(
        { subject: 'atomicjolt.searchParams', search: searchTerm },
        '*',
      );
    }
  }
}
