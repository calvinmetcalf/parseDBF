var fs = require('fs');
var out = require('./data/watershed');
var dbf = require('../');
require('chai').should();
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
describe('basic',function(){
	it('should work',function(done){
		fs.readFile('./test/data/watershed.dbf',function(err,data){
			if(err){
				return done(err);
			}
			dbf(toArrayBuffer(data)).should.deep.equal(out);
			done();
		});
	});
});