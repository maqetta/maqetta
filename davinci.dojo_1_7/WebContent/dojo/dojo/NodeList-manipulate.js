/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/NodeList-manipulate",["./main"],function(_1){
function _2(_3){
var _4="",ch=_3.childNodes;
for(var i=0,n;n=ch[i];i++){
if(n.nodeType!=8){
if(n.nodeType==1){
_4+=_2(n);
}else{
_4+=n.nodeValue;
}
}
}
return _4;
};
function _5(_6){
while(_6.childNodes[0]&&_6.childNodes[0].nodeType==1){
_6=_6.childNodes[0];
}
return _6;
};
function _7(_8,_9){
if(typeof _8=="string"){
_8=_1._toDom(_8,(_9&&_9.ownerDocument));
if(_8.nodeType==11){
_8=_8.childNodes[0];
}
}else{
if(_8.nodeType==1&&_8.parentNode){
_8=_8.cloneNode(false);
}
}
return _8;
};
_1.extend(_1.NodeList,{_placeMultiple:function(_a,_b){
var _c=typeof _a=="string"||_a.nodeType?_1.query(_a):_a;
var _d=[];
for(var i=0;i<_c.length;i++){
var _e=_c[i];
var _f=this.length;
for(var j=_f-1,_10;_10=this[j];j--){
if(i>0){
_10=this._cloneNode(_10);
_d.unshift(_10);
}
if(j==_f-1){
_1.place(_10,_e,_b);
}else{
_e.parentNode.insertBefore(_10,_e);
}
_e=_10;
}
}
if(_d.length){
_d.unshift(0);
_d.unshift(this.length-1);
Array.prototype.splice.apply(this,_d);
}
return this;
},innerHTML:function(_11){
if(arguments.length){
return this.addContent(_11,"only");
}else{
return this[0].innerHTML;
}
},text:function(_12){
if(arguments.length){
for(var i=0,_13;_13=this[i];i++){
if(_13.nodeType==1){
_1.empty(_13);
_13.appendChild(_13.ownerDocument.createTextNode(_12));
}
}
return this;
}else{
var _14="";
for(i=0;_13=this[i];i++){
_14+=_2(_13);
}
return _14;
}
},val:function(_15){
if(arguments.length){
var _16=_1.isArray(_15);
for(var _17=0,_18;_18=this[_17];_17++){
var _19=_18.nodeName.toUpperCase();
var _1a=_18.type;
var _1b=_16?_15[_17]:_15;
if(_19=="SELECT"){
var _1c=_18.options;
for(var i=0;i<_1c.length;i++){
var opt=_1c[i];
if(_18.multiple){
opt.selected=(_1.indexOf(_15,opt.value)!=-1);
}else{
opt.selected=(opt.value==_1b);
}
}
}else{
if(_1a=="checkbox"||_1a=="radio"){
_18.checked=(_18.value==_1b);
}else{
_18.value=_1b;
}
}
}
return this;
}else{
_18=this[0];
if(!_18||_18.nodeType!=1){
return undefined;
}
_15=_18.value||"";
if(_18.nodeName.toUpperCase()=="SELECT"&&_18.multiple){
_15=[];
_1c=_18.options;
for(i=0;i<_1c.length;i++){
opt=_1c[i];
if(opt.selected){
_15.push(opt.value);
}
}
if(!_15.length){
_15=null;
}
}
return _15;
}
},append:function(_1d){
return this.addContent(_1d,"last");
},appendTo:function(_1e){
return this._placeMultiple(_1e,"last");
},prepend:function(_1f){
return this.addContent(_1f,"first");
},prependTo:function(_20){
return this._placeMultiple(_20,"first");
},after:function(_21){
return this.addContent(_21,"after");
},insertAfter:function(_22){
return this._placeMultiple(_22,"after");
},before:function(_23){
return this.addContent(_23,"before");
},insertBefore:function(_24){
return this._placeMultiple(_24,"before");
},remove:_1.NodeList.prototype.orphan,wrap:function(_25){
if(this[0]){
_25=_7(_25,this[0]);
for(var i=0,_26;_26=this[i];i++){
var _27=this._cloneNode(_25);
if(_26.parentNode){
_26.parentNode.replaceChild(_27,_26);
}
var _28=_5(_27);
_28.appendChild(_26);
}
}
return this;
},wrapAll:function(_29){
if(this[0]){
_29=_7(_29,this[0]);
this[0].parentNode.replaceChild(_29,this[0]);
var _2a=_5(_29);
for(var i=0,_2b;_2b=this[i];i++){
_2a.appendChild(_2b);
}
}
return this;
},wrapInner:function(_2c){
if(this[0]){
_2c=_7(_2c,this[0]);
for(var i=0;i<this.length;i++){
var _2d=this._cloneNode(_2c);
this._wrap(_1._toArray(this[i].childNodes),null,this._NodeListCtor).wrapAll(_2d);
}
}
return this;
},replaceWith:function(_2e){
_2e=this._normalize(_2e,this[0]);
for(var i=0,_2f;_2f=this[i];i++){
this._place(_2e,_2f,"before",i>0);
_2f.parentNode.removeChild(_2f);
}
return this;
},replaceAll:function(_30){
var nl=_1.query(_30);
var _31=this._normalize(this,this[0]);
for(var i=0,_32;_32=nl[i];i++){
this._place(_31,_32,"before",i>0);
_32.parentNode.removeChild(_32);
}
return this;
},clone:function(){
var ary=[];
for(var i=0;i<this.length;i++){
ary.push(this._cloneNode(this[i]));
}
return this._wrap(ary,this,this._NodeListCtor);
}});
if(!_1.NodeList.prototype.html){
_1.NodeList.prototype.html=_1.NodeList.prototype.innerHTML;
}
return _1.NodeList;
});
