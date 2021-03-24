# rcm-client

Fast, unopinionated, minimalist config manager for [node](http://nodejs.org).

```js
const RCM = require("rcm-client");

const config = new RCM({
  token: "xxx",
});

config
  .load("config name")
  .then((config) => console.log(config))
  .catch((error) => console.log(error));
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 10 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm i @remosi/rcm-client
```
