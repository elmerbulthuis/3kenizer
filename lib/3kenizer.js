/*!
3kenizer by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(global){

	if(typeof define === 'function' && define.amd){
		define([
			'./Tokenizer'
		], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(
			require('./Tokenizer')
		);
		return;
	}

	global['3kenizer'] = definer(
		global.Tokenizer
	);
	return;



	function definer(
		Tokenizer
	){

		return {
			Tokenizer: Tokenizer
		}		

	}//definer

})(this);
