/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/mouse",["./_base/kernel","./on","./has"],function(_1,on,_2){
_2.add("dom-quirks",document.compatMode=="BackCompat");
_2.add("events-mouseenter","onmouseenter" in document.createElement("div"));
var _3;
if(_2("dom-quirks")||!_2("dom-addeventlistener")){
_3={LEFT:1,MIDDLE:4,RIGHT:2,isButton:function(e,_4){
return e.button&_4;
},isLeft:function(e){
return e.button&1;
},isMiddle:function(e){
return e.button&4;
},isRight:function(e){
return e.button&2;
}};
}else{
_3={LEFT:0,MIDDLE:1,RIGHT:2,isButton:function(e,_5){
return e.button==_5;
},isLeft:function(e){
return e.button==0;
},isMiddle:function(e){
return e.button==1;
},isRight:function(e){
return e.button==2;
}};
}
_1.mouseButtons=_3;
if(_2("events-mouseenter")){
var _6=function(_7){
return function(_8,_9){
return on(_8,_7,_9);
};
};
return {mouseButtons:_3,enter:_6("mouseenter"),leave:_6("mouseleave")};
}else{
var _6=function(_a){
return function(_b,_c){
return on(_b,_a,function(_d){
if(!_1.isDescendant(_d.relatedTarget,_b)){
return _c.call(this,_d);
}
});
};
};
return {mouseButtons:_3,enter:_6("mouseover"),leave:_6("mouseout")};
}
});
