define([
	"dojo/_base/declare",
	"dijit/_WidgetBase"
], function(declare, _WidgetBase){

	return declare("sketchboard._sketchboard", [_WidgetBase], {
		
		postCreate: function(){
			console.log('Sketchboard postCreate');
		}
	});
});
