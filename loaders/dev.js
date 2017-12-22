var atomicSearchWidgetScript = document.createElement("script");
atomicSearchWidgetScript.src = "https://s3.amazonaws.com/atomic-search-widget-dev.atomicjolt.com/atomic_search_widget.js" + "?ts=" + new Date().getTime();
document.getElementsByTagName("head")[0].appendChild(atomicSearchWidgetScript);
