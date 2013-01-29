var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Tokenizer = require('../.').Tokenizer;


describe('wordCount', function(){
	it('oneTwoThree', test('oneTwoThree.txt', 3));
	it('lorem', test('lorem.txt', 69));
	it('pg135', test('pg135.txt', 577599));
});


function test(file, expect){
	return function(cb){
		var counters = {};

		var tokenizer = new Tokenizer();
		tokenizer.expressions = {
			'word': /\w+/g
			, 'whitespace': /\s+/g
			, 'exclamation': '!'
			, 'question': '?'
			, 'other': Tokenizer.specialExpressions.other
			, 'end': Tokenizer.specialExpressions.end
		}
		var categories = ['question', 'exclamation', 'whitespace', 'word', 'end', 'other'];
		tokenizer.nextHandler(categories, tokenizer_handler);
		tokenizer.on('token', tokenizer_token);
		tokenizer.on('close', tokenizer_close);

		var readStream = fs.createReadStream(path.join('res' , file), {encoding: 'utf8'});
		readStream.on('close', readStream_close);

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
				case 'end':
				tokenizer.nextHandler([], function(){});
				break;

				default:
				tokenizer.nextHandler();
			}
		}//tokenizer_handler

		function tokenizer_close(){
			//console.log(counters);
			assert.equal(counters.word, expect);
			assert.equal(counters.end, 1);

			cb();
		}//tokenizer_close

	};

}