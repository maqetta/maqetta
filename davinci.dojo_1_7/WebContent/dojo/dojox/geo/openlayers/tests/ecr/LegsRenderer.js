// dojo.provide allows pages to use all of the types declared in this resource.
//dojo.provide("dojox.geo.openlayers.tests.ecr.LegsRenderer");

//dojo.require("dojox.geo.openlayers.tests.ecr.EcrRenderer");
//dojo.require("dojox.geo.openlayers.GeometryFeature");
//dojo.require("dojox.geo.openlayers.LineString");
//dojo.require("dojox.geo.openlayers.GreatCircle");

define([ "dojo/_base/array", "dojox/geo/openlayers/tests/ecr/EcrRenderer",
		"dojox/geo/openlayers/GeometryFeature", "dojox/geo/openlayers/LineString",
		"dojox/geo/openlayers/GreatCircle" ], function(){

	return dojo.declare("dojox.geo.openlayers.tests.ecr.LegsRenderer",
			[ dojox.geo.openlayers.tests.ecr.EcrRenderer ], {

				constructor : function(opts, context){
					this._geodetic = false;
					this._greatCircle = null;
				},

				setGeodetic : function(value){
					this._geodetic = value;
				},

				getGeodetic : function(){
					return this._geodetic;
				},

				_renderItem : function(o, item){
					var gf = null;
					if (o.type == "polyline") {
						var store = this.getContextValue('store');
						var stops = store.getValues(item, 'stops');
						var pts = [];
						var lastCoords = null;
						dojo.forEach(stops, function(it, index, array){
							if (store.isItem(it)) {
								var port = this.getValue(it, "port");
								var coords = this.getCoordinates(port);
								if (this.getGeodetic()) {
									if (lastCoords != null) {
										var current = {
											x : coords[0],
											y : coords[1]
										};
										var geodetic = dojox.geo.openlayers.GreatCircle.toPointArray(lastCoords,
												current, 5);
										pts = pts.concat(geodetic);
									}
								} else {
									var p = new dojox.geo.openlayers.Point({
										x : coords[0],
										y : coords[1]
									});
									pts.push(p);
								}
								lastCoords = {
									x : coords[0],
									y : coords[1]
								};
							}
						}, this);

						var g = new dojox.geo.openlayers.LineString(pts);
						gf = new dojox.geo.openlayers.GeometryFeature(g);
					}
					return gf;
				}
			});
});
