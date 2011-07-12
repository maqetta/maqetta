/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/Collection",["dojo/_base/kernel","dojo/_base/declare","dojox/geo/openlayers/Geometry"],function(_1,_2,_3){
return _1.declare("dojox.geo.openlayers.Collection",dojox.geo.openlayers.Geometry,{setGeometries:function(g){
this.coordinates=g;
},getGeometries:function(){
return this.coordinates;
}});
});
