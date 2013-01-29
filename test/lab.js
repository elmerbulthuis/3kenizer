var assert = require('assert');

describe('lab', function(){

	it('re.global', function(){
		var re = /\w+/g;
		var str = 'abc def ghi';
		var match;

		match = re.exec(str);
		assert.equal(match[0], 'abc');
		
		match = re.exec(str);
		assert.equal(match[0], 'def');

		match = re.exec(str);
		assert.equal(match[0], 'ghi');

		re.lastIndex = 3;
		match = re.exec(str);
		assert.equal(match[0], 'def');
	});

	it('re.local', function(){
		var re = /\w+/;
		var str = 'abc def ghi';
		var match;

		match = re.exec(str);
		assert.equal(match[0], 'abc');
		
		match = re.exec(str);
		assert.equal(match[0], 'abc');

		re.lastIndex = 0;
		match = re.exec(str);
		assert.equal(match[0], 'abc');

	});

	it('re instanceof', function(){
		var re = /\w+/;
		assert.ok(re instanceof RegExp);
	});


	it('str instanceof', function(){
		var str = "abc"
		assert.equal(typeof str, 'string');
	});

});