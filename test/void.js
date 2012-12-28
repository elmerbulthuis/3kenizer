module.exports['test'] = function(beforeExit, assert){
	beforeExit(function(){
		assert.equal(1, 1);
	});
};
