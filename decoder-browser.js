require('text-encoding-polyfill');
var StringDecoder = require('string_decoder').StringDecoder;
function defaultDecoder(data) {
  var decoder = new StringDecoder();
  var out = decoder.write(data) + decoder.end();
  return out.replace(/\0/g, '').trim();
}
module.exports = createDecoder;
var regex = /^(?:ANSI\s)?(\d+)$/m;

function createDecoder(encoding) {
  if (!encoding) {
    return defaultDecoder;
  }
  encoding = String(encoding).trim();
  var match = regex.exec(encoding);
  if (match) {
    encoding = 'windows-' + match[1];
  }
  try {
    new TextDecoder(encoding);
    return browserDecoder;
  } catch(e) {
    return defaultDecoder;
  }
  return browserDecoder;
  function browserDecoder(buffer) {
    var decoder = new TextDecoder(encoding);
    var out = decoder.decode(buffer, {
      stream: true
    }) + decoder.decode();
    return out.replace(/\0/g, '').trim();
  }
}
