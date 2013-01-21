var fs = require('fs');
var path = require('path');
var Tokenizer = require('../lib/3kenizer').Tokenizer;

module.exports['countLorem'] = wordCountTest('lorem.txt', 69);
module.exports['countOneTwoThree'] = wordCountTest('oneTwoThree.txt', 3);
module.exports['pg135'] = wordCountTest('pg135.txt', 577599);

function wordCountTest(file, expect){
	return function(beforeExit, assert){
		var counters = {};

		var tokenizer = new Tokenizer();
		tokenizer.expressions = {
			'word': /\w+/g
			, 'whitespace': /\s+/g
			, 'other': /./g
		}
		tokenizer.addHandler(['word', 'whitespace', 'other'], tokenizer_handler);
		tokenizer.on('token', tokenizer_token);


		var readStream = fs.createReadStream(path.join('res' , file), {encoding: 'utf8'});
		readStream.on('end', readStream_end);

		beforeExit(function(){
			assert.equal(counters.word, expect);
		});

		readStream.pipe(tokenizer);

		function tokenizer_token(token){
			if(!(token.category in counters)) counters[token.category] = 0;
			counters[token.category]++;
		}//tokenizer_token

		function readStream_end(){
			readStream.destroy();
			//tokenizer.destroySoon();
		}//readStream_end

		function tokenizer_handler(token, addNextHandler){
			addNextHandler(['word', 'whitespace', 'other'], tokenizer_handler);
		}//tokenizer_handler

	};

}