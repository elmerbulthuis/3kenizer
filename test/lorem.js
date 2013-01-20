var fs = require('fs');
var Tokenizer = require('../lib/3kenizer').Tokenizer;

module.exports['countWords'] = function(beforeExit, assert){
	var counters = {};

	var tokenizer = new Tokenizer;
	tokenizer.on('token', tokenizer_ontoken);

	var readStream = fs.createReadStream('res/lorem.txt', {encoding: 'utf8'});
	readStream.on('end', readStream_end);

	beforeExit(function(){
		assert.equal(counters.word, 69);
	});

	readStream.pipe(tokenizer);

	function tokenizer_ontoken(token, data){
		if(!token in counters) counters[token] = 0;
		counters[token]++;
	}//tokenizer_ontoken

	function readStream_end(){
		readStream.destroy();
		tokenizer.destroy();
	}//readStream_end

};


