# Release Notes

## 2.0.2

* When searching from a discussions page, default to filtering by discussion
  replies

## 2.0.1

* Stop keydown event propagation, because it triggers canvas keyboard shortcuts
  on some pages

## 2.0.0

* Switch to using a custom HTML element with a shadow DOM. This fixes a bug
  where canvas js was unintentionally triggering a click on our submit button,
  but will also address similar issues in the future.
* Switch from webpack to esbuild. This matches our other products, speeds up
  builds, and greatly reduces the number of dependencies.
