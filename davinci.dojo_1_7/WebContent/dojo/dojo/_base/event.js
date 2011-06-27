/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/event",["./kernel","../on","../has"],function(_1,on,_2){
_2.add("dom-addeventlistener",!!document.addEventListener);
if(on._fixEvent){
var _3=on._fixEvent;
on._fixEvent=function(_4,se){
_4=_3(_4,se);
if(_4){
var _5=(se&&se.ownerDocument)||document;
var _6=((_1.isIE<6)||(_5["compatMode"]=="BackCompat"))?_5.body:_5.documentElement;
var _7=_1._getIeDocumentElementOffset();
_4.pageX=_4.clientX+_1._fixIeBiDiScrollLeft(_6.scrollLeft||0)-_7.x;
_4.pageY=_4.clientY+(_6.scrollTop||0)-_7.y;
}
return _4;
};
}
_1.fixEvent=function(_8,_9){
if(on._fixEvent){
return on._fixEvent(_8,_9);
}
return _8;
};
_1.stopEvent=function(_a){
if(_2("dom-addeventlistener")||(_a&&_a.preventDefault)){
_a.preventDefault();
_a.stopPropagation();
}else{
_a=_a||window.event;
_a.cancelBubble=true;
on._preventDefault.call(_a);
}
};
return {fixEvent:_1.fixEvent,stopEvent:_1.stopEvent};
});
