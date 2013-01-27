var fs = require('fs');
var path = require('path');
var Tokenizer = require('../lib/3kenizer').Tokenizer;

module.exports['lorem'] = test('lorem.html', {
	html: 1
	, head: 1
	, title: 1
	, body: 1
	, br: 4
});
module.exports['r_and_j'] = test('r_and_j.xml', {
	PLAY: 1
	, TITLE: 33
	, FM: 1
	, P: 4
	, PERSONAE: 1
	, PERSONA: 25
	, PGROUP: 3
	, GRPDESCR: 3
	, SCNDESCR: 1
	, PLAYSUBT: 1
	, ACT: 5
	, PROLOGUE: 2
	, SPEECH: 841
	, SPEAKER: 841
	, LINE: 3093
	, SCENE: 24
	, STAGEDIR: 202
});

function test(file, expect){
	return function(beforeExit, assert){
		var tokens = {};
		var tags = {};

		var tokenizer = new Tokenizer();
		tokenizer.expressions = {
			'whitespace': /\s+/g
			, 'tagBegin':	/<\s*([A-Za-z0-9\:]+)\s*/g
			, 'openTagEnd': /\s*>/
			, 'atomicTagEnd': /\s*\/>/
			, 'closeTag':	/<\s*\/([A-Za-z0-9\:]+)\s*>/g			
			, 'other': Tokenizer.specialExpressions.other
			, 'end': Tokenizer.specialExpressions.end
		}
		tokenizer.on('token', tokenizer_token);

		var readStream = fs.createReadStream(path.join('res' , file), {encoding: 'utf8'});
		readStream.on('close', readStream_close);

		beforeExit(function(){
			//console.log(tokens);
			//console.log(tags);
			assert.deepEqual(tags, expect);
			assert.equal(tokens.end, 1);
		});

	
		parseNext();

		readStream.pipe(tokenizer);



		function parseNext(){
			tokenizer.addHandler(
				['whitespace', 'tagBegin', 'closeTag', 'end', 'other']
				, handleNext
			);
		}//parseNext
		
		function handleNext(match, categories){
			tokenizer.addToken(match.category);

			switch(match.category){
				case 'end':
				tokenizer.addHandler([], null);
				break;

				case 'whitespace':
				case 'other':
				parseNext();
				break;

				case 'tagBegin':
				tokenizer.addToken('tag', match[1]);

				parseOpenTag();
				parseAtomicTag();
				break;

				case 'closeTag':
				parseNext();
				break;
			}
		}//handleNext


		function parseOpenTag(){
			tokenizer.addHandler(
				['whitespace', 'openTagEnd']
				, handleOpenTag
			);
		}//parseOpenTag

		function handleOpenTag(match, categories){
			tokenizer.addToken(match.category);

			switch(match.category){
				case 'whitespace':
				parseOpenTag();
				break;

				case 'openTagEnd':
				parseNext();
				break;
			}
		}//handleOpenTag


		function parseAtomicTag(){
			tokenizer.addHandler(
				['whitespace', 'atomicTagEnd']
				, handleAtomicTag
			);
		}//parseAtomicTag

		function handleAtomicTag(match, categories){
			tokenizer.addToken(match.category);

			switch(match.category){
				case 'whitespace':
				parseAtomicTag();
				break;

				case 'atomicTagEnd':
				parseNext();
				break;
			}
		}//handleAtomicTag






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