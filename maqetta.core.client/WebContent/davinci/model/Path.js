define([
	"dojo/_base/declare"
], function(declare) {

if ( typeof davinci.model === "undefined" ) { davinci.model = {}; }
if ( typeof davinci.model.Path === "undefined" ) { davinci.model.Path = {}; }

var Path = declare("davinci.model.Path", null, {

	/**
	 * @class davinci.model.Path
	 * @constructor     
	 */
	constructor: function(path, hasLeading, hasTrailing) {
		path = path || '.';  // if empty string, use '.'
		if (typeof path == 'string') {
			this.path = path;
			this.getSegments();
		} else {
			this.segments = path;
			this.hasLeading = hasLeading;
			this.hasTrailing = hasTrailing;
		}
	},

	endsWith: function(tail) {
		var segments = dojo.clone(this.segments);
		var tailSegments = (new Path(tail)).getSegments();
		while (tailSegments.length > 0 && segments.length > 0) {
			if (tailSegments.pop() != segments.pop()) {
				return false;
			}
		}
		return true;
	},

	getExtension: function() {
		if (!this.extension) {
			this.extension = this.path.substr(this.path.lastIndexOf('.')+1);
		}
		return this.extension;
	},

	segment : function(index){
		var segs = this.getSegments();
		if(segs.length < index) return null;
		return segs[index];
	},
	
	getSegments: function() {
		if (!this.segments) {
			var path = this.path;
			this.segments = path.split('/');
			if (path.charAt(0) == '/') {
				this.hasLeading = true;
			}
			if (path.charAt(path.length-1) == '/') {
				this.hasTrailing = true;
				// If the path ends in '/', split() will create an array whose last element
				// is an empty string. Remove that here.
				this.segments.pop();
			}
			this._canonicalize();
		}
		return this.segments;
	},

	isAbsolute: function(  ) {
		return this.hasLeading;
	},

	getParentPath: function() {
		if (!this._parentPath) {
			var parentSegments = dojo.clone(this.segments);
			parentSegments.pop();
			this._parentPath = new Path(parentSegments, this.hasLeading);
		}
		return dojo.clone(this._parentPath);
	},

	_clone: function() {
		return new Path(dojo.clone(this.segments), this.hasLeading, this.hasTrailing);
	},

	append: function(tail) {
		tail = tail || "";
		if (typeof tail == 'string') {
			tail = new Path(tail);
		}
		if (tail.isAbsolute()) {
			return tail;
		}
		var mySegments = this.segments;
		var tailSegments = tail.getSegments();
		var newSegments = mySegments.concat(tailSegments);
		var result = new Path(newSegments, this.hasLeading, tail.hasTrailing);
		if (tailSegments[0] == ".." || tailSegments[0] == ".") { 
			result._canonicalize();
		}
		return result;
	},

	toString: function() {
		var result = [];
		if (this.hasLeading) {
			result.push('/');
		}
		for (var i=0; i<this.segments.length; i++) {
			if (i > 0) {
				result.push('/');
			}
			result.push(this.segments[i]);
		}
		if (this.hasTrailing) {
			result.push('/');
		}
		return result.join("");
	},

	removeRelative : function(){
		var segs = this.getSegments();
		if(segs.length > 0 && segs[1]==".")
			return this.removeFirstSegments(1);
		return this;
	},
	
	relativeTo: function(base, ignoreFilename) {
		if (typeof base == 'string') {
			base = new Path(base);
		}
		var mySegments = this.segments;
		if (this.isAbsolute()) {
			return this;
		}
		var baseSegments = base.getSegments();
		var commonLength = this.matchingFirstSegments(base);
		var baseSegmentLength = baseSegments.length;
		if (ignoreFilename) {
			baseSegmentLength = baseSegmentLength -1;
		}
		var differenceLength = baseSegmentLength - commonLength;
		var newSegmentLength = differenceLength + mySegments.length - commonLength;
		if (newSegmentLength == 0) {
			return davinci.model.Path.EMPTY;
		}
		var newSegments = [];
		for (var i=0; i<differenceLength; i++) {
			newSegments.push('..');
		}
		for (var i=commonLength; i<mySegments.length; i++) {
			newSegments.push(mySegments[i]);
		}
		return  new Path(newSegments, false, this.hasTrailing);
	},

	startsWith: function(anotherPath) {
		var count = this.matchingFirstSegments(anotherPath);
		return anotherPath._length() == count;
	},

	_length: function(anotherPath) {
		return this.segments.length;
	},

	matchingFirstSegments: function(anotherPath) {
		var mySegments = this.segments;
		var pathSegments = anotherPath.getSegments();
		var max = Math.min(mySegments.length, pathSegments.length);
		var count = 0;
		for (var i = 0; i < max; i++) {
			if (mySegments[i] != pathSegments[i]) {
				return count;
			}
			count++;
		}
		return count;
	},

	removeFirstSegments: function(count) {
		return new Path(this.segments.slice(count, this.segments.length), this.hasLeading, this.hasTrailing);
	},

	removeMatchingLastSegments: function(anotherPath) {
		var match = this.matchingFirstSegments(anotherPath);
		return this.removeLastSegments(match);
	},

	removeMatchingFirstSegments: function(anotherPath) {
		var match = this.matchingFirstSegments(anotherPath);
		return this._clone().removeFirstSegments(match);
	},

	removeLastSegments: function(count) {
		if(!count) {
			count = 1;
		}
		return new Path(this.segments.slice(0, this.segments.length-count), this.hasLeading, this.hasTrailing);
	},

	lastSegment: function() {
		return this.segments[this.segments.length-1];
	},

	firstSegment: function(length) {
		return this.segments[length || 0];
	},

	equals: function(anotherPath) {
		if (this.segments.length != anotherPath.segments.length) {
			return false;
		}
		for (var i=0; i<this.segments.length; i++) {
			if (anotherPath.segments[i] != this.segments[i]) {
				return false;
			};
		}
		return true;
	},

	_canonicalize: function() {
		
		var doIt;
		var segments = this.segments;
		for (var i=0; i<segments.length; i++) {
			if (segments[i] == "." || segments[i] == "..") {
				doIt = true; 
				break;
			}
		}
		if (doIt) {
			var stack = [];
			for (var i = 0; i < segments.length; i++) {
				if (segments[i] == "..") {
					if (stack.length == 0) {
						// if the stack is empty we are going out of our scope 
						// so we need to accumulate segments.  But only if the original
						// path is relative.  If it is absolute then we can't go any higher than
						// root so simply toss the .. references.
						if (!this.hasLeading) {
							stack.push(segments[i]); //stack push
						}
					} else {
						// if the top is '..' then we are accumulating segments so don't pop
						if (".." == stack[stack.length - 1]) {
							stack.push("..");
						} else {
							stack.pop();
						}
					}
					//collapse current references
				} else if (segments[i] != "." || this.segments.length == 1) {
					stack.push(segments[i]); //stack push
				}
			}
			//if the number of segments hasn't changed, then no modification needed
			if (stack.length == segments.length) {
				return;
			}
			this.segments = stack;
		}
	}

});
	davinci.model.Path.EMPTY = new Path(""); 
	return Path;
});