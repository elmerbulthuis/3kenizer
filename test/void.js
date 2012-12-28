var Tokenizer = require('../lib/3kenizer').Tokenizer;

module.exports['test'] = function(beforeExit, assert){
	assert.equal(1, 1);

	beforeExit(function(){
		assert.equal(1, 1);
	});
};
