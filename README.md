parseDBF
========
DBF parsing components of [shapefile-js](https://github.com/calvinmetcalf/shapefile-js)


Install
===

```
npm install --save parsedbf
```

Usage
===

`parseDBF(dataView, [codepage])`

```js
import parseDBF from 'parsedbf';

var buff = fs.readFileSync('path/to/my/file');
var dbfFile = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
var parsedDBF = parseDBF(dbfFile);
```
