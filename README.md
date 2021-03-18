# rcm-client

Fast, unopinionated, minimalist config manager for [node](http://nodejs.org).

```js
const RCM = require("rcm-client");
const config = new RCM({
  appKey: "xxx",
  appSecret: "xxx",
});

config
  .load("topic", "item")
  .then((config) => console.log(config))
  .catch((error) => console.log(error));
```
