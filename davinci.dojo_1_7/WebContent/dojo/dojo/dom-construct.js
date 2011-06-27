/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dom-construct",["./_base/kernel","./_base/sniff","./_base/window","./dom","./dom-prop","./on"],function(_1,_2,_3,_4,_5,on){
var _6={option:["select"],tbody:["table"],thead:["table"],tfoot:["table"],tr:["table","tbody"],td:["table","tbody","tr"],th:["table","thead","tr"],legend:["fieldset"],caption:["table"],colgroup:["table"],col:["table","colgroup"],li:["ul"]},_7=/<\s*([\w\:]+)/,_8={},_9=0,_a="__"+_1._scopeName+"ToDomId";
for(var _b in _6){
if(_6.hasOwnProperty(_b)){
var tw=_6[_b];
tw.pre=_b=="option"?"<select multiple=\"multiple\">":"<"+tw.join("><")+">";
tw.post="</"+tw.reverse().join("></")+">";
}
}
_1.toDom=_1._toDom=function(_c,_d){
_d=_d||_3.doc;
var _e=_d[_a];
if(!_e){
_d[_a]=_e=++_9+"";
_8[_e]=_d.createElement("div");
}
_c+="";
var _f=_c.match(_7),tag=_f?_f[1].toLowerCase():"",_10=_8[_e],_11,i,fc,df;
if(_f&&_6[tag]){
_11=_6[tag];
_10.innerHTML=_11.pre+_c+_11.post;
for(i=_11.length;i;--i){
_10=_10.firstChild;
}
}else{
_10.innerHTML=_c;
}
if(_10.childNodes.length==1){
return _10.removeChild(_10.firstChild);
}
df=_d.createDocumentFragment();
while(fc=_10.firstChild){
df.appendChild(fc);
}
return df;
};
function _12(_13,ref){
var _14=ref.parentNode;
if(_14){
_14.insertBefore(_13,ref);
}
};
function _15(_16,ref){
var _17=ref.parentNode;
if(_17){
if(_17.lastChild==ref){
_17.appendChild(_16);
}else{
_17.insertBefore(_16,ref.nextSibling);
}
}
};
_1.place=function(_18,_19,_1a){
_19=_4.byId(_19);
if(typeof _18=="string"){
_18=/^\s*</.test(_18)?_1.toDom(_18,_19.ownerDocument):_4.byId(_18);
}
if(typeof _1a=="number"){
var cn=_19.childNodes;
if(!cn.length||cn.length<=_1a){
_19.appendChild(_18);
}else{
_12(_18,cn[_1a<0?0:_1a]);
}
}else{
switch(_1a){
case "before":
_12(_18,_19);
break;
case "after":
_15(_18,_19);
break;
case "replace":
_19.parentNode.replaceChild(_18,_19);
break;
case "only":
_1.empty(_19);
_19.appendChild(_18);
break;
case "first":
if(_19.firstChild){
_12(_18,_19.firstChild);
break;
}
default:
_19.appendChild(_18);
}
}
return _18;
};
_1.create=function(tag,_1b,_1c,pos){
var doc=_3.doc;
if(_1c){
_1c=_4.byId(_1c);
doc=_1c.ownerDocument;
}
if(typeof tag=="string"){
tag=doc.createElement(tag);
}
if(_1b){
_5.attr(tag,_1b);
}
if(_1c){
_1.place(tag,_1c,pos);
}
return tag;
};
_1.empty=_2.isIE?function(_1d){
_1d=_4.byId(_1d);
for(var c;c=_1d.lastChild;){
_1.destroy(c);
}
}:function(_1e){
_4.byId(_1e).innerHTML="";
};
var _1f=null,_20;
on(window,"unload",function(){
_1f=null;
});
_1._destroyElement=_1.destroy=function(_21){
_21=_4.byId(_21);
try{
var doc=_21.ownerDocument;
if(!_1f||_20!=doc){
_1f=doc.createElement("div");
_20=doc;
}
_1f.appendChild(_21.parentNode?_21.parentNode.removeChild(_21):_21);
_1f.innerHTML="";
}
catch(e){
}
};
return {toDom:_1.toDom,place:_1.place,create:_1.create,empty:_1.empty,destroy:_1.destroy};
});
