import { createDecoder } from './decoder.js';
function dbfHeader(data) {
  var out = {};
  out.lastUpdated = new Date(data.getUint8(1) + 1900, data.getUint8(2), data.getUint8(3));
  out.records = data.getUint32(4, true);
  out.headerLen = data.getUint16(8, true);
  out.recLen = data.getUint16(10, true);
  return out;
}

function dbfRowHeader(data, headerLen, decoder) {
  var out = [];
  var offset = 32;
  while (offset < headerLen) {
    out.push({
      name: decoder(new Uint8Array(data.buffer.slice(data.byteOffset + offset, data.byteOffset + offset + 11))),
      dataType: String.fromCharCode(data.getUint8(offset + 11)),
      len: data.getUint8(offset + 16),
      decimal: data.getUint8(offset + 17)
    });
    if (data.getUint8(offset + 32) === 13) {
      break;
    } else {
      offset += 32;
    }
  }
  return out;
}

function rowFuncs(buffer, offset, len, type, decoder) {
  const data = new Uint8Array(buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + len));

  var textData = decoder(data);
  switch (type) {
    case 'N':
    case 'F':
    case 'O':
      return parseFloat(textData, 10);
    case 'D':
      return new Date(textData.slice(0, 4), parseInt(textData.slice(4, 6), 10) - 1, textData.slice(6, 8));
    case 'L':
      return textData.toLowerCase() === 'y' || textData.toLowerCase() === 't';
    default:
      return textData;
  }
}

function parseRow(buffer, offset, rowHeaders, decoder) {
  var out = {};
  var i = 0;
  var len = rowHeaders.length;
  var field;
  var header;
  while (i < len) {
    header = rowHeaders[i];
    field = rowFuncs(buffer, offset, header.len, header.dataType, decoder);
    offset += header.len;
    if (typeof field !== 'undefined') {
      out[header.name] = field;
    }
    i++;
  }
  return out;
}

export default function (buffer, encoding) {
  var decoder = createDecoder(encoding);
  var header = dbfHeader(buffer);
  var rowHeaders = dbfRowHeader(buffer, header.headerLen - 1, decoder);

  var offset = ((rowHeaders.length + 1) << 5) + 2;
  var recLen = header.recLen;
  var records = header.records;
  var out = [];
  while (records) {
    out.push(parseRow(buffer, offset, rowHeaders, decoder));
    offset += recLen;
    records--;
  }
  return out;
}
