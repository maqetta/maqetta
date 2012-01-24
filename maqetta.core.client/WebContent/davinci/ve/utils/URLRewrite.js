define([
], function() {

	/*
	 * 
	 * this class parses out the resource portion of a URL.  for example:
	 * 
	 * url('/something/something/1.jpg') will re
	 */
	
	return {
		
		_START_REG_EX: /url{1}\s*\(('|"){1}/i,
		_REWRITE_REG_EX: /url{1}\s*\(('|"){1}(.*)['"]\)/i,
		
		getUrlStartOffset: function(url){
			if(url==null)
				return -1;
			var foundAt = url.search(this._START_REG_EX);
			
			for(var i = foundAt;i<url.length;i++){
				if(url.charAt(i)=="'" || url.charAt(i)=="\"")
					return i+1;
				
			}
			
			return ;
		},
		
		getUrlEndOffset: function(url){
			var start = this.getUrlStartOffset(url);
			
			if(start<0) return start;
			var found = 0;
			
			for(var i = start+1;i<url.length;i++){
				if(url.charAt(i)=="'" || url.charAt(i)=="\"")
					return i;
				
			}
		},
		
		containsUrl: function(url){
			if(url==null)
				return false;
			
			return url.search(this._START_REG_EX) >-1 ;
			
		},
		
		replaceUrl: function(oldUrl, newUrl){
			if(url==null)
				return false;
			
			return oldUrl.replace(this._REWRITE_REG_EX, "url('"+ newUrl + "')")  ;
			
		},
		
		getUrl: function(url){
			
			if(url==null)
				return null;
			
			
			var start = this.getUrlStartOffset(url);
			var end = this.getUrlEndOffset(url);
			
			return url.substring(start,end);
		}
		
	};
	
});