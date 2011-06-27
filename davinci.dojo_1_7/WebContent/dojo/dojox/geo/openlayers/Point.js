/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/Point",["dojo/_base/kernel","dojo/_base/declare","dojox/geo/openlayers/Geometry"],function(_1,_2,_3){
return _1.declare("dojox.geo.openlayers.Point",dojox.geo.openlayers.Geometry,{setPoint:function(p){
this.coordinates=p;
},getPoint:function(){
return this.coordinates;
}});
});
