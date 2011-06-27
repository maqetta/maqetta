/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/NodeList-traverse",["./main"],function(_1){
_1.extend(_1.NodeList,{_buildArrayFromCallback:function(_2){
var _3=[];
for(var i=0;i<this.length;i++){
var _4=_2.call(this[i],this[i],_3);
if(_4){
_3=_3.concat(_4);
}
}
return _3;
},_getUniqueAsNodeList:function(_5){
var _6=[];
for(var i=0,_7;_7=_5[i];i++){
if(_7.nodeType==1&&_1.indexOf(_6,_7)==-1){
_6.push(_7);
}
}
return this._wrap(_6,null,this._NodeListCtor);
},_getUniqueNodeListWithParent:function(_8,_9){
var _a=this._getUniqueAsNodeList(_8);
_a=(_9?_1._filterQueryResult(_a,_9):_a);
return _a._stash(this);
},_getRelatedUniqueNodes:function(_b,_c){
return this._getUniqueNodeListWithParent(this._buildArrayFromCallback(_c),_b);
},children:function(_d){
return this._getRelatedUniqueNodes(_d,function(_e,_f){
return _1._toArray(_e.childNodes);
});
},closest:function(_10,_11){
return this._getRelatedUniqueNodes(null,function(_12,ary){
do{
if(_1._filterQueryResult([_12],_10,_11).length){
return _12;
}
}while(_12!=_11&&(_12=_12.parentNode)&&_12.nodeType==1);
return null;
});
},parent:function(_13){
return this._getRelatedUniqueNodes(_13,function(_14,ary){
return _14.parentNode;
});
},parents:function(_15){
return this._getRelatedUniqueNodes(_15,function(_16,ary){
var _17=[];
while(_16.parentNode){
_16=_16.parentNode;
_17.push(_16);
}
return _17;
});
},siblings:function(_18){
return this._getRelatedUniqueNodes(_18,function(_19,ary){
var _1a=[];
var _1b=(_19.parentNode&&_19.parentNode.childNodes);
for(var i=0;i<_1b.length;i++){
if(_1b[i]!=_19){
_1a.push(_1b[i]);
}
}
return _1a;
});
},next:function(_1c){
return this._getRelatedUniqueNodes(_1c,function(_1d,ary){
var _1e=_1d.nextSibling;
while(_1e&&_1e.nodeType!=1){
_1e=_1e.nextSibling;
}
return _1e;
});
},nextAll:function(_1f){
return this._getRelatedUniqueNodes(_1f,function(_20,ary){
var _21=[];
var _22=_20;
while((_22=_22.nextSibling)){
if(_22.nodeType==1){
_21.push(_22);
}
}
return _21;
});
},prev:function(_23){
return this._getRelatedUniqueNodes(_23,function(_24,ary){
var _25=_24.previousSibling;
while(_25&&_25.nodeType!=1){
_25=_25.previousSibling;
}
return _25;
});
},prevAll:function(_26){
return this._getRelatedUniqueNodes(_26,function(_27,ary){
var _28=[];
var _29=_27;
while((_29=_29.previousSibling)){
if(_29.nodeType==1){
_28.push(_29);
}
}
return _28;
});
},andSelf:function(){
return this.concat(this._parent);
},first:function(){
return this._wrap(((this[0]&&[this[0]])||[]),this);
},last:function(){
return this._wrap((this.length?[this[this.length-1]]:[]),this);
},even:function(){
return this.filter(function(_2a,i){
return i%2!=0;
});
},odd:function(){
return this.filter(function(_2b,i){
return i%2==0;
});
}});
return _1.NodeList;
});
