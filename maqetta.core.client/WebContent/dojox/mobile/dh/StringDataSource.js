define([
	"dojo/_base/declare"
], function(declare){

	// module:
	//		dojox/mobile/dh/StringDataSource
	// summary:
	//		A component that simply returns the given text.

	return declare("dojox.mobile.dh.StringDataSource", null, {
		text: "",

		constructor: function(/*String*/ text){
			this.text = text;
		},

		getData: function(){
			return this.text;
		}
	});
});
