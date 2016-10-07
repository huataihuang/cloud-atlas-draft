# Nunjucks autoescape

[![Build Status](https://travis-ci.org/SamyPesse/nunjucks-autoescape.png?branch=master)](https://travis-ci.org/SamyPesse/nunjucks-autoescape) [![NPM version](https://badge.fury.io/js/nunjucks-autoescape.svg)](http://badge.fury.io/js/nunjucks-autoescape)

Nunjucks extension that brings a "autoescape" tag

### How to install it?

```
$ npm install nunjucks-autoescape
```

### How to use it?

```js
var AutoEscapeExtension = require("nunjucks-autoescape")(nunjucks);

env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(env));
```


```html
{% autoescape false %}
The variable {{ test }} is not escaped!
{% endautoescape %}
```
