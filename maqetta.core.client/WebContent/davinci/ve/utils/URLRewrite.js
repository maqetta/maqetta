define([
], function() {

/*
 * 
 * this class parses out the resource portion of a URL.  for example:
 * 
 * url('/something/something/1.jpg') will re
 */

var _START_REG_EX = /url{1}\s*\(('|")?/i;
var _REWRITE_REG_EX = /url{1}\s*\(('|")?(.*)('|")?\)/i;
var _ABSOLUTE_REG_EX = /(http|ftp){1,}/i

return {
	
	
	getUrlStartOffset: function(url){
		if(typeof url != 'string')
			return -1;
		var foundAt = url.search(_START_REG_EX);
		
		for(var i = foundAt;i<url.length;i++){
			if(url.charAt(i)=="'" || url.charAt(i)=="\"" || url.charAt(i)=="(")
				return i+1;
			
		}
		
		return ;
	},
	
	isAbsolute : function(url){
		return url.search(_ABSOLUTE_REG_EX);
	},
	
	getUrlEndOffset: function(url){
		var start = this.getUrlStartOffset(url);
		
		if(start<0) return start;
		var found = 0;
		
		for(var i = start+1;i<url.length;i++){
			if(url.charAt(i)=="'" || url.charAt(i)=="\"" || url.charAt(i)==")")
				return i;
			
		}
	},
	
	containsUrl: function(url){
		if(typeof url != 'string')
			return false;
		
		return url.search(_START_REG_EX) >-1 ;
		
	},
	
	replaceUrl: function(oldUrl, newUrl){
		debugger;
		if(typeof url != 'string')
			return false;
		
		return oldUrl.replace(_REWRITE_REG_EX, "url('"+ newUrl + "')")  ;
		
	},
	
	getUrl: function(url){
		debugger;
		if(typeof url != 'string')
			return null;
		
		
		var start = this.getUrlStartOffset(url);
		var end = this.getUrlEndOffset(url);
		
		return url.substring(start,end);
	}
	
};
	
});