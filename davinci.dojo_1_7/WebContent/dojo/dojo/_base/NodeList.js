/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/NodeList",["./kernel","../on","./lang","./array","./html"],function(_1,on){
var ap=Array.prototype,_2=ap.slice,_3=ap.concat;
var _4=function(a,_5,_6){
if(!a.sort){
a=_2.call(a,0);
}
var _7=_6||this._NodeListCtor||_1._NodeListCtor;
a.constructor=_7;
_1._mixin(a,_7.prototype);
a._NodeListCtor=_7;
return _5?a._stash(_5):a;
};
var _8=function(f,a,o){
a=[0].concat(_2.call(a,0));
o=o||_1.global;
return function(_9){
a[0]=_9;
return f.apply(o,a);
};
};
var _a=function(f,o){
return function(){
this.forEach(_8(f,arguments,o));
return this;
};
};
var _b=function(f,o){
return function(){
return this.map(_8(f,arguments,o));
};
};
var _c=function(f,o){
return function(){
return this.filter(_8(f,arguments,o));
};
};
var _d=function(f,g,o){
return function(){
var a=arguments,_e=_8(f,a,o);
if(g.call(o||_1.global,a)){
return this.map(_e);
}
this.forEach(_e);
return this;
};
};
var _f=function(a){
return a.length==1&&(typeof a[0]=="string");
};
var _10=function(_11){
var p=_11.parentNode;
if(p){
p.removeChild(_11);
}
};
_1.NodeList=function(){
return _4(Array.apply(null,arguments));
};
_1._NodeListCtor=_1.NodeList;
var nl=_1.NodeList,nlp=nl.prototype;
nl._wrap=nlp._wrap=_4;
nl._adaptAsMap=_b;
nl._adaptAsForEach=_a;
nl._adaptAsFilter=_c;
nl._adaptWithCondition=_d;
_1.forEach(["slice","splice"],function(_12){
var f=ap[_12];
nlp[_12]=function(){
return this._wrap(f.apply(this,arguments),_12=="slice"?this:null);
};
});
_1.forEach(["indexOf","lastIndexOf","every","some"],function(_13){
var f=_1[_13];
nlp[_13]=function(){
return f.apply(_1,[this].concat(_2.call(arguments,0)));
};
});
_1.forEach(["attr","style"],function(_14){
nlp[_14]=_d(_1[_14],_f);
});
_1.forEach(["addClass","removeClass","replaceClass","toggleClass","empty","removeAttr"],function(_15){
nlp[_15]=_a(_1[_15]);
});
nlp.connect=_a(function(){
return _1.connect.apply(this,arguments);
});
_1.extend(_1.NodeList,{_normalize:function(_16,_17){
var _18=_16.parse===true;
if(typeof _16.template=="string"){
var _19=_16.templateFunc||(_1.string&&_1.string.substitute);
_16=_19?_19(_16.template,_16):_16;
}
var _1a=(typeof _16);
if(_1a=="string"||_1a=="number"){
_16=_1._toDom(_16,(_17&&_17.ownerDocument));
if(_16.nodeType==11){
_16=_1._toArray(_16.childNodes);
}else{
_16=[_16];
}
}else{
if(!_1.isArrayLike(_16)){
_16=[_16];
}else{
if(!_1.isArray(_16)){
_16=_1._toArray(_16);
}
}
}
if(_18){
_16._runParse=true;
}
return _16;
},_cloneNode:function(_1b){
return _1b.cloneNode(true);
},_place:function(ary,_1c,_1d,_1e){
if(_1c.nodeType!=1&&_1d=="only"){
return;
}
var _1f=_1c,_20;
var _21=ary.length;
for(var i=_21-1;i>=0;i--){
var _22=(_1e?this._cloneNode(ary[i]):ary[i]);
if(ary._runParse&&_1.parser&&_1.parser.parse){
if(!_20){
_20=_1f.ownerDocument.createElement("div");
}
_20.appendChild(_22);
_1.parser.parse(_20);
_22=_20.firstChild;
while(_20.firstChild){
_20.removeChild(_20.firstChild);
}
}
if(i==_21-1){
_1.place(_22,_1f,_1d);
}else{
_1f.parentNode.insertBefore(_22,_1f);
}
_1f=_22;
}
},_stash:function(_23){
this._parent=_23;
return this;
},on:function(_24,_25){
var _26=this.map(function(_27){
return on(_27,_24,_25);
});
_26.remove=function(){
for(var i=0;i<_26.length;i++){
_26[i].remove();
}
};
return _26;
},end:function(){
if(this._parent){
return this._parent;
}else{
return new this._NodeListCtor();
}
},concat:function(_28){
var t=_1.isArray(this)?this:_2.call(this,0),m=_1.map(arguments,function(a){
return a&&!_1.isArray(a)&&(typeof NodeList!="undefined"&&a.constructor===NodeList||a.constructor===this._NodeListCtor)?_2.call(a,0):a;
});
return this._wrap(_3.apply(t,m),this);
},map:function(_29,obj){
return this._wrap(_1.map(this,_29,obj),this);
},forEach:function(_2a,_2b){
_1.forEach(this,_2a,_2b);
return this;
},coords:_b(_1.coords),position:_b(_1.position),place:function(_2c,_2d){
var _2e=_1.query(_2c)[0];
return this.forEach(function(_2f){
_1.place(_2f,_2e,_2d);
});
},orphan:function(_30){
return (_30?_1._filterQueryResult(this,_30):this).forEach(_10);
},adopt:function(_31,_32){
return _1.query(_31).place(this[0],_32)._stash(this);
},query:function(_33){
if(!_33){
return this;
}
var ret=this.map(function(_34){
return _1.query(_33,_34).filter(function(_35){
return _35!==undefined;
});
});
return this._wrap(_3.apply([],ret),this);
},filter:function(_36){
var a=arguments,_37=this,_38=0;
if(typeof _36=="string"){
_37=_1._filterQueryResult(this,a[0]);
if(a.length==1){
return _37._stash(this);
}
_38=1;
}
return this._wrap(_1.filter(_37,a[_38],a[_38+1]),this);
},addContent:function(_39,_3a){
_39=this._normalize(_39,this[0]);
for(var i=0,_3b;(_3b=this[i]);i++){
this._place(_39,_3b,_3a,i>0);
}
return this;
},instantiate:function(_3c,_3d){
var c=_1.isFunction(_3c)?_3c:_1.getObject(_3c);
_3d=_3d||{};
return this.forEach(function(_3e){
new c(_3d,_3e);
});
},at:function(){
var t=new this._NodeListCtor();
_1.forEach(arguments,function(i){
if(i<0){
i=this.length+i;
}
if(this[i]){
t.push(this[i]);
}
},this);
return t._stash(this);
}});
nl.events=["blur","focus","change","click","error","keydown","keypress","keyup","load","mousedown","mouseenter","mouseleave","mousemove","mouseout","mouseover","mouseup","submit"];
_1.forEach(nl.events,function(evt){
var _3f="on"+evt;
nlp[_3f]=function(a,b){
return this.connect(_3f,a,b);
};
});
return _1.NodeList;
});
