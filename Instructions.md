# Installation

We've provided 2 options for adding the Atomic Search widget to your Canvas instance. Use whichever one works best for your situation.

The first option is to use the [remote JavaScript loader](loaders/prod.js). Instead of including all of the code for the widget directly, it grabs the code from our servers every time the widget loads. This ensures that you always have the latest version of the Search widget without any future changes on your part.

If you'd prefer not to point to a remote script like this or would prefer to choose when the widget gets updated, the other option is to use the [complete JavaScript](https://d2u53n8918fnto.cloudfront.net/atomic_search_widget.js). This contains all the code needed to add the widget to Canvas. To get future changes and updates to the Search widget, you would need to go back to that link and get the newest code manually.

After selecting your preferred method, copy the JS code and add it to your current Canvas theme. (You can find more details on adding the file to your Canvas theme at our [installation instructions page](http://products.atomicjolt.com/atomic-apps-canvas/search/install-the-atomic-search-widget/).)

# Custom Setup

By default, outside of a course, the JavaScript behind the Search widget looks in the global Canvas navigation for a link to the Search tool and uses the URL of that link for submitting queries entered into the Search widget. If it doesn't find that link, the widget doesn't display and can't be used. 

If you'd like to hide the Atomic Search link in your global Canvas navigation but would still like to allow the Search widget to be used outside of a course, you can manually specify which tool/URL the widget should point to by adding the following code to the top of your global JS file and replacing the placeholder values with your IDs.

```javascript
var atomicSearchConfig = {
  accountId: YOUR_ACCOUNT_ID,
  externalToolId: YOUR_TOOL_ID, // The ID of your installation of Atomic Search
};
```

If these values are specified, the search widget will use them to construct the submission URL instead of checking in the global Canvas navigation for a Search tool URL. Inside of a Canvas course, the tool URL found in the course navigation will still be used if it exists.
