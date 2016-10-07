# GitBook Parsers

[![NPM version](https://badge.fury.io/js/gitbook-parsers.svg)](http://badge.fury.io/js/gitbook-parsers) [![Build Status](https://travis-ci.org/GitbookIO/gitbook-parsers.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook-parsers)

This Javascript module provides a low level parsing interface for GitBooks. The API is promise-based, and this module can be used in both Node.js and the Browser.

### Parsers

| Parser | Latest Version | Tests |
| ------ | ------- | ----- |
| [Markdown](https://github.com/GitbookIO/gitbook-markdown) | [![NPM version](https://badge.fury.io/js/gitbook-markdown.svg)](http://badge.fury.io/js/gitbook-markdown) | [![Build Status](https://travis-ci.org/GitbookIO/gitbook-markdown.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook-markdown) |
| [AsciiDoc](https://github.com/GitbookIO/gitbook-asciidoc) | [![NPM version](https://badge.fury.io/js/gitbook-asciidoc.svg)](http://badge.fury.io/js/gitbook-asciidoc) | [![Build Status](https://travis-ci.org/GitbookIO/gitbook-asciidoc.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook-asciidoc) |
| [reStructuredText](https://github.com/GitbookIO/gitbook-restructuredtext) | [![NPM version](https://badge.fury.io/js/gitbook-restructuredtext.svg)](http://badge.fury.io/js/gitbook-restructuredtext) | [![Build Status](https://travis-ci.org/GitbookIO/gitbook-restructuredtext.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook-restructuredtext) |


### Usage

This module can be used in **node.js** and in the **browser**

##### In the Browser:

Include the file:

```
<script src="library/gitbook-parsers.min.js" />
```

##### In Node.js:

```
npm install gitbook-parsers
```

Then include it using:

```js
var gitbookParsers = require("gitbook-parsers");
```

##### Find a parser for a file:

```js
var parser = gitbookParsers.getForFile("FILE.md");
```

##### Use this parser:

Parse the summary:

```js
parser.summary("* [An entry](./test.md)")
.then(function(summary) { ... });
```

Parse the glossary:

```js
parser.glossary("...")
.then(function(glossary) { ... });
```

Parse the languages index:

```js
parser.langs("...")
.then(function(languages) { ... });
```

Parse a page to html:

```js
parser.page("...")
.then(function(sections) { ... });
```
