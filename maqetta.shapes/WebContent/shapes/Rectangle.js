define([
    	"dojo/_base/declare",
    	"shapes/_Shape",
    	"shapes/_RectMixin"
], function(declare, _Shape, _RectMixin){
	
	return declare("shapes.Rectangle", [_Shape, _RectMixin], {
			
		x:'0',
		y:'0',
		width:'80',
		height:'80',
		cornerRadius:'0',	

		buildRendering: function(){
			this.inherited(arguments);			
			this.createGraphics();
		}

	});
});
