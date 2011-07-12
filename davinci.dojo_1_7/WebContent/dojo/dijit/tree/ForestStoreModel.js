/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/tree/ForestStoreModel",["dojo/_base/kernel","..","./TreeStoreModel","dojo/_base/array","dojo/_base/lang","dojo/_base/window"],function(_1,_2){
_1.declare("dijit.tree.ForestStoreModel",_2.tree.TreeStoreModel,{rootId:"$root$",rootLabel:"ROOT",query:null,constructor:function(_3){
this.root={store:this,root:true,id:_3.rootId,label:_3.rootLabel,children:_3.rootChildren};
},mayHaveChildren:function(_4){
return _4===this.root||this.inherited(arguments);
},getChildren:function(_5,_6,_7){
if(_5===this.root){
if(this.root.children){
_6(this.root.children);
}else{
this.store.fetch({query:this.query,onComplete:_1.hitch(this,function(_8){
this.root.children=_8;
_6(_8);
}),onError:_7});
}
}else{
this.inherited(arguments);
}
},isItem:function(_9){
return (_9===this.root)?true:this.inherited(arguments);
},fetchItemByIdentity:function(_a){
if(_a.identity==this.root.id){
var _b=_a.scope?_a.scope:_1.global;
if(_a.onItem){
_a.onItem.call(_b,this.root);
}
}else{
this.inherited(arguments);
}
},getIdentity:function(_c){
return (_c===this.root)?this.root.id:this.inherited(arguments);
},getLabel:function(_d){
return (_d===this.root)?this.root.label:this.inherited(arguments);
},newItem:function(_e,_f,_10){
if(_f===this.root){
this.onNewRootItem(_e);
return this.store.newItem(_e);
}else{
return this.inherited(arguments);
}
},onNewRootItem:function(_11){
},pasteItem:function(_12,_13,_14,_15,_16){
if(_13===this.root){
if(!_15){
this.onLeaveRoot(_12);
}
}
_2.tree.TreeStoreModel.prototype.pasteItem.call(this,_12,_13===this.root?null:_13,_14===this.root?null:_14,_15,_16);
if(_14===this.root){
this.onAddToRoot(_12);
}
},onAddToRoot:function(_17){
},onLeaveRoot:function(_18){
},_requeryTop:function(){
var _19=this.root.children||[];
this.store.fetch({query:this.query,onComplete:_1.hitch(this,function(_1a){
this.root.children=_1a;
if(_19.length!=_1a.length||_1.some(_19,function(_1b,idx){
return _1a[idx]!=_1b;
})){
this.onChildrenChange(this.root,_1a);
}
})});
},onNewItem:function(_1c,_1d){
this._requeryTop();
this.inherited(arguments);
},onDeleteItem:function(_1e){
if(_1.indexOf(this.root.children,_1e)!=-1){
this._requeryTop();
}
this.inherited(arguments);
},onSetItem:function(_1f,_20,_21,_22){
this._requeryTop();
this.inherited(arguments);
}});
return _2.tree.ForestStoreModel;
});
