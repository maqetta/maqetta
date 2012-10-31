define([
], function() {

/*
 * 
 * this class parses out the resource portion of a URL.  for example:
 * 
 * url('/something/something/1.jpg')
 */

var _REWRITE_REG_EX = /^\s*url\s*\(\s*(\'[^\'\"]*\'|\"[^\'\"]*\"|[^\'\"]*)\s*\)\s*$/;
var _STRIPQUOTES_REG_EX = /^[\'\"]?([^\'\"]*)[\'\"]?$/;
var _ABSOLUTE_REG_EX = /^(http|ftp)/;

return {
	
	isAbsolute : function(url){
		if(typeof url != 'string'){
			return false;
		}
		var urlInside = this.getUrl(url);
		if(urlInside){
			return _ABSOLUTE_REG_EX.test(urlInside);
		}else{
			return false;
		}
	},
	
	containsUrl: function(url){
		if(typeof url != 'string'){
			return false;
		}
		return _REWRITE_REG_EX.test(url);
	},
	
	replaceUrl: function(oldUrl, newUrl){
		if(typeof oldUrl != 'string' || typeof newUrl != 'string'){
			return null;
		}
		var urlInside = this.getUrl(oldUrl);
		if(urlInside){
			return 'url(\''+newUrl+'\')';
		}else{
			return null;
		}
	},
	
	/**
	 * Extract string that might be between (optional) matching single or double quotes
	 * @param {string} s  String that might appear in CSS url() function, might be quoted
	 * @returns {string}  Original 's', but stripping any quotes
	 */
	stripQuotes: function(s){
		var urlInside = s.replace(_STRIPQUOTES_REG_EX, '$1');
		return urlInside;
	},
	
	encodeURI : function(url){
	
		var pass1 = encodeURI(url);
		return pass1.replace(/#/g, "%23");
		
	},
	
	/**
	 * Extract actual url inside of a CSS url(...) function.
	 * If url doesn't match regex for url(...) function, return null
	 * @param {string} url  CSS url function, such as url('SampleBanner.jpg')
	 * @returns {string|null}  Returns actual url string inside the func (e.g., SampleBanner.jpg)
	 */
	getUrl: function(url){
		if(typeof url != 'string'){
			return null;
		}
		var matches = url.match(_REWRITE_REG_EX);
		if(matches && matches.length > 1){
			var match = matches[1];
			return this.stripQuotes(match);
		}else{
			return null;
		}
	}
	
	/*
	//Unit tests that can be run by copy/paste logic from this file into
	//an HTML file which serves as testing scaffold. Tests can be run by:
	//	var u = new URLRewrite();
	//	u.runTests();		
	,runTests: function(){
		var s = 'url(abc)';
		console.log('s='+s+',u.containsUrl(s)='+u.containsUrl(s));
		var s = ' url ( \'abc\' ) ';
		console.log('s='+s+',u.containsUrl(s)='+u.containsUrl(s));
		var s = ' url ( \"abc\" ) ';
		console.log('s='+s+',u.getUrl(s)='+u.getUrl(s));
		var s = ' url ( \"abc\" ) ';
		console.log('s='+s+',u.isAbsolute(s)='+u.isAbsolute(s));
		var s = ' url ( \"http://abc\" ) ';
		console.log('s='+s+',u.isAbsolute(s)='+u.isAbsolute(s));
		var s = 'abc';
		console.log('s='+s+',u.stripQuotes(s)='+u.stripQuotes(s));
		var s = '\'abc\'';
		console.log('s='+s+',u.stripQuotes(s)='+u.stripQuotes(s));
		var s = '\"abc\"';
		console.log('s='+s+',u.stripQuotes(s)='+u.stripQuotes(s));
		var s = '\"abc\'';
		console.log('s='+s+',u.stripQuotes(s)='+u.stripQuotes(s));
		var s = ' url ( \"www\" ) ';
		var t = 'def';
		console.log('s='+s+',t='+t+',u.replaceUrl(s,t)='+u.replaceUrl(s,t));
		var s = 'url(abc)';
		var t = 'def';
		console.log('s='+s+',t='+t+',u.replaceUrl(s,t)='+u.replaceUrl(s,t));
	}
	*/
	
};
	
});
