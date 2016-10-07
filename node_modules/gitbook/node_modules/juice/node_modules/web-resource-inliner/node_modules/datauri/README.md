datauri [![Build Status](https://secure.travis-ci.org/heldr/datauri.png?branch=master)](http://travis-ci.org/heldr/datauri)
=======

A simple [Data URI scheme][datauri] generator built on top of [Node.js][nodejs]. To install datauri, just run:

`npm install -g datauri` (it may require Root privileges)


CLIENT
------

### Print datauri scheme
To print a datauri scheme from a file
```CLI
$ datauri brand.png
```

### CSS Background
You can generate or update an output css file with datauri background:
```CLI
$ datauri brand.png asset/background.css
```
If you want to define a Class Name, just type:
```CLI
$ datauri brand.png asset/background.css MyNewClass
```

API
---

```js
var Datauri = require('datauri');

// without instance
var datauri = Datauri('test/myfile.png');
console.log(datauri); //=> "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

// with instance
var dUri = new Datauri('test/myfile.png');

console.log(dUri.content); //=> "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";
console.log(dUri.mimetype); //=> "image/png";
console.log(dUri.base64); //=> "iVBORw0KGgoAAAANSUhEUgAA...";
console.log(dUri.getCSS()); //=> "\n.case {\n    background: url('data:image/png;base64,iVBORw...";
console.log(dUri.getCSS("myClass")); //=> "\n.myClass {\n    background: url('data:image/png;base64,iVBORw...";

```

DEVELOPING
----------

The only essential library to develop datauri is jshint.

```CLI
$ make install
$ make test
```

If you'd like to test the full process including npm installer, just run:

```CLI
$ make fulltest
```

## License

MIT License
(c) [Helder Santana](http://heldr.com)

[nodejs]: http://nodejs.org/download
[datauri]: http://en.wikipedia.org/wiki/Data_URI_scheme
