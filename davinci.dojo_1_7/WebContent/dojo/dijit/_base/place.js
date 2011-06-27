/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_base/place",["dojo/_base/kernel","..","../place","dojo/window","dojo/_base/array","dojo/_base/lang"],function(_1,_2,_3){
_2.getViewport=function(){
return _1.window.getBox();
};
_2.placeOnScreen=_3.at;
_2.placeOnScreenAroundElement=function(_4,_5,_6,_7){
var _8;
if(_1.isArray(_6)){
_8=_6;
}else{
_8=[];
for(var _9 in _6){
_8.push({aroundCorner:_9,corner:_6[_9]});
}
}
return _3.around(_4,_5,_8,true,_7);
};
_2.placeOnScreenAroundNode=_2.placeOnScreenAroundElement;
_2.placeOnScreenAroundRectangle=_2.placeOnScreenAroundElement;
_2.getPopupAroundAlignment=function(_a,_b){
var _c={};
_1.forEach(_a,function(_d){
var _e=_b;
switch(_d){
case "after":
_c[_b?"BR":"BL"]=_b?"BL":"BR";
break;
case "before":
_c[_b?"BL":"BR"]=_b?"BR":"BL";
break;
case "below-alt":
_e=!_e;
case "below":
_c[_e?"BL":"BR"]=_e?"TL":"TR";
_c[_e?"BR":"BL"]=_e?"TR":"TL";
break;
case "above-alt":
_e=!_e;
case "above":
default:
_c[_e?"TL":"TR"]=_e?"BL":"BR";
_c[_e?"TR":"TL"]=_e?"BR":"BL";
break;
}
});
return _c;
};
return _2;
});
