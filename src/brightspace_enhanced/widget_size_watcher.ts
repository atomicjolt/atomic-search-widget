import type { DesktopWidget } from './desktop_widget';

function lastVisibleNavItem(): HTMLElement {
  const itemElements = document.querySelectorAll<HTMLElement>(
    '.d2l-navigation-s-main-wrapper .d2l-navigation-s-item',
  );
  const items = Array.from(itemElements).reverse();

  return items.find((item) => !item.dataset.hidden)!;
}

function checkSize(widget: DesktopWidget) {
  const item = lastVisibleNavItem();

  const navRightEdge = item.getBoundingClientRect().right;
  const widgetLeftEdge = widget.getBoundingClientRect().right - 240;

  if (navRightEdge < widgetLeftEdge) {
    widget.openPermanently();
  } else {
    widget.closePermanently();
  }
}

export default function watchWidgetSize(widget: DesktopWidget) {
  checkSize(widget);
  setInterval(() => checkSize(widget), 100);
}
