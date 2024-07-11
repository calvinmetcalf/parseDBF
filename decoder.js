var regex = /^(?:ANSI\s)?(\d+)$/m;
export function createDecoder(encoding, second) {
  if (!encoding) {
    return browserDecoder;
  }
  try {
    new TextDecoder(encoding.trim());
  } catch (e) {
    var match = regex.exec(encoding);
    if (match && !second) {
      return createDecoder('windows-' + match[1], true);
    } else {
      encoding = undefined;
      return browserDecoder;
    }
  }
  return browserDecoder;
  function browserDecoder(buffer) {
    var decoder = new TextDecoder(encoding ? encoding : undefined);
    var out = decoder.decode(buffer, {
      stream: true
    }) + decoder.decode();
    return out.replace(/\0/g, '').trim();
  }
}
