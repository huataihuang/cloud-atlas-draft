# Nunjucks filter

[![NPM version](https://badge.fury.io/js/nunjucks-filter.svg)](http://badge.fury.io/js/nunjucks-filter)

Nunjucks extension that brings a "filter" tag

### How to install it?

```
$ npm install nunjucks-filter
```

### How to use it?

```js
var FilterExtension = require("nunjucks-filter")(nunjucks);

env.addExtension('FilterExtension', new FilterExtension(env));
```


```html
{% filter "replace" "." "!" %}
Hi. My name is Paul.
{% endfilter %}

// => Hi! My name is Paul!
```
