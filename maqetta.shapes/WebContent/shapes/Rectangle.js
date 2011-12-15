define([
    	"dojo/_base/declare",
    	"shapes/_Shape",
    	"shapes/_RectMixin"
], function(declare, _Shape, _RectMixin){
	
	return declare("shapes.Rectangle", [_Shape, _RectMixin], {
			
		width:null,
		defaultWidth:'80',
		height:null,
		defaultHeight:'80',
		cornerRadius:'0',	
		
		buildRendering: function(){
			this.inherited(arguments);			
			this.createGraphics();
		}

	});
});
