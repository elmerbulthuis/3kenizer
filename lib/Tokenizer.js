/*!
Tokenizer by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(){

	if(typeof define === 'function' && define.amd){
		define(['events', './h'], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(require('events'), require('./h'));
		return;
	}

	throw "no AMD";


	function definer(
		events
		, h
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

		function Tokenizer(options){
			if(this === global) throw "please use the 'new' keyword";
			
			events.EventEmitter.apply(this);

			var tokenizer = this;


			/*
			all writes go directly into the writebuffer.
			*/
			var writeBuffer = '';
			
			/*
			This is the position in the stream that the buffer starts at, when
			the buffer is being trimed, this value will change.
			*/
			var writeBufferPosition = 0;

			/*
			Holds the currently active tracks
			*/
			var tracks = [];


			tokenizer.writable = true;
			tokenizer.write = write;
			tokenizer.end = end;
			tokenizer.destroy = destroy;
			tokenizer.destroySoon = destroySoon;
			tokenizer.expressions = {};
			tokenizer.addHandler = addHandler;

			options = h.extend({
				bufferSize: 1024
				, bufferLimit: 4096
			}, options);


			function addHandler(categories, handler){
				var track = {
					categories: categories
					, handler: handler
					, previousTrack: null
					, position: writeBufferPosition
					, token: null
				};
				tracks.push(track);
			}//addHandler

			function flush(){
				var track;

		        while(track = tracks.shift()) {
		        	handleTrack(track);

					if(tracks.length == 1) flushTrack(tracks[0]);
		        }

			}//flush


			function handleTrack(track){
				var bufferOffset = track.position - writeBufferPosition;
				var token = findToken(track.categories, bufferOffset);
				if(token && token.index === bufferOffset){
					track.token = token;
					track.handler.call(this, token, addNextHandler);
				}

				function addNextHandler(categories, handler){
					var nextTrack = {
						categories: categories
						, handler: handler
						, previousTrack: track
						, position: writeBufferPosition + token.index + token[0].length
						, token: null
					};
					tracks.push(nextTrack);
				}//addNextHandler
				
			}//handleTrack

			function flushTrack(track){
				track.previousTrack && flushTrack(track.previousTrack);
				if(track.token){
					tokenizer.emit('token', track.token);
				}
				track.previousTrack = null;
			}//flushTrack

			function findToken(categories, bufferOffset){
				var token = categories
				.map(function(category, categoryIndex){
					return findCategoryToken(category, bufferOffset);
				})
				.reduce(function(previous, current){
					if(!previous) return current;
					if(!current) return previous;
					if(current.index < previous.index) return current;
					return previous;
				}, null)
				;
				return token;
			}//findToken

			function findCategoryToken(category, bufferOffset){
				var expression = tokenizer.expressions[category];
				var token;
				var index;
				var match;

				if(typeof expression === 'string'){
					index = expression === '' 
					? bufferOffset
					: writeBuffer.indexOf(expression, bufferOffset)
					;
					/*
					if we found the string (remember, ~-1 == 0) then
					create a token object
					*/
					if(~index)	{
						token = h.extend([expression], {
							index:	index
							, category:	category
						});
					}

					return token;
				}

				if('exec' in expression && typeof expression.exec === 'function'){
					if(!expression.global) throw 'only global regexp are supported';

					expression.lastIndex = bufferOffset;
					match = expression.exec(writeBuffer);

					if(match)	{
						token = h.extend(match, {
							category:	category
						});
					}

					return token;
				}

				throw 'invalid expression';
			}//findCategoryToken

			function write(data){
				if(!data) return true;

				while(data.length > 0)	{
					var chunk = data.substring(0, options.bufferLimit);
					data = data.substring(chunk.length);
					writeBuffer += chunk;
				}
				writeBuffer += data;

				return true;
			}//write

			function end(data){
				write(data);

				flush();

				tokenizer.writable = false;
			}//end

			function destroy(){
				tokenizer.writable = false;

				writeBuffer = null;

				tokenizer.emit('close');

				//tokenizer.removeAllListeners();
			}//destroy

			function destroySoon(){
				flush();

				destroy();
			}//destroySoon

		}//Tokenizer

	}//definer

})();
