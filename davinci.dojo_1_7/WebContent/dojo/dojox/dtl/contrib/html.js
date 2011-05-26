define(["dojo/_base/kernel","../contrib/dom"], function(dojo){
	dojo.getObject("dtl.contrib.html", true, dojox);

	dojo.deprecated("dojox.dtl.html", "All packages and classes in dojox.dtl that start with Html or html have been renamed to Dom or dom");
	return dojox.dtl.contrib.html;
});