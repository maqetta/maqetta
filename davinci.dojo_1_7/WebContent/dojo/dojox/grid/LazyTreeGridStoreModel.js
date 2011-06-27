/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/LazyTreeGridStoreModel",["dojo","dijit","dojox","dijit/tree/ForestStoreModel"],function(_1,_2,_3){
_1.declare("dojox.grid.LazyTreeGridStoreModel",_2.tree.ForestStoreModel,{serverStore:false,constructor:function(_4){
this.serverStore=_4.serverStore===true?true:false;
},mayHaveChildren:function(_5){
var _6=null;
return _1.some(this.childrenAttrs,function(_7){
_6=this.store.getValue(_5,_7);
if(_1.isString(_6)){
return parseInt(_6,10)>0||_6.toLowerCase()==="true"?true:false;
}else{
if(typeof _6=="number"){
return _6>0;
}else{
if(typeof _6=="boolean"){
return _6;
}else{
if(this.store.isItem(_6)){
_6=this.store.getValues(_5,_7);
return _1.isArray(_6)?_6.length>0:false;
}else{
return false;
}
}
}
}
},this);
},getChildren:function(_8,_9,_a,_b){
if(_b){
var _c=_b.start||0,_d=_b.count,_e=_b.parentId,_f=_b.sort;
if(_8===this.root){
this.root.size=0;
this.store.fetch({start:_c,count:_d,sort:_f,query:this.query,onBegin:_1.hitch(this,function(_10){
this.root.size=_10;
}),onComplete:_1.hitch(this,function(_11){
_9(_11,_b,this.root.size);
}),onError:_a});
}else{
var _12=this.store;
if(!_12.isItemLoaded(_8)){
var _13=_1.hitch(this,arguments.callee);
_12.loadItem({item:_8,onItem:function(_14){
_13(_14,_9,_a,_b);
},onError:_a});
return;
}
if(this.serverStore&&!this._isChildrenLoaded(_8)){
this.childrenSize=0;
this.store.fetch({start:_c,count:_d,sort:_f,query:_1.mixin({parentId:_e},this.query||{}),onBegin:_1.hitch(this,function(_15){
this.childrenSize=_15;
}),onComplete:_1.hitch(this,function(_16){
_9(_16,_b,this.childrenSize);
}),onError:_a});
}else{
this.inherited(arguments);
}
}
}else{
this.inherited(arguments);
}
},_isChildrenLoaded:function(_17){
var _18=null;
return _1.every(this.childrenAttrs,function(_19){
_18=this.store.getValues(_17,_19);
return _1.every(_18,function(c){
return this.store.isItemLoaded(c);
},this);
},this);
}});
return _3.grid.LazyTreeGridStoreModel;
});
