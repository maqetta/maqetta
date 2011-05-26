define(["dojo/_base/kernel","../DomInLine"], function(dojo,dddnl){
	dojo.getObject("dtl.HtmlInline", true, dojox);

	dojo.deprecated("dojox.dtl.html", "All packages and classes in dojox.dtl that start with Html or html have been renamed to Dom or dom");
	dojox.dtl.HtmlInline = dddnl;
	dojox.dtl.HtmlInline.prototype.declaredClass = "dojox.dtl.HtmlInline";
	return dojox.dtl.HtmlInline;
});