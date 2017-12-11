var atomicSearchWidgetScript = document.createElement("script");
atomicSearchWidgetScript.src = "http://atomic-search-widget.atomicjoltbetaapps.com.s3-website-us-east-1.amazonaws.com/atomic_search_widget.js" + "?ts=" + new Date().getTime();
document.getElementsByTagName("head")[0].appendChild(atomicSearchWidgetScript);