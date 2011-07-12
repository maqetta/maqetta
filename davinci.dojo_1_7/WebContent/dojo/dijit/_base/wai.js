/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_base/wai",["dojo/_base/kernel","..","../hccss","dojo/_base/html","dojo/_base/lang"],function(_1,_2){
_1.mixin(_2,{hasWaiRole:function(_3,_4){
var _5=this.getWaiRole(_3);
return _4?(_5.indexOf(_4)>-1):(_5.length>0);
},getWaiRole:function(_6){
return _1.trim((_1.attr(_6,"role")||"").replace("wairole:",""));
},setWaiRole:function(_7,_8){
_1.attr(_7,"role",_8);
},removeWaiRole:function(_9,_a){
var _b=_1.attr(_9,"role");
if(!_b){
return;
}
if(_a){
var t=_1.trim((" "+_b+" ").replace(" "+_a+" "," "));
_1.attr(_9,"role",t);
}else{
_9.removeAttribute("role");
}
},hasWaiState:function(_c,_d){
return _c.hasAttribute?_c.hasAttribute("aria-"+_d):!!_c.getAttribute("aria-"+_d);
},getWaiState:function(_e,_f){
return _e.getAttribute("aria-"+_f)||"";
},setWaiState:function(_10,_11,_12){
_10.setAttribute("aria-"+_11,_12);
},removeWaiState:function(_13,_14){
_13.removeAttribute("aria-"+_14);
}});
return _2;
});
