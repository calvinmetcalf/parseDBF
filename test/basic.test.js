var fs = require('fs');
var basic = require('./data/watershed');
var char11 = require('./data/watershed-11chars');
var specialChar = require('./data/watershed-specialCharacters');

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
			dbf(toArrayBuffer(data)).should.deep.equal(basic);
			done();
		});
	});
  it('should handle 11 charicter field names',function(done){
		fs.readFile('./test/data/watershed-11chars.dbf',function(err,data){
			if(err){
				return done(err);
			}
			dbf(toArrayBuffer(data)).should.deep.equal(char11);
			done();
		});
	});
  it('should handle special characters',function(done){
    fs.readFile('./test/data/watershed-specialCharacters.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(toArrayBuffer(data)).should.deep.equal(specialChar);
      done();
    });
  });
  it('should handle an empty / null dbf file',function(done){
    fs.readFile('./test/data/empty.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(toArrayBuffer(data)).should.deep.equal([{}, {}]);
      done();
    });
  });
});
