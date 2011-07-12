/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/LineString",["dojo/_base/kernel","dojo/_base/declare","dojox/geo/openlayers/Geometry"],function(_1,_2,_3){
return _1.declare("dojox.geo.openlayers.LineString",dojox.geo.openlayers.Geometry,{setPoints:function(p){
this.coordinates=p;
},getPoints:function(){
return this.coordinates;
}});
});
