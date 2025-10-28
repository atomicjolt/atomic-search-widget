# Atomic Search Widget [![Build Status](https://travis-ci.org/atomicjolt/react_client_starter_app.svg?branch=master)](https://travis-ci.org/atomicjolt/react_client_starter_app) [![Coverage Status](https://coveralls.io/repos/github/atomicjolt/react_client_starter_app/badge.svg?branch=coveralls)](https://coveralls.io/github/atomicjolt/react_client_starter_app?branch=coveralls)
This application adds a search widget to Canvas.


## Install into Canvas:
[Follow these instructions to install into Canvas](Installation_Instructions.md)


## Getting Started with Development:

Make sure to install git and npm before you start then:

1. git clone https://github.com/atomicjolt/atomic-search-widget.git my_project_name
2. Configure Caddy to serve the build dir by adding this to your Caddyfile, changing
   the file path

```
atomic-search-widget.atomicjolt.xyz {
  root * /[path-to-repo]/build/dev
  file_server

  header {
        Cache-Control: no-cache, no-store, must-revalidate
  }
}
```

3. Install packages with

    `npm install`

4. Start server with:

  `npm run hot`

5. Upload the file loaders/local.js as your canvas theme js (Do this in a
   subaccount or on test or beta canvas). It's a small
   snippet that simply loads the js from the webpack server.

## Scripts:
Run webpack hot reload server:
  `npm hot`

Release a production build to the S3 website bucket
env is dev, beta, or prod:
  `npm release [env]`

Run a linter over the project:
  `npm lint`

## Deploy
If you have multiple aws profiles and need to use a specific one you can do so by setting the AWS_PROFILE
i.e.
AWS_PROFILE=atomicjolt npm run release dev


## License and attribution
MIT
