var createDecoder = require('./decoder');
var parseLevel7 = require('./dbase-level-7')

function dbfHeader(data) {
  var out = {};

  out.lastUpdated = new Date(data.readUInt8(1) + 1900, data.readUInt8(2), data.readUInt8(3));
  out.records = data.readUInt32LE(4);
  out.headerLen = data.readUInt16LE(8);
  out.recLen = data.readUInt16LE(10);
  
  return out;
}

function dbfRowHeader(data, headerLen, decoder) {
  var out = [];
  var offset = 32;
  while (offset < headerLen) {
    out.push({
      name: decoder(data.slice(offset, offset + 11)),
      dataType: String.fromCharCode(data.readUInt8(offset + 11)),
      len: data.readUInt8(offset + 16),
      decimal: data.readUInt8(offset + 17)
    });
    if (data.readUInt8(offset + 32) === 13) {
      break;
    } else {
      offset += 32;
    }
  }
  return out;
}

function rowFuncs(buffer, offset, len, type, decoder) {
  var data = buffer.slice(offset, offset + len);
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
    case 'Y':
      return data.readUIntLE(0, 8) / 10000
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
  deleted = buffer.readUInt8(offset) == 0x2A
  offset++
  out['@deleted'] = deleted
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

module.exports = function(buffer, encoding) {
  var decoder = createDecoder(encoding);
  var header = dbfHeader(buffer);

  if (header.dBaseVersion === 'level7') {
    return parseLevel7.apply(this, arguments)
  }

  var rowHeaders = dbfRowHeader(buffer, header.headerLen - 1, decoder);

  var offset = header.headerLen//((rowHeaders.length + 1) << 5) + 2;
  var recLen = header.recLen;
  var records = header.records;
  var out = [];

  for (var i = 0; i < records; i++, offset += recLen) {
    out.push(parseRow(buffer, offset, rowHeaders, decoder));
  }

  return out;
};
