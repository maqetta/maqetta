//dojo.provide allows pages to use all of the types declared in this resource.
//dojo.provide("dojox.geo.openlayers.tests.ecr.PortRenderer");
//dojo.require("dojox.geo.openlayers.Point");

//dojo.require("dojox.geo.openlayers.tests.ecr.EcrRenderer");
//dojo.require("dojox.geo.openlayers.GeometryFeature");
//dojo.require("dojox.geo.openlayers.Geometry");

define([ "dojox/geo/openlayers/tests/ecr/EcrRenderer", "dojox/geo/openlayers/GeometryFeature",
		"dojox/geo/openlayers/Point"], function(){

	return dojo.declare("dojox.geo.openlayers.tests.ecr.PortRenderer",
			[ dojox.geo.openlayers.tests.ecr.EcrRenderer ], {

				constructor : function(opts, context){},

				_renderItem : function(o, item){
					var gf = null;
					if (o.type == "circle") {
						var coords = this.getCoordinates(item);
						var g = new dojox.geo.openlayers.Point({
							x : coords[0],
							y : coords[1]
						});
						gf = new dojox.geo.openlayers.GeometryFeature(g);
						gf.setShapeProperties({
							r : o.radius
						});
					}
					return gf;
				}
			});
});
