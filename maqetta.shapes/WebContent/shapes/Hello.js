define([
	"dojo/_base/declare",
	"shapes/Hello"
], function(declare, Hello){
	
	//	module:
	//		shapes/Hello
	//	summary:
	//		Drawing tools Hello
		
	return declare("shapes.Hello", [Hello], {
		// summary:
		// 		Hello world shapes widget
			
		postCreate: function(){
			this.inherited(arguments);
		}	

	});
});