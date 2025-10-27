export default function listenToPostMessages(e: MessageEvent, searchTerm: string) {
  let message: { subject?: string; search?: string } = {};
  if (typeof e.data === 'string') {
    try {
      message = JSON.parse(e.data);
    } catch {
      // This is some other message we don't need to worry about
    }
  }

  if (message.subject === 'atomicjolt.requestSearchParams') {
    if (searchTerm) {
      const iframe = e.source as Window;
      iframe.postMessage(
        { subject: 'atomicjolt.searchParams', search: searchTerm },
        '*',
      );
    }
  }
}
