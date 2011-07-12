/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dom-prop",["./_base/kernel","./_base/sniff","./_base/lang","./_base/window","./dom","./dom-style"],function(_1,_2,_3,_4,_5,_6){
var _7={"class":"className","for":"htmlFor",tabindex:"tabIndex",readonly:"readOnly",colspan:"colSpan",frameborder:"frameBorder",rowspan:"rowSpan",valuetype:"valueType"},_8={classname:"class",htmlfor:"for",tabindex:"tabIndex",readonly:"readOnly"},_9={innerHTML:1,className:1,htmlFor:_2.isIE,value:1};
function _a(_b){
return _8[_b.toLowerCase()]||_b;
};
function _c(_d,_e){
var _f=_d.getAttributeNode&&_d.getAttributeNode(_e);
return _f&&_f.specified;
};
_1.hasAttr=function(_10,_11){
var lc=_11.toLowerCase();
return _9[_7[lc]||_11]||_c(_5.byId(_10),_8[lc]||_11);
};
var _12={},_13=0,_14=_1._scopeName+"attrid",_15={col:1,colgroup:1,table:1,tbody:1,tfoot:1,thead:1,tr:1,title:1};
_1.attr=function(_16,_17,_18){
_16=_5.byId(_16);
var l=arguments.length;
if(l==2&&typeof _17!="string"){
for(var x in _17){
_1.attr(_16,x,_17[x]);
}
return _16;
}
var lc=_17.toLowerCase(),_19=_7[lc]||_17,_1a=_9[_19],_1b=_8[lc]||_17;
if(l==3){
if(_19=="style"&&typeof _18!="string"){
_6.style(_16,_18);
return _16;
}
if(_19=="innerHTML"){
if(_2.isIE&&_16.tagName.toLowerCase() in _15){
_1.empty(_16);
_16.appendChild(_1._toDom(_18,_16.ownerDocument));
}else{
_16[_19]=_18;
}
return _16;
}
if(_3.isFunction(_18)){
var _1c=_1.attr(_16,_14);
if(!_1c){
_1c=_13++;
_1.attr(_16,_14,_1c);
}
if(!_12[_1c]){
_12[_1c]={};
}
var h=_12[_1c][_19];
if(h){
_1.disconnect(h);
}else{
try{
delete _16[_19];
}
catch(e){
}
}
_12[_1c][_19]=_1.connect(_16,_19,_18);
return _16;
}
if(_1a||typeof _18=="boolean"){
_16[_19]=_18;
return _16;
}
_16.setAttribute(_1b,_18);
return _16;
}
_18=_16[_19];
if(_1a&&typeof _18!="undefined"){
return _18;
}
if(_19!="href"&&(typeof _18=="boolean"||_3.isFunction(_18))){
return _18;
}
return _c(_16,_1b)?_16.getAttribute(_1b):null;
};
_1.removeAttr=function(_1d,_1e){
_5.byId(_1d).removeAttribute(_a(_1e));
};
_1.getNodeProp=function(_1f,_20){
_1f=_5.byId(_1f);
var lc=_20.toLowerCase(),_21=_7[lc]||_20;
if((_21 in _1f)&&_21!="href"){
return _1f[_21];
}
var _22=_8[lc]||_20;
return _c(_1f,_22)?_1f.getAttribute(_22):null;
};
return {has:_1.hasAttr,attr:_1.attr,remove:_1.removeAttr,getProp:_1.getNodeProp};
});
