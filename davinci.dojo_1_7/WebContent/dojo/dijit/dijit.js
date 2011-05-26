define([
	"dojo",
	".",
	"./_base",
	"dojo/parser",
	"./_Widget",
	"./_TemplatedMixin",
	"./_Container",
	"./layout/_LayoutWidget",
	"./form/_FormWidget"], function(dojo, dijit){

	// module:
	//		dijit/dijit
	// summary:
	//		A roll-up for common dijit methods
	//		All the stuff in _base (these are the function that are guaranteed available without an explicit dojo.require)
	//		And some other stuff that we tend to pull in all the time anyway

	return dijit;
});
