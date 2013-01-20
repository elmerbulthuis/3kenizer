module.exports['re.global'] = function(beforeExit, assert){
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
};

module.exports['re.local'] = function(beforeExit, assert){
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

};

