var assert = require('assert');
var Tokenizer = require('../.').Tokenizer;

describe('class', function(){
	
	it('instantiate without problems', function(){
		var tokenizer = new Tokenizer;
	});

	it('instantiation requires new keyword', function(){
		var tokenizer = null;
		
		assert.throws(function(){
			tokenizer = Tokenizer();
		});
	});

});

