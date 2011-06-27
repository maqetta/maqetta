/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_OnDijitClickMixin",["dojo/_base/kernel","dojo/on","./main","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/sniff","dojo/_base/unload","dojo/_base/window"],function(_1,on,_2){
var _3=null;
if(_1.isIE){
(function(){
var _4=function(_5){
_3=_5.srcElement;
};
_1.doc.attachEvent("onkeydown",_4);
_1.addOnWindowUnload(function(){
_1.doc.detachEvent("onkeydown",_4);
});
})();
}else{
_1.doc.addEventListener("keydown",function(_6){
_3=_6.target;
},true);
}
var _7=function(_8,_9){
if(/input|button/i.test(_8.nodeName)){
return function(_a,_b){
return on(_a,type,_b);
};
}else{
function _c(e){
return (e.keyCode==_1.keys.ENTER||e.keyCode==_1.keys.SPACE)&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey;
};
var _d=[on(_8,"keypress",function(e){
if(_c(e)){
_3=e.target;
e.preventDefault();
}
}),on(_8,"keyup",function(e){
if(_c(e)&&e.target==_3){
_3=null;
_9.call(this,e);
}
}),on(_8,"click",function(e){
_9.call(this,e);
})];
return {remove:function(){
_1.forEach(_d,function(h){
h.remove();
});
}};
}
};
_1.declare("dijit._OnDijitClickMixin",null,{connect:function(_e,_f,_10){
return this.inherited(arguments,[_e,_f=="ondijitclick"?_7:_f,_10]);
}});
return _2._OnDijitClickMixin;
});
