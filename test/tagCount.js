var fs = require('fs');
var path = require('path');
var Tokenizer = require('../lib/3kenizer').Tokenizer;

module.exports['html'] = test('html.html', null);

function test(file, expect){
	return function(beforeExit, assert){
		var tokens = {};
		var tags = {};

		var tokenizer = new Tokenizer();
		tokenizer.expressions = {
			'whitespace': /\s+/g
			, 'openTag':	/<\s*([A-Za-z0-9\:]+)\s*>/g
			, 'closeTag':	/<\s*\/([A-Za-z0-9\:]+)\s*>/g			
			, 'other': Tokenizer.specialExpressions.other
			, 'end': Tokenizer.specialExpressions.end
		}
		tokenizer.on('token', tokenizer_token);

		var readStream = fs.createReadStream(path.join('res' , file), {encoding: 'utf8'});
		readStream.on('close', readStream_close);

		beforeExit(function(){
			console.log(tokens);
			console.log(tags);
			assert.equal(tokens.end, 1);
		});

	
		parseDocument();

		readStream.pipe(tokenizer);


		function parseDocument(){
			var tags = [];

			parseNext();

			function parseNext(){
				if(tags.length === 0){
					tokenizer.addHandler(
						['whitespace', 'openTag', 'end', 'other']
						, handler
					);
				}
				else{
					tokenizer.addHandler(
						['whitespace', 'openTag', 'closeTag', 'other']
						, handler
					);
				}
			}//parseNext

			function handler(match, categories){
				tokenizer.addToken(match.category);

				switch(match.category){
					case 'end':
					tokenizer.addHandler([], null);
					break;

					case 'whitespace':
					case 'other':
					parseNext();
					break;

					case 'openTag':
					tokenizer.addToken('tag', match[1]);

					tags.push(match[1]);

					parseNext();
					break;

					case 'closeTag':
					if(tags.pop() !== match[1]) throw "tag '" + match[1] + "' not closed";

					parseNext();
					break;
				}
			}//handler


		}//parseDocument





		function tokenizer_token(token, tag){
			if(!(token in tokens)) tokens[token] = 0;
			tokens[token]++;

			if(token === 'tag'){
				if(!(tag in tags)) tags[tag] = 0;
				tags[tag]++;
			}
		}//tokenizer_token

		function readStream_close(){
			readStream.destroy();
			tokenizer.destroySoon();
		}//readStream_close


	};

}