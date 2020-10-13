require('text-encoding-polyfill');
var StringDecoder = require('string_decoder').StringDecoder;
function defaultDecoder(data) {
  var decoder = new StringDecoder();
  var out = decoder.write(data) + decoder.end();
  return out.replace(/\0/g, '').trim();
}
module.exports = createDecoder;
var regex = /^(?:ANSI\s)?(\d+)$/m;
function createDecoder(encoding, second) {
  if (!encoding) {
    return defaultDecoder;
  }
  try {
    new TextDecoder(encoding.trim());
  } catch(e) {
    var match = regex.exec(encoding);
    if (match && !second) {
      return createDecoder('windows-' + match[1], true);
    } else {
      return defaultDecoder;
    }
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
