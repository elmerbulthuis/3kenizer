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

		var EOF = {};

		Tokenizer.EOF = EOF;

		return Tokenizer;

		function Tokenizer(options){
			if(this === global) throw "please use the 'new' keyword";
			
			events.EventEmitter.apply(this);

			var tokenizer = this;


			/*
			all writes go directly into the writeBuffer.
			*/
			var writeBuffer = '';
			
			/*
			This is the position in the stream that the buffer starts at, when
			the buffer is being trimed, this value will change.
			*/
			var writeBufferPosition = 0;

			/*
			Total length of the stream
			*/
			var totalLength = 0;

			/*
			Holds the currently active tracks
			*/
			var tracks = [];

			var currentTrack = null;

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
					, previousTrack: currentTrack
					, position: writeBufferPosition + (currentTrack ? currentTrack.token.index + currentTrack.token[0].length : 0)
					, token: null
				};
				tracks.push(track);
			}//addHandler

			function flush(targetSize){
		        while(tracks.length > 0 && writeBuffer.length - (tracks[0].position - writeBufferPosition) > targetSize) {
		        	handleTrack(tracks.shift());

					if(tracks.length == 1) flushTrack(tracks[0]);
		        }
			}//flush


			function handleTrack(track){
				var token = findToken(track.categories, track.position);
				if(token && token.position == track.position){
					track.token = token;
					currentTrack = track;
					track.handler.call(this, token);
					currentTrack = null;
				}

			}//handleTrack

			function flushTrack(track){
				for(var previousTrack = track.previousTrack; previousTrack; previousTrack = previousTrack.previousTrack){
					tokenizer.emit('token', previousTrack.token);
				}
				track.previousTrack = null;
				writeBuffer = writeBuffer.substring(tracks[0].position - writeBufferPosition);
				writeBufferPosition = tracks[0].position;
			}//flushTrack

			function findToken(categories, offsetPosition){
				var token = categories
				.map(function(category, categoryIndex){
					return findCategoryToken(category, offsetPosition);
				})
				.reduce(function(previous, current){
					if(!previous) return current;
					if(!current) return previous;
					if(current.position < previous.position) return current;
					return previous;
				}, null)
				;
				return token;
			}//findToken

			function findCategoryTokenByEOF(category, offsetPosition, expression){
				var token = null;

				if(offsetPosition == totalLength){
					token = h.extend([expression], {
						category:	category
						, position: writeBufferPosition
					});
				}

				return token;
			}//findCategoryTokenByEOF

			function findCategoryTokenByString(category, offsetPosition, expression){
				var token = null;
				var bufferOffset = offsetPosition - writeBufferPosition;

				var index = expression === '' 
				? bufferOffset
				: writeBuffer.indexOf(expression, bufferOffset)
				;
				/*
				if we found the string (remember, ~-1 == 0) then
				create a token object
				*/
				if(~index)	{
					token = h.extend([expression], {
						category:	category
						, position: writeBufferPosition + index
					});
				}

				return token;
			}//findCategoryTokenByString

			function findCategoryTokenByRegExp(category, offsetPosition, expression){
				var token = null;
				var bufferOffset = offsetPosition - writeBufferPosition;

				if(!expression.global) throw 'only global regexp are supported';

				expression.lastIndex = bufferOffset;
				var match = expression.exec(writeBuffer);

				if(match)	{
					token = h.extend(match, {
						category:	category
						, position: writeBufferPosition + match.index
					});
				}

				return token;
			}//findCategoryTokenByRegExp

			function findCategoryToken(category, offsetPosition){
				var expression = tokenizer.expressions[category];

				if(expression === EOF){
					return findCategoryTokenByEOF(category, offsetPosition, expression);
				}

				if(typeof expression === 'string'){
					return findCategoryTokenByString(category, offsetPosition, expression);
				}

				if(expression instanceof RegExp){
					return findCategoryTokenByRegExp(category, offsetPosition, expression);
				}

				throw 'invalid expression';
			}//findCategoryToken

			function write(data){
				var chunk;

				if(!data) return true;

				while(data.length > 0)	{
					chunk = data.substring(0, options.bufferLimit);
					data = data.substring(chunk.length);
					writeBuffer += chunk;
					totalLength += chunk.length;
					flush(options.bufferSize);
				}
				writeBuffer += data;
				totalLength += data.length;

				return true;
			}//write

			function end(data){
				write(data);

				flush(-1);

				tokenizer.writable = false;
			}//end

			function destroy(){
				tokenizer.writable = false;

				writeBuffer = null;

				tokenizer.emit('close');

				//tokenizer.removeAllListeners();
			}//destroy

			function destroySoon(){
				flush(-1);

				destroy();
			}//destroySoon

		}//Tokenizer

	}//definer

})();
