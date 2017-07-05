var createDecoder = require('./decoder');
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
  var offset = 68;

  while (offset < headerLen) {
    var columna = {
      name: decoder(data.slice(offset, offset + 32)),
      dataType: String.fromCharCode(data.readUInt8(offset + 32)),
      len: data.readUInt8(offset + 33),
      decimal: data.readUInt8(offset + 34),
      mdx: data.readUInt8(offset + 37) == 0x01,
      autoInc: data.readUInt32LE(offset + 40)
    }
    
    out.push(columna);

    if (data.readUInt8(offset + 30) === 13) {
      break;
    } else {
      offset += 48;
    }
  }
  return out;
}

function rowFuncs(buffer, offset, len, type, decoder) {  
  var data = buffer.slice(offset, offset + len);
  

  var textData = decoder(data);

  console.log('textData', textData, type, offset, len)

  switch (type) {
    case '+':

      var negative = (data[0] & 0x80) == 0x00
      var lastPart = (data[0] & 0x7F)
      
      var buffer2 = Buffer.alloc(len, data)
      buffer2[0] = lastPart

      return buffer2.readUInt32BE(0)


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
  var deleted;
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
