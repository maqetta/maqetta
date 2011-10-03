//>>built
define("dojox/geo/openlayers/Collection",["dojo/_base/kernel","dojo/_base/declare","dojox/geo/openlayers/Geometry"],function(_1,_2,_3){
return _2("dojox.geo.openlayers.Collection",dojox.geo.openlayers.Geometry,{setGeometries:function(g){
this.coordinates=g;
},getGeometries:function(){
return this.coordinates;
}});
});
