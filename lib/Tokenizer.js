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

		var specialExpressions = {
			end: {}
			, other: {}
		};

		Tokenizer.specialExpressions = specialExpressions;

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
			tokenizer.addToken = addToken;

			options = h.extend({
				bufferSize: 1024
				, bufferLimit: 4096
			}, options);


			function addHandler(categories, handler){
				var track = {
					categories: categories
					, handler: handler
					, previousTrack: currentTrack
					, position: (currentTrack ? currentTrack.match.position + currentTrack.match[0].length : writeBufferPosition)
					, tokens: []
				};
				tracks.push(track);
			}//addHandler

			function addToken(){
				currentTrack.tokens.push(Array.prototype.slice.apply(arguments));
			}//addToken

			function flush(targetSize){
		        while(tracks.length > 0 && writeBuffer.length - (tracks[0].position - writeBufferPosition) > targetSize) {
		        	handleTrack(tracks.shift());

					if(tracks.length == 1) flushTrack(tracks[0]);
		        }
			}//flush


			function handleTrack(track){
				var match = findMatch(track.categories, track.position);
				if(match){
					track.match = match;
					currentTrack = track;
					track.handler.call(this, match);
					currentTrack = null;
				}

			}//handleTrack

			function flushTrack(track){
				var previousTrack;
				var token;
				for(previousTrack = track.previousTrack; previousTrack; previousTrack = previousTrack.previousTrack){
					while(tokenArguments = previousTrack.tokens.shift()){
						tokenizer.emit.apply(tokenizer, ['token'].concat(tokenArguments));
					}
				}
				track.previousTrack = null;
				trimBuffer(tracks[0].position);
			}//flushTrack

			function trimBuffer(position){
				writeBuffer = writeBuffer.substring(position - writeBufferPosition);
				writeBufferPosition = position;
			}//trimBuffer

			function findMatch(categories, offsetPosition){
				var category, categoryIndex
				var categoryCount = categories.length;
				var match = null;
				
				for(categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++){
					category = categories[categoryIndex];
					match = findBetterMatch(category, offsetPosition, match);
					if(match && match.position === offsetPosition) return match;
				}

				return null;
			}//findMatch

			function findCategoryMatchByEnd(category, offsetPosition, lastMatch, expression){
				var match;

				match = h.extend([expression], {
					category:	category
					, position: totalLength
				});

				return match;
			}//findCategoryMatchByEnd

			function findCategoryMatchByOther(category, offsetPosition, lastMatch, expression){
				var match = null

				if(lastMatch){
					match = h.extend([writeBuffer.substring(offsetPosition - writeBufferPosition, lastMatch.position - writeBufferPosition)], {
						category:	category
						, position: offsetPosition
					});
				}

				return match;
			}//findCategoryMatchByOther

			function findCategoryMatchByString(category, offsetPosition, lastMatch, expression){
				var match = null;
				var bufferOffset = offsetPosition - writeBufferPosition;

				var index = expression === '' 
				? bufferOffset
				: writeBuffer.indexOf(expression, bufferOffset)
				;
				/*
				if we found the string (remember, ~-1 == 0) then
				create a match object
				*/
				if(~index)	{
					match = h.extend([expression], {
						category:	category
						, position: writeBufferPosition + index
					});
				}
				return match;
			}//findCategoryMatchByString

			function findCategoryMatchByRegExp(category, offsetPosition, lastMatch, expression){
				var bufferOffset = offsetPosition - writeBufferPosition;
				var match;

				if(expression.global) {
					expression.lastIndex = bufferOffset;
					match = expression.exec(writeBuffer);

					if(match)	{
						h.extend(match, {
							category:	category
							, position: writeBufferPosition + match.index
						});
					}
				}
				else{
					match = expression.exec(writeBuffer.substring(bufferOffset));

					if(match)	{
						h.extend(match, {
							category:	category
							, position: writeBufferPosition + bufferOffset + match.index
						});
					}
				}

				return match;
			}//findCategoryMatchByRegExp

			function findCategoryMatch(category, offsetPosition, lastMatch){
				var expression = tokenizer.expressions[category];

				if(expression === specialExpressions.end){
					return findCategoryMatchByEnd(category, offsetPosition, lastMatch, expression);
				}

				if(expression === specialExpressions.other){
					return findCategoryMatchByOther(category, offsetPosition, lastMatch, expression);
				}

				if(typeof expression === 'string'){
					return findCategoryMatchByString(category, offsetPosition, lastMatch, expression);
				}

				if(expression instanceof RegExp){
					return findCategoryMatchByRegExp(category, offsetPosition, lastMatch, expression);
				}

				throw 'invalid expression';
			}//findCategoryMatch

			function findBetterMatch(category, offsetPosition, lastMatch){
				var match = findCategoryMatch(category, offsetPosition, lastMatch);

				if(!lastMatch || (match && match.position < lastMatch.position)) return match;
				else return lastMatch;
			}//findBetterMatch

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
