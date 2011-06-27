/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/widget/Map",["dojo/_base/kernel","dojo/_base/declare","dojo/query","dojo/_base/array","dijit/_Widget","dojox/geo/openlayers/Map","dojox/geo/openlayers/GfxLayer"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.geo.openlayers.widget.Map",dijit._Widget,{baseLayerType:dojox.geo.openlayers.BaseLayerType.OSM,initialLocation:null,touchHandler:false,map:null,startup:function(){
this.inherited(arguments);
this.map.initialFit({initialLocation:this.initialLocation});
},buildRendering:function(){
this.inherited(arguments);
var _8=this.domNode;
var _9=new _6(_8,{baseLayerType:this.baseLayerType,touchHandler:this.touchHandler});
this.map=_9;
this._makeLayers();
},_makeLayers:function(){
var n=this.domNode;
var _a=_1.query("> .layer",n);
_1.forEach(_a,function(l){
var _b=l.getAttribute("type");
var _c=l.getAttribute("name");
var _d="dojox.geo.openlayers."+_b;
var p=_1.getObject(_d);
if(p){
var _e=new p(_c,{});
if(_e){
this.map.addLayer(_e);
}
}
},this);
},resize:function(b){
var _f=this.map.getOLMap();
var box;
switch(arguments.length){
case 0:
break;
case 1:
box=_1.mixin({},b);
_1.marginBox(_f.div,box);
break;
case 2:
box={w:arguments[0],h:arguments[1]};
_1.marginBox(_f.div,box);
break;
}
_f.updateSize();
}});
});
