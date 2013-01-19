var Tokenizer = require('../lib/3kenizer').Tokenizer;

module.exports['instantiate'] = function(beforeExit, assert){
	var tokenizer = new Tokenizer;

};


module.exports['instantiateError'] = function(beforeExit, assert){
	var tokenizer = null;
	
	assert.throws(function(){
		tokenizer = Tokenizer();
	});

};
