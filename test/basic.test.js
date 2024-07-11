import fs from 'fs'
import basic from './data/watershed.js'
import char11 from './data/watershed-11chars.js'
import specialChar from './data/watershed-specialCharacters.js'
var utf = [
  {
    field: '💩'
  },
  {
    field: 'Hněvošický háj'
  }
]
import dbf from '../index.js'
import chai from 'chai';
chai.should();
function toArrayBuffer(buffer) {
  return new DataView(buffer.buffer, buffer.byteOffset, buffer.length);
}
describe('dbf', function () {
  it('should work', function (done) {
    fs.readFile('./test/data/watershed.dbf', function (err, data) {
      if (err) {
        return done(err);
      }
      dbf(toArrayBuffer(data)).should.deep.equal(basic);
      done();
    });
  });
  it('should handle 11 charicter field names', function (done) {
    fs.readFile('./test/data/watershed-11chars.dbf', function (err, data) {
      if (err) {
        return done(err);
      }
      dbf(toArrayBuffer(data)).should.deep.equal(char11);
      done();
    });
  });
  it('should handle special characters', function (done) {
    fs.readFile('./test/data/watershed-specialCharacters.dbf', function (err, data) {
      if (err) {
        return done(err);
      }
      dbf(toArrayBuffer(data)).should.deep.equal(specialChar);
      done();
    });
  });
  it('should handle an empty / null dbf file', function (done) {
    fs.readFile('./test/data/empty.dbf', function (err, data) {
      if (err) {
        return done(err);
      }
      dbf(toArrayBuffer(data)).should.deep.equal([{}, {}]);
      done();
    });
  });
  it('should handle utf charicters', function (done) {
    fs.readFile('./test/data/utf.dbf', function (err, data) {
      if (err) {
        return done(err);
      }
      dbf(toArrayBuffer(data)).should.deep.equal(utf);
      dbf(toArrayBuffer(data), 'UTF-8').should.deep.equal(utf);
      done();
    });
  });
  it('should handle utf charicters and a stupid formatting', function (done) {
    fs.readFile('./test/data/utf.dbf', function (err, data) {
      if (err) {
        return done(err);
      }
      fs.readFile('./test/data/page.html', 'utf8', function (err, data2) {
        dbf(toArrayBuffer(data), data2).should.deep.equal(utf);
        done();
      })
    });
  });
  it('should handle other charicters', function (done) {
    fs.readFile('./test/data/codepage.dbf', function (err, dataraw) {
      if (err) {
        return done(err);
      }
      const data = toArrayBuffer(dataraw)
      dbf(data)[1].should.not.deep.equal(utf[1]);
      dbf(data, '1250')[1].should.deep.equal(utf[1]);
      dbf(data, 'ANSI 1250')[1].should.deep.equal(utf[1]);
      dbf(data, 'windows-1250')[1].should.deep.equal(utf[1]);
      done();
    });
  });
});
