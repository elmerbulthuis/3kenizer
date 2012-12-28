var Tokenizer = require('../lib/3kenizer').Tokenizer;

module.exports['instance'] = function(beforeExit, assert){
	var tokenizer = new Tokenizer();

	assert.ok(tokenizer);
};
