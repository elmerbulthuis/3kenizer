var assert = require('assert');
var Tokenizer = require('../lib/3kenizer').Tokenizer;

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

