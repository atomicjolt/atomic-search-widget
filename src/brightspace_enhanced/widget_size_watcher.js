function lastVisibleNavItem() {
  let items = document.querySelectorAll(
    '.d2l-navigation-s-main-wrapper .d2l-navigation-s-item',
  );
  items = Array.from(items).reverse();

  return items.find((item) => !item.dataset.hidden);
}

function checkSize(widget) {
  const item = lastVisibleNavItem();

  const navRightEdge = item.getBoundingClientRect().right;
  const widgetLeftEdge = widget.getBoundingClientRect().right - 240;

  if (navRightEdge < widgetLeftEdge) {
    widget.openPermanently();
  } else {
    widget.closePermanently();
  }
}

export default function watchWidgetSize(widget) {
  checkSize(widget);
  setInterval(() => checkSize(widget), 100);
}
