/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/tree/TreeStoreModel",["dojo/_base/kernel","..","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/json","dojo/_base/lang","dojo/data/api/Identity","dojo/data/api/Notification"],function(_1,_2){
_1.declare("dijit.tree.TreeStoreModel",null,{store:null,childrenAttrs:["children"],newItemIdAttr:"id",labelAttr:"",root:null,query:null,deferItemLoadingUntilExpand:false,constructor:function(_3){
_1.mixin(this,_3);
this.connects=[];
var _4=this.store;
if(!_4.getFeatures()["dojo.data.api.Identity"]){
throw new Error("dijit.Tree: store must support dojo.data.Identity");
}
if(_4.getFeatures()["dojo.data.api.Notification"]){
this.connects=this.connects.concat([_1.connect(_4,"onNew",this,"onNewItem"),_1.connect(_4,"onDelete",this,"onDeleteItem"),_1.connect(_4,"onSet",this,"onSetItem")]);
}
},destroy:function(){
_1.forEach(this.connects,_1.disconnect);
},getRoot:function(_5,_6){
if(this.root){
_5(this.root);
}else{
this.store.fetch({query:this.query,onComplete:_1.hitch(this,function(_7){
if(_7.length!=1){
throw new Error(this.declaredClass+": query "+_1.toJson(this.query)+" returned "+_7.length+" items, but must return exactly one item");
}
this.root=_7[0];
_5(this.root);
}),onError:_6});
}
},mayHaveChildren:function(_8){
return _1.some(this.childrenAttrs,function(_9){
return this.store.hasAttribute(_8,_9);
},this);
},getChildren:function(_a,_b,_c){
var _d=this.store;
if(!_d.isItemLoaded(_a)){
var _e=_1.hitch(this,arguments.callee);
_d.loadItem({item:_a,onItem:function(_f){
_e(_f,_b,_c);
},onError:_c});
return;
}
var _10=[];
for(var i=0;i<this.childrenAttrs.length;i++){
var _11=_d.getValues(_a,this.childrenAttrs[i]);
_10=_10.concat(_11);
}
var _12=0;
if(!this.deferItemLoadingUntilExpand){
_1.forEach(_10,function(_13){
if(!_d.isItemLoaded(_13)){
_12++;
}
});
}
if(_12==0){
_b(_10);
}else{
_1.forEach(_10,function(_14,idx){
if(!_d.isItemLoaded(_14)){
_d.loadItem({item:_14,onItem:function(_15){
_10[idx]=_15;
if(--_12==0){
_b(_10);
}
},onError:_c});
}
});
}
},isItem:function(_16){
return this.store.isItem(_16);
},fetchItemByIdentity:function(_17){
this.store.fetchItemByIdentity(_17);
},getIdentity:function(_18){
return this.store.getIdentity(_18);
},getLabel:function(_19){
if(this.labelAttr){
return this.store.getValue(_19,this.labelAttr);
}else{
return this.store.getLabel(_19);
}
},newItem:function(_1a,_1b,_1c){
var _1d={parent:_1b,attribute:this.childrenAttrs[0]},_1e;
if(this.newItemIdAttr&&_1a[this.newItemIdAttr]){
this.fetchItemByIdentity({identity:_1a[this.newItemIdAttr],scope:this,onItem:function(_1f){
if(_1f){
this.pasteItem(_1f,null,_1b,true,_1c);
}else{
_1e=this.store.newItem(_1a,_1d);
if(_1e&&(_1c!=undefined)){
this.pasteItem(_1e,_1b,_1b,false,_1c);
}
}
}});
}else{
_1e=this.store.newItem(_1a,_1d);
if(_1e&&(_1c!=undefined)){
this.pasteItem(_1e,_1b,_1b,false,_1c);
}
}
},pasteItem:function(_20,_21,_22,_23,_24){
var _25=this.store,_26=this.childrenAttrs[0];
if(_21){
_1.forEach(this.childrenAttrs,function(_27){
if(_25.containsValue(_21,_27,_20)){
if(!_23){
var _28=_1.filter(_25.getValues(_21,_27),function(x){
return x!=_20;
});
_25.setValues(_21,_27,_28);
}
_26=_27;
}
});
}
if(_22){
if(typeof _24=="number"){
var _29=_25.getValues(_22,_26).slice();
_29.splice(_24,0,_20);
_25.setValues(_22,_26,_29);
}else{
_25.setValues(_22,_26,_25.getValues(_22,_26).concat(_20));
}
}
},onChange:function(_2a){
},onChildrenChange:function(_2b,_2c){
},onDelete:function(_2d,_2e){
},onNewItem:function(_2f,_30){
if(!_30){
return;
}
this.getChildren(_30.item,_1.hitch(this,function(_31){
this.onChildrenChange(_30.item,_31);
}));
},onDeleteItem:function(_32){
this.onDelete(_32);
},onSetItem:function(_33,_34,_35,_36){
if(_1.indexOf(this.childrenAttrs,_34)!=-1){
this.getChildren(_33,_1.hitch(this,function(_37){
this.onChildrenChange(_33,_37);
}));
}else{
this.onChange(_33);
}
}});
return _2.tree.TreeStoreModel;
});
