define([
], function() {
	dojo.getObject("davinci.ve.utils.URLRewrite", true); // FIXME: shouldn't need this

	var URLRewrite = davinci.ve.utils.URLRewrite;

	/*
	 * 
	 * this class parses out the resource portion of a URL.  for example:
	 * 
	 * url('/something/something/1.jpg') will re
	 */
	
	
	URLRewrite._START_REG_EX =/url{1}\s*\(('|"){1}/i;
	URLRewrite._REWRITE_REG_EX =/url{1}\s*\(('|"){1}(.*)['"]\)/i;
	
	URLRewrite.getUrlStartOffset = function(url){
		if(url==null)
			return -1;
		var foundAt = url.search(davinci.ve.utils.URLRewrite._START_REG_EX);
		
		for(var i = foundAt;i<url.length;i++){
			if(url.charAt(i)=="'" || url.charAt(i)=="\"")
				return i+1;
			
		}
		
		return ;
	};
	
	URLRewrite.getUrlEndOffset = function(url){
		var start = davinci.ve.utils.URLRewrite.getUrlStartOffset(url);
		
		if(start<0) return start;
		var found = 0;
		
		for(var i = start+1;i<url.length;i++){
			if(url.charAt(i)=="'" || url.charAt(i)=="\"")
				return i;
			
		}
	};
	
	URLRewrite.containsUrl = function(url){
		if(url==null)
			return false;
		
		return url.search(davinci.ve.utils.URLRewrite._START_REG_EX) >-1 ;
		
	};
	
	URLRewrite.replaceUrl = function(oldUrl, newUrl){
		if(url==null)
			return false;
		
		return oldUrl.replace(davinci.ve.utils.URLRewrite._REWRITE_REG_EX, "url('"+ newUrl + "')")  ;
		
	};
	
	URLRewrite.getUrl = function(url){
		
		if(url==null)
			return null;
		
		
		var start = davinci.ve.utils.URLRewrite.getUrlStartOffset(url);
		var end = davinci.ve.utils.URLRewrite.getUrlEndOffset(url);
		
		return url.substring(start,end);
	};
	
});