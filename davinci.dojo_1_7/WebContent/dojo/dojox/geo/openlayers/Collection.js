
define([ "dojox/geo/openlayers/Geometry" ], function(geometryArg){

	return dojo.declare("dojox.geo.openlayers.Collection", dojox.geo.openlayers.Geometry, {
		//	summary:
		//		A collection of geometries. _coordinates_ holds an array of geometries. 

		setGeometries : function(/* Array */g){
			//	summary: 
			//		Sets the geometries
			//	g: Array
			//		The array of geometries. 
			this.coordinates = g;
		},

		//	summary:
		//		Retrieves the geometries.
		//	returns: Array
		//		The array of geometries defining this collection.
		getGeometries : function(){
			return this.coordinates;
		}
	});
});
