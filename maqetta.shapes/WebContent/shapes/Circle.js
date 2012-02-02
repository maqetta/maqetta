define([
	"dojo/_base/declare",
	"shapes/_Shape",
	"shapes/_CircleMixin"
], function(declare, _Shape, _CircleMixin){
	
	return declare("shapes.Circle", [_Shape, _CircleMixin], {
			
		rx:null,
		defaultRx:'40',
		ry:null,
		defaultRy:'40',

		buildRendering: function(){
			this.inherited(arguments);	
			this.createGraphics();
		}

	});
});
