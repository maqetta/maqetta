
define(["dojox/geo/openlayers/Geometry" ], function(geometryArg){

	return dojo.declare("dojox.geo.openlayers.Point", dojox.geo.openlayers.Geometry, {
		//	summary:
		//		A Point geometry handles description of points to be rendered in a GfxLayer

		setPoint : function(p){
			//	summary:
			//		Sets the point for this geometry.
			//	p : {x, y} Object
			//		The point geometry.
			this.coordinates = p;
		},


		getPoint : function(){		
			//	summary:
			//		Gets the point defining this geometry.
			//	returns: {x, y} Object
			//		The point defining this geometry.
			return this.coordinates;
		}
	});
});
