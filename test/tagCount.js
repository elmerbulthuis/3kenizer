var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Tokenizer = require('../.').Tokenizer;

describe('tagCount', function(){
	it('lorem', test('lorem.html', {
		html: 1
		, head: 1
		, title: 1
		, body: 1
		, br: 4
	}));
	it('r_and_j', test('r_and_j.xml', {
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
	}));
	it('smileys', test('smileys.html', {
		html: 1
		, head: 1
		, title: 1
		, body: 1
		, img: 2
	}, {
		src: 2
		, alt: 2
	}));
});


function test(file, expectTags, expectAttributes){
	return function(cb){
		var tokens = {};
		var attributes = {};
		var tags = {};

		var tokenizer = new Tokenizer();
		tokenizer.expressions = {
			'whitespace': /\s+/g
			, 'attributeBegin': /([A-Za-z0-9\:]+)="/g
			, 'attributeEnd': /"/g
			, 'tagBegin':	/<\s*([A-Za-z0-9\:]+)\s*/g
			, 'openTagEnd': /\s*>/
			, 'atomicTagEnd': /\s*\/>/
			, 'closeTag':	/<\s*\/([A-Za-z0-9\:]+)\s*>/g			
			, 'other': Tokenizer.specialExpressions.other
			, 'end': Tokenizer.specialExpressions.end
		}
		tokenizer.on('token', tokenizer_token);
		tokenizer.on('close', tokenizer_close);

		var readStream = fs.createReadStream(path.join('res' , file), {encoding: 'utf8'});
		readStream.on('close', readStream_close);

	
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
				['whitespace', 'openTagEnd', 'attributeBegin']
				, handleOpenTag
			);
		}//parseOpenTag

		function handleOpenTag(match, categories){
			tokenizer.addToken(match.category);

			switch(match.category){
				case 'whitespace':
				parseOpenTag();
				break;

				case 'attributeBegin':
				tokenizer.addToken('attribute', match[1]);

				parseOpenTagAttribute();
				break;

				case 'openTagEnd':
				parseNext();
				break;
			}
		}//handleOpenTag


		function parseOpenTagAttribute(){
			tokenizer.addHandler(
				['attributeEnd', 'other']
				, handleOpenTagAttribute
			);
		}//parseOpenTagAttribute

		function handleOpenTagAttribute(match, categories){
			tokenizer.addToken(match.category);

			switch(match.category){
				case 'other':
				parseOpenTagAttribute();
				break;

				case 'attributeEnd':
				parseOpenTag();
				break;
			}
		}//handleOpenTagAttribute


		function parseAtomicTag(){
			tokenizer.addHandler(
				['whitespace', 'atomicTagEnd', 'attributeBegin']
				, handleAtomicTag
			);
		}//parseAtomicTag

		function handleAtomicTag(match, categories){
			tokenizer.addToken(match.category);

			switch(match.category){
				case 'whitespace':
				parseAtomicTag();
				break;

				case 'attributeBegin':
				tokenizer.addToken('attribute', match[1]);

				parseAtomicTagAttribute();
				break;

				case 'atomicTagEnd':
				parseNext();
				break;

			}
		}//handleAtomicTag


		function parseAtomicTagAttribute(){
			tokenizer.addHandler(
				['attributeEnd', 'other']
				, handleAtomicTagAttribute
			);
		}//parseAtomicTagAttribute

		function handleAtomicTagAttribute(match, categories){
			tokenizer.addToken(match.category);

			switch(match.category){
				case 'other':
				parseAtomicTagAttribute();
				break;

				case 'attributeEnd':
				parseAtomicTag();
				break;
			}
		}//handleAtomicTagAttribute






		function tokenizer_token(token, name){
			if(!(token in tokens)) tokens[token] = 0;
			tokens[token]++;

			if(token === 'tag'){
				if(!(name in tags)) tags[name] = 0;
				tags[name]++;
			}
			
			if(token === 'attribute'){
				if(!(name in attributes)) attributes[name] = 0;
				attributes[name]++;
			}
		}//tokenizer_token

		function readStream_close(){
			readStream.destroy();
			tokenizer.destroySoon();
		}//readStream_close

		function tokenizer_close(){
			//console.log(tokens);
			//console.log(tags);
			//console.log(attributes);
			expectTags && assert.deepEqual(tags, expectTags);
			expectAttributes && assert.deepEqual(attributes, expectAttributes);
			assert.equal(tokens.end, 1);

			cb();
		}//tokenizer_close

	};

}