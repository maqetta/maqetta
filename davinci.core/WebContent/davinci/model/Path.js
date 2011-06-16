dojo.provide("davinci.model.Path");

/**
 * @class davinci.model.Path
   * @constructor     
 */
davinci.model.Path= function(path,hasLeading,hasTrailing){
    path = path || '.';  // if empty string, use '.'
	if (typeof path=='string') {
	    this.path = path;
		this.getSegments();
	} else {
		this.segments=path;
		this.hasLeading=hasLeading;
		this.hasTrailing=hasTrailing;
	}
	
}

davinci.model.Path.prototype.endsWith = function( tail  ){
	
	var segments = dojo.clone(this.segments);
	var tailSegments = (new davinci.model.Path(tail)).getSegments();
	
	while(tailSegments.length>0 && segments.length>0){
		if(tailSegments.pop()!=segments.pop()) return false;
	}
	
	return true;
}

davinci.model.Path.prototype.getExtension = function(  ){
	if (!this.extension)
	{
		this.extension=this.path.substr(this.path.lastIndexOf('.')+1);
	}
	return this.extension;
}

davinci.model.Path.prototype.getSegments = function() {
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
};

davinci.model.Path.prototype.isAbsolute = function(  ){
	return this.hasLeading;
}

davinci.model.Path.prototype.getParentPath = function(  ){
	if (!this._parentPath){
		var parentSegments=dojo.clone(this.segments);
		parentSegments.pop();
		this._parentPath= new davinci.model.Path(parentSegments,this.hasLeading);
	}
	return dojo.clone(this._parentPath);
}


davinci.model.Path.prototype.append = function( tail ){
	if (typeof tail == 'string')
		tail=new davinci.model.Path(tail);
	if (tail.isAbsolute())
		return tail;
	var mySegments=this.segments;
	var tailSegments=tail.getSegments();
	var newSegments = mySegments.concat(tailSegments);
	var result=new davinci.model.Path(newSegments,this.hasLeading,tail.hasTrailing);
	
	if (tailSegments[0]==".." || tailSegments[0]==".") { //$NON-NLS-1$ //$NON-NLS-2$
		result._canonicalize();
	}
	return result;
 
}

davinci.model.Path.prototype.toString = function(  ){
  var result=[];
  if (this.hasLeading)
	  result.push('/');
  for (var i=0;i<this.segments.length;i++)
  {
	  if (i>0)
		  result.push('/');
	  result.push(this.segments[i]);
  }
  if (this.hasTrailing)
	  result.push('/');
   return result.join("");
}


davinci.model.Path.prototype.relativeTo = function(base, ignoreFilename  ){
	if (typeof base == 'string')
		base=new davinci.model.Path(base);	
	var mySegments=this.segments;
	if (this.isAbsolute())
		return this;
	var baseSegments=base.getSegments();
//	//can't make relative if devices are not equal
//	if (device != base.getDevice() && (device == null || !device.equalsIgnoreCase(base.getDevice())))
//		return this;
	var commonLength = this.matchingFirstSegments(base);
	//var differenceLength = baseSegments.length - commonLength;
	var baseSegmentLength = baseSegments.length;
	if (ignoreFilename){
		baseSegmentLength = baseSegmentLength -1;
	}
	var differenceLength = baseSegmentLength - commonLength;
	var newSegmentLength = differenceLength + mySegments.length - commonLength;
	if (newSegmentLength == 0)
		return davinci.model.Path.EMPTY;
	var newSegments = [];
	for (var i=0;i<differenceLength;i++)
		newSegments.push('..');
	for (var i=commonLength;i<mySegments.length;i++)
		newSegments.push(mySegments[i]);
	return  (  new davinci.model.Path(newSegments,false,this.hasTrailing));
}

davinci.model.Path.prototype.matchingFirstSegments = function(anotherPath  ){
	var mySegments=this.segments;
	var pathSegments=anotherPath.getSegments();
	var max = Math.min(mySegments.length, pathSegments.length);
	var count = 0;
	for (var i = 0; i < max; i++) {
		if (mySegments[i]!=pathSegments[i]) {
			return count;
		}
		count++;
	}
	return count;
}
davinci.model.Path.prototype.removeFirstSegments = function(count  ){
    this.segments=this.segments.slice(count, this.segments.length);
}

davinci.model.Path.prototype.removeLastSegments = function(count  ){
	
	if(!count)
		count = 1;
    this.segments=this.segments.slice(0, this.segments.length-count);
    return this;
}

davinci.model.Path.prototype.lastSegment = function(  ){
	return this.segments[this.segments.length-1];
	
}

davinci.model.Path.prototype._canonicalize = function(  ){
	var doIt;
	var segments=this.segments;
   for (var i=0;i<segments.length;i++)
	   if (segments[i]=='.' || segments[i]=='..')
	   {doIt=true; break;}
   if (doIt)
   {
		var stack = [];
		for (var i = 0; i < segments.length; i++) {
			if (segments[i]=="..") { //$NON-NLS-1$
				if (stack.length == 0) {
					// if the stack is empty we are going out of our scope 
					// so we need to accumulate segments.  But only if the original
					// path is relative.  If it is absolute then we can't go any higher than
					// root so simply toss the .. references.
					if (!this.hasLeading)
						stack.push(segments[i]); //stack push
				} else {
					// if the top is '..' then we are accumulating segments so don't pop
					if (".."== stack[stack.length - 1]) //$NON-NLS-1$
						stack.push(".."); //$NON-NLS-1$
					else
						stack.pop();
					//stack pop
				}
				//collapse current references
			} else if (segments[i]!="."  || this.segments.length == 1) //$NON-NLS-1$
				stack.push(segments[i]); //stack push
		}
		//if the number of segments hasn't changed, then no modification needed
		if (stack.length == segments.length)
			return;
		this.segments=stack;

   }
}
davinci.model.Path.EMPTY=new davinci.model.Path("");