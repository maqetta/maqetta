/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx3d/_base",["dojo/_base/kernel","dojox"],function(_1,_2){
_1.getObject("gfx3d",true,_2);
_1.mixin(_2.gfx3d,{defaultEdges:{type:"edges",style:null,points:[]},defaultTriangles:{type:"triangles",style:null,points:[]},defaultQuads:{type:"quads",style:null,points:[]},defaultOrbit:{type:"orbit",center:{x:0,y:0,z:0},radius:50},defaultPath3d:{type:"path3d",path:[]},defaultPolygon:{type:"polygon",path:[]},defaultCube:{type:"cube",bottom:{x:0,y:0,z:0},top:{x:100,y:100,z:100}},defaultCylinder:{type:"cylinder",center:{x:0,y:0,z:0},height:100,radius:50}});
return _2.gfx3d;
});
