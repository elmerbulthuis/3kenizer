/*!
Tokenizer by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(){

	if(typeof define === 'function' && define.amd){
		define(['events'], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(require('events'));
		return;
	}

	throw "no AMD";


	function definer(
		events
	){
		var global = this;
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


			var options = {bufferSize: 1024, bufferLimit: 4096};
			var writeBuffer = '';
			var matches = [];
			var tracks = [];

			tokenizer.writable = true;
			tokenizer.write = write;
			tokenizer.end = end;
			tokenizer.destroy = destroy;
			tokenizer.destroySoon = destroySoon;

			function flush(bufferLimit){
				var tombstones = [];

				tracks.forEach(flushTrack, this);

				function flushTrack(track, trackIndex){
					tombstones.push(trackIndex);
				}//flushTrack

			}//flush

			function next(){

			}//next

			function write(data){
				if(!data) return true;

				while(data.length > 0)	{
					var chunk = data.substring(0, options.bufferLimit);
					data = data.substring(chunk.length);
					writeBuffer += chunk;
					if(writeBuffer.length > options.bufferLimit)	{
						flush(options.bufferSize);
					}
				}

				writeBuffer += data;

				return true;
			}//write

			function end(data){
				write(data);

				flush(0);

				tokenizer.writable = false;
			}//end

			function destroy(){
				tokenizer.writable = false;

				writeBuffer = null;

				tokenizer.emit('close');

				tokenizer.removeAllListeners();
			}//destroy

			function destroySoon(){
				flush(0);

				destroy();
			}//destroySoon

		}//Tokenizer

	}//definer

})();
