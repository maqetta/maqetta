define("dojox/mobile/dh/StringDataSource", [
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
			// summary:
			//		Returns the given text.			
			return this.text;
		}
	});
});
