/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/charting/_base",["dojo/_base/kernel","dojo/_base/lang","../../main","dojo/_base/html","dojox/gfx/matrix","dijit/Tooltip","dojo/NodeList-traverse"],function(_1,_2,_3,_4,_5,_6,_7){
var _8=_1.getObject("geo.charting",true,_3);
_8.showTooltip=function(_9,_a,_b){
var _c=_8._normalizeArround(_a);
return dijit.showTooltip(_9,_c,_b);
};
_8.hideTooltip=function(_d){
return dijit.hideTooltip(_d);
};
_8._normalizeArround=function(_e){
var _f=_8._getRealBBox(_e);
var _10=_e._getRealMatrix()||{xx:1,xy:0,yx:0,yy:1,dx:0,dy:0};
var _11=_5.multiplyPoint(_10,_f.x,_f.y);
var _12=_8._getGfxContainer(_e);
_e.x=_1.position(_12,true).x+_11.x,_e.y=_1.position(_12,true).y+_11.y,_e.width=_f.width*_10.xx,_e.height=_f.height*_10.yy;
return _e;
};
_8._getGfxContainer=function(_13){
return (new _1.NodeList(_13.rawNode)).parents("div")[0];
};
_8._getRealBBox=function(_14){
var _15=_14.getBoundingBox();
if(!_15){
var _16=_14.children;
_15=_1.clone(_8._getRealBBox(_16[0]));
_1.forEach(_16,function(_17){
var _18=_8._getRealBBox(_17);
_15.x=Math.min(_15.x,_18.x);
_15.y=Math.min(_15.y,_18.y);
_15.endX=Math.max(_15.x+_15.width,_18.x+_18.width);
_15.endY=Math.max(_15.y+_15.height,_18.y+_18.height);
});
_15.width=_15.endX-_15.x;
_15.height=_15.endY-_15.y;
}
return _15;
};
});
