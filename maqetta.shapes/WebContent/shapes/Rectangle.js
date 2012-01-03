define([
    	"dojo/_base/declare",
    	"shapes/_Shape",
    	"shapes/_RectMixin"
], function(declare, _Shape, _RectMixin){
	
	return declare("shapes.Rectangle", [_Shape, _RectMixin], {
			
<<<<<<< HEAD
		x:'0',
		y:'0',
		width:'80',
		height:'80',
		cornerRadius:'0',	

=======
		width:null,
		defaultWidth:'80',
		height:null,
		defaultHeight:'80',
		cornerRadius:'0',	
		
>>>>>>> master
		buildRendering: function(){
			this.inherited(arguments);			
			this.createGraphics();
		}

	});
});
