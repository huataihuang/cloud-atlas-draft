node-templayed
==============

A simple port of [templayed.js][templayed] for node.js

> The fastest and smallest Mustache compliant Javascript templating library
[See more][templayed]

## Getting Started
Install it just running `npm install templayed` into your project.

## HOW TO USE
```js
var templayed = require('templayed');

var tpl  = "<ul>{{#names}}<li>{{../fullName}}</li>{{/names}}</ul>",
    data = {
        names: [{firstName: "Paul", lastName: "Engel"}, {firstName: "Chunk", lastName: "Norris"}],
        fullName: function() {
            return this.lastName + ", " + this.firstName;
        }
    };

var html = templayed(tpl)(data);

console.log( html ); //=> "<ul><li>Engel, Paul</li><li>Norris, Chunk</li></ul>";
```

## CREDITS
[Paul Engel][author] and [Helder Santana][gitio]

[templayed]: https://github.com/archan937/templayed.js
[author]: https://github.com/archan937
[gitio]: http://heldr.com