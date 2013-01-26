var fs = require('fs');
var path = require('path');
var Tokenizer = require('../lib/3kenizer').Tokenizer;

module.exports['countOneTwoThree'] = test('oneTwoThree.txt', 3);
module.exports['countLorem'] = test('lorem.txt', 69);
module.exports['pg135'] = test('pg135.txt', 577599);

function test(file, expect){
	return function(beforeExit, assert){
		var counters = {};

		var tokenizer = new Tokenizer();
		tokenizer.expressions = {
			'word': /\w+/g
			, 'whitespace': /\s+/g
			, 'other': /[^\s\w]+/g
			, 'exclamation': '!'
			, 'question': '?'
			, 'eof': Tokenizer.EOF
		}
		var categories = ['question', 'exclamation', 'whitespace', 'word', 'other', 'eof'];
		tokenizer.addHandler(categories, tokenizer_handler);
		tokenizer.on('token', tokenizer_token);


		var readStream = fs.createReadStream(path.join('res' , file), {encoding: 'utf8'});
		readStream.on('close', readStream_close);

		beforeExit(function(){
			//console.log(counters);
			assert.equal(counters.word, expect);
			assert.equal(counters.eof, 1);
		});

		readStream.pipe(tokenizer);

		function tokenizer_token(token){
			if(!(token in counters)) counters[token] = 0;
			counters[token]++;
		}//tokenizer_token

		function readStream_close(){
			readStream.destroy();
			tokenizer.destroySoon();
		}//readStream_close

		function tokenizer_handler(match){
			tokenizer.addToken(match.category);
			switch(match.category){
				case 'eof':
				tokenizer.addHandler([], null);
				break;

				default:
				tokenizer.addHandler(categories, tokenizer_handler);
			}
		}//tokenizer_handler

	};

}