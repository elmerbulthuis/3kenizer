/*!
3kenizer by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(){

	if(typeof define === 'function' && define.amd){
		define([
			'./lib/Tokenizer'
		], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(
			require('./lib/Tokenizer')
		);
		return;
	}

	throw "no AMD";

	function definer(
		Tokenizer
	){
		var global = this;

		return {
			Tokenizer: Tokenizer
		}		

	}//definer

})();
