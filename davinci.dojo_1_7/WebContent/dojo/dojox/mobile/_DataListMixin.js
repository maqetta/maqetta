/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/_DataListMixin",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","./ListItem"],function(_1,_2,_3,_4){
return _1.declare("dojox.mobile._DataListMixin",null,{store:null,query:null,queryOptions:null,buildRendering:function(){
this.inherited(arguments);
if(!this.store){
return;
}
var _5=this.store;
this.store=null;
this.setStore(_5,this.query,this.queryOptions);
},setStore:function(_6,_7,_8){
if(_6===this.store){
return;
}
this.store=_6;
this.query=_7;
this.queryOptions=_8;
if(_6&&_6.getFeatures()["dojo.data.api.Notification"]){
_1.forEach(this._conn||[],_1.disconnect);
this._conn=[_1.connect(_6,"onSet",this,"onSet"),_1.connect(_6,"onNew",this,"onNew"),_1.connect(_6,"onDelete",this,"onDelete")];
}
this.refresh();
},refresh:function(){
if(!this.store){
return;
}
this.store.fetch({query:this.query,queryOptions:this.queryOptions,onComplete:_1.hitch(this,"generateList"),onError:_1.hitch(this,"onError")});
},createListItem:function(_9){
var _a={};
var _b=this.store.getLabelAttributes(_9);
var _c=_b?_b[0]:null;
_1.forEach(this.store.getAttributes(_9),function(_d){
if(_d===_c){
_a["label"]=this.store.getLabel(_9);
}else{
_a[_d]=this.store.getValue(_9,_d);
}
},this);
var w=new _4(_a);
_9._widgetId=w.id;
return w;
},generateList:function(_e,_f){
_1.forEach(this.getChildren(),function(_10){
_10.destroyRecursive();
});
_1.forEach(_e,function(_11,_12){
this.addChild(this.createListItem(_11));
},this);
},onError:function(_13){
},onSet:function(_14,_15,_16,_17){
},onNew:function(_18,_19){
this.addChild(this.createListItem(_18));
},onDelete:function(_1a){
dijit.byId(_1a._widgetId).destroyRecursive();
}});
});
