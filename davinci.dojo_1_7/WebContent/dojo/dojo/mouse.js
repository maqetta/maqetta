/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/mouse",["./_base/kernel","./on","./has","./dom"],function(_1,on,_2,_3){
_2.add("dom-quirks",document.compatMode=="BackCompat");
_2.add("events-mouseenter","onmouseenter" in document.createElement("div"));
var _4;
if(_2("dom-quirks")||!_2("dom-addeventlistener")){
_4={LEFT:1,MIDDLE:4,RIGHT:2,isButton:function(e,_5){
return e.button&_5;
},isLeft:function(e){
return e.button&1;
},isMiddle:function(e){
return e.button&4;
},isRight:function(e){
return e.button&2;
}};
}else{
_4={LEFT:0,MIDDLE:1,RIGHT:2,isButton:function(e,_6){
return e.button==_6;
},isLeft:function(e){
return e.button==0;
},isMiddle:function(e){
return e.button==1;
},isRight:function(e){
return e.button==2;
}};
}
_1.mouseButtons=_4;
function _7(_8,_9){
var _a=function(_b,_c){
return on(_b,_8,function(_d){
if(!_3.isDescendant(_d.relatedTarget,_9?_d.target:_b)){
return _c.call(this,_d);
}
});
};
if(!_9){
_a.bubble=_7(_8,true);
}
return _a;
};
return {enter:_7("mouseover"),leave:_7("mouseout"),isLeft:_4.isLeft,isMiddle:_4.isMiddle,isRight:_4.isRight};
});
