var fs = require('fs');
var basic = require('./data/watershed');
var char11 = require('./data/watershed-11chars');
var specialChar = require('./data/watershed-specialCharacters');
var utf = [
  {
    field: '💩'
  },
  {
    field: 'Hněvošický háj'
  }
]
var dbf = require('../');
require('chai').should();
function toArrayBuffer(buffer) {
    return buffer;
}
describe('dbf',function(){
	it('should work',function(done){
		fs.readFile('./test/data/watershed.dbf',function(err,data){
			if(err){
				return done(err);
			}
			dbf(data).should.deep.equal(basic);
			done();
		});
	});
  it('should handle 11 charicter field names',function(done){
		fs.readFile('./test/data/watershed-11chars.dbf',function(err,data){
			if(err){
				return done(err);
			}
			dbf(data).should.deep.equal(char11);
			done();
		});
	});
  it('should handle special characters',function(done){
    fs.readFile('./test/data/watershed-specialCharacters.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data).should.deep.equal(specialChar);
      done();
    });
  });
  it('should handle an empty / null dbf file',function(done){
    fs.readFile('./test/data/empty.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data).should.deep.equal([{}, {}]);
      done();
    });
  });
  it('should handle utf charicters',function(done){
    fs.readFile('./test/data/utf.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data).should.deep.equal(utf);
      dbf(data, 'UTF-8').should.deep.equal(utf);
      done();
    });
  });
  it('should handle ANSI characters with different encoding names',function(done){
    fs.readFile('./test/data/codepage.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data)[1].should.not.deep.equal(utf[1]);
      dbf(data, '1250')[1].should.deep.equal(utf[1]);
      dbf(data, 'ANSI 1250')[1].should.deep.equal(utf[1]);
      dbf(data, 'windows-1250')[1].should.deep.equal(utf[1]);
      done();
    });
  });
  it('should handle invalid encodings',function(done){
    var htmlpage = fs.readFileSync('./index.html', 'utf-8');
    fs.readFile('./test/data/watershed.dbf',function(err,data){
      if(err){
        return done(err);
      }
      // throws if calling data.trim()
      dbf(data, data).should.deep.equal(basic);
      // throws RangeError if using TextDecoder(htmlpage)
      dbf(data, htmlpage).should.deep.equal(basic);
      done();
    });
  });
  it('should handle non-decoded encodings',function(done){
    var encoding = fs.readFileSync('./test/data/encoding.cpg', 'utf-8');
    var encodingBinary = fs.readFileSync('./test/data/encoding.cpg');
    fs.readFile('./test/data/utf.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data, encoding).should.deep.equal(utf);
      dbf(data, encodingBinary).should.deep.equal(utf);
      done();
    });
  });
});
