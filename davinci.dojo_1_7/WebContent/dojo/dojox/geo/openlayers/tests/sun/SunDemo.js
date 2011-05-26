// dojo.provide allows pages to use all of the types declared in this resource.
//dojo.provide("dojox.geo.openlayers.tests.sun.SunDemo");

//dojo.require("dojox.geo.openlayers.tests.sun.Sun");

//dojo.require("dojox.geo.openlayers.widget.Map");
//dojo.require("dojox.geo.openlayers.GfxLayer");
//dojo.require("dojox.geo.openlayers.GeometryFeature");
//dojo.require("dojox.geo.openlayers.LineString");
//dojo.require("dojox.geo.openlayers.Point");
//dojo.require("dojox.geo.openlayers.JsonImport");

define([ "dojox/geo/openlayers/tests/sun/Sun", "dojox/geo/openlayers/widget/Map",
		"dojox/geo/openlayers/GfxLayer", "dojox/geo/openlayers/GeometryFeature",
		"dojox/geo/openlayers/LineString", "dojox/geo/openlayers/Point",
		"dojox/geo/openlayers/JsonImport" ], function(){

	return dojo.declare("dojox.geo.openlayers.tests.sun.SunDemo", [], {

		constructor : function(div){

			var options = {
				name : "TheMap",
				touchHandler : true
			};

			var map = new dojox.geo.openlayers.widget.Map();
			dojo.place(map.domNode, div);
			map.startup();
			map.map.fitTo([ -160, 70, 160, -70 ]);
			this.map = map;

			this.sun = new dojox.geo.openlayers.tests.sun.Sun();
			var layer = new dojox.geo.openlayers.GfxLayer();

			var f = this.twilightZone({
				x1 : -180,
				y1 : 85,
				x2 : 180,
				y2 : -85
			});
			layer.addFeature(f);

			f = this.createStar();
			layer.addFeature(f);

			f = this.createSun();
			layer.addFeature(f);

			this.map.map.addLayer(layer);

		},

		twilightZone : function(clip){
			var tz = this.sun.twilightZone(clip);
			var g = new dojox.geo.openlayers.LineString(tz);
			var gf = new dojox.geo.openlayers.GeometryFeature(g);
			gf.setStroke([ 248, 236, 56 ]);
			gf.setFill([ 252, 251, 45, 0.3 ]);
			return gf;
		},

		makeStarShape : function(r1, r2, b){
			var TPI = Math.PI * 2;
			var di = TPI / b;
			var s = null;
			var start = Math.PI;
			var end = start + TPI;
			for ( var i = start; i < end; i += di) {
				var c1 = Math.cos(i);
				var s1 = Math.sin(i);
				var i2 = i + di / 2;
				var c2 = Math.cos(i2);
				var s2 = Math.sin(i2);
				if (s == null) {
					s = "M" + (s1 * r1).toFixed(2) + "," + (c1 * r1).toFixed(2) + " ";
				} else {
					s += "L" + (s1 * r1).toFixed(2) + "," + (c1 * r1).toFixed(2) + " ";
				}
				s += "L" + (s2 * r2).toFixed(2) + "," + (c2 * r2).toFixed(2) + " ";
			}
			s += "z";
			return s;
		},

		createStar : function(){
			var s = this.sun.sun();
			var geom = new dojox.geo.openlayers.Point(s);
			var gf = new dojox.geo.openlayers.GeometryFeature(geom);

			gf.createShape = dojo.hitch(this, function(/* Surface */s){
				var g = s.createGroup();

				var r1 = 30;
				var r2 = 10;
				var branches = 7;
				var star = this.makeStarShape(r1, r2, branches);
				var path = s.createPath();
				path.setShape({
					path : star
				});
				path.setStroke([ 0, 100, 0 ]);
				g.add(path);
				return g;
			});
			return gf;
		},

		makeCrossShape : function(r1, r2, b){
			var TPI = Math.PI * 2;
			var di = TPI / b;
			var s = "";
			for ( var i = 0; i < TPI; i += di) {
				var c1 = Math.cos(i);
				var s1 = Math.sin(i);
				var i2 = i + Math.PI;
				var c2 = Math.cos(i2);
				var s2 = Math.sin(i2);
				s += "M" + (s1 * r1).toFixed(2) + "," + (c1 * r1).toFixed(2) + " ";
				s += "L" + (s2 * r1).toFixed(2) + "," + (c2 * r1).toFixed(2) + " ";
			}

			return s;
		},

		createSun : function(){
			var s = this.sun.sun();
			var g = new dojox.geo.openlayers.Point({
				x : s.x,
				y : s.y
			});
			var gf = new dojox.geo.openlayers.GeometryFeature(g);

			gf.setShapeProperties({
				r : 15
			});
			gf.setStroke("");
			gf.setFill({
				type : "radial",
				r : 15,
				colors : [ {
					offset : 0,
					color : [ 248, 236, 100 ]
				}, {
					offset : 1,
					color : [ 255, 255, 255, 0.4 ]
				} ]
			});
			return gf;
		}
	});

});
