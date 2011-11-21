define([
	"dojo/_base/declare",
	"dijit/_WidgetBase"
], function(declare, _WidgetBase){
	
	//	module:
	//		shapes/Hello
	//	summary:
	//		Drawing tools Hello
		
	return declare("shapes.Hello", [_WidgetBase], {
		// summary:
		// 		Hello world shapes widget
			
		postCreate: function(){
			this.inherited(arguments);
		}	

	});
});