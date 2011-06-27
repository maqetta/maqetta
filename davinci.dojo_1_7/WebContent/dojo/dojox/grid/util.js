/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/util",["dojo","dojox"],function(_1,_2){
var _3=_1.getObject("grid.util",true,_2);
_3.na="...";
_3.rowIndexTag="gridRowIndex";
_3.gridViewTag="gridView";
_3.fire=function(ob,ev,_4){
var fn=ob&&ev&&ob[ev];
return fn&&(_4?fn.apply(ob,_4):ob[ev]());
};
_3.setStyleHeightPx=function(_5,_6){
if(_6>=0){
var s=_5.style;
var v=_6+"px";
if(_5&&s["height"]!=v){
s["height"]=v;
}
}
};
_3.mouseEvents=["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"];
_3.keyEvents=["keyup","keydown","keypress"];
_3.funnelEvents=function(_7,_8,_9,_a){
var _b=(_a?_a:_3.mouseEvents.concat(_3.keyEvents));
for(var i=0,l=_b.length;i<l;i++){
_8.connect(_7,"on"+_b[i],_9);
}
};
_3.removeNode=function(_c){
_c=_1.byId(_c);
_c&&_c.parentNode&&_c.parentNode.removeChild(_c);
return _c;
};
_3.arrayCompare=function(_d,_e){
for(var i=0,l=_d.length;i<l;i++){
if(_d[i]!=_e[i]){
return false;
}
}
return (_d.length==_e.length);
};
_3.arrayInsert=function(_f,_10,_11){
if(_f.length<=_10){
_f[_10]=_11;
}else{
_f.splice(_10,0,_11);
}
};
_3.arrayRemove=function(_12,_13){
_12.splice(_13,1);
};
_3.arraySwap=function(_14,inI,inJ){
var _15=_14[inI];
_14[inI]=_14[inJ];
_14[inJ]=_15;
};
return _2.grid.util;
});
