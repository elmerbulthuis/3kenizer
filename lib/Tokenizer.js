/*!
Tokenizer by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(global){

	if(typeof define === 'function' && define.amd){
		define(['events'], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(require('events'));
		return;
	}

	global.Tokenizer = definer(global.events);
	return;

	function definer(events){
		var EventEmitter = events.EventEmitter;

		Tokenizer.prototype = Object.create(EventEmitter.prototype, {
			constructor: {
				value: Tokenizer
				, enumerable: false
				, writable: true
				, configurable: true
			}
		});


		return Tokenizer;

		function Tokenizer(){
			if(this === global) throw "please use the 'new' keyword";
			
			events.EventEmitter.apply(this);

			var tokenizer = this;

		}//Tokenizer

	}//definer

})(this);
