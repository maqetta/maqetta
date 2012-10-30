define([
    	"dojo/_base/declare",
    	"shapes/_Shape",
    	"shapes/_TextMixin"
], function(declare, _Shape, _TextMixin){
	
	return declare("shapes.Text", [_Shape, _TextMixin], {
			
		content:'Text',

		buildRendering: function(){
			this.inherited(arguments);	
			this.createGraphics();
		}

	});
});
