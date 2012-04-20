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
	
	getUrl: function(url){
		if(typeof url != 'string'){
			return null;
		}
		var matches = url.match(_REWRITE_REG_EX);
		if(matches && matches.length > 1){
			var match = matches[1];
			var urlInside = match.replace(_STRIPQUOTES_REG_EX, '$1');
			return urlInside;
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
