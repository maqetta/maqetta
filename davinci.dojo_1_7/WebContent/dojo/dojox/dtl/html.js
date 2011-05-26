define(["dojo/_base/kernel","./dom"], function(dojo,ddd){
	dojo.getObject("dtl.html", true, dojox);

	dojo.deprecated("dojox.dtl.html", "All packages and classes in dojox.dtl that start with Html or html have been renamed to Dom or dom");
	dojox.dtl.HtmlTemplate = ddd.DomTemplate;
	return dojox.dtl.html;
});