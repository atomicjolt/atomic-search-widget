# Release Notes

## 2.0.0

* Switch to using a custom HTML element with a shadow DOM. This fixes a bug
  where canvas js was unintentionally triggering a click on our submit button,
  but will also address similar issues in the future.
* Switch from webpack to esbuild. This matches our other products, speeds up
  builds, and greatly reduces the number of dependencies.
