define([
	"dojo/_base/declare",
	"shapes/_Shape",
	"shapes/_CircleMixin"
], function(declare, _Shape, _CircleMixin){
	
	return declare("shapes.Circle", [_Shape, _CircleMixin], {
			
<<<<<<< HEAD
		cx:'40',
		cy:'40',
		rx:'40',
		ry:'40',
=======
		rx:null,
		defaultRx:'40',
		ry:null,
		defaultRy:'40',
>>>>>>> master

		buildRendering: function(){
			this.inherited(arguments);	
			this.createGraphics();
		}

	});
});
