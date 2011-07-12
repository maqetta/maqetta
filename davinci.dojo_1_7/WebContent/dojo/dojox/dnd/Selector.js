/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dnd/Selector",["dojo","dijit","dojox","dojo/dnd/Selector"],function(_1,_2,_3){
_1.getObject("dojox.dnd.Selector",1);
_1.declare("dojox.dnd.Selector",_1.dnd.Selector,{isSelected:function(_4){
var id=_1.isString(_4)?_4:_4.id,_5=this.getItem(id);
return _5&&this.selected[id];
},selectNode:function(_6,_7){
if(!_7){
this.selectNone();
}
var id=_1.isString(_6)?_6:_6.id,_8=this.getItem(id);
if(_8){
this._removeAnchor();
this.anchor=_1.byId(_6);
this._addItemClass(this.anchor,"Anchor");
this.selection[id]=1;
this._addItemClass(this.anchor,"Selected");
}
return this;
},deselectNode:function(_9){
var id=_1.isString(_9)?_9:_9.id,_a=this.getItem(id);
if(_a&&this.selection[id]){
if(this.anchor===_1.byId(_9)){
this._removeAnchor();
}
delete this.selection[id];
this._removeItemClass(this.anchor,"Selected");
}
return this;
},selectByBBox:function(_b,_c,_d,_e,_f){
if(!_f){
this.selectNone();
}
this.forInItems(function(_10,id){
var _11=_1.byId(id);
if(_11&&this._isBoundedByBox(_11,_b,_c,_d,_e)){
this.selectNode(id,true);
}
},this);
return this;
},_isBoundedByBox:function(_12,_13,top,_14,_15){
var c=_1.coords(_12),t;
if(_13>_14){
t=_13;
_13=_14;
_14=t;
}
if(top>_15){
t=top;
top=_15;
_15=t;
}
return c.x>=_13&&c.x+c.w<=_14&&c.y>=top&&c.y+c.h<=_15;
},shift:function(_16,add){
var _17=this.getSelectedNodes();
if(_17&&_17.length){
this.selectNode(this._getNodeId(_17[_17.length-1].id,_16),add);
}
},_getNodeId:function(_18,_19){
var _1a=this.getAllNodes(),_1b=_18;
for(var i=0,l=_1a.length;i<l;++i){
if(_1a[i].id==_18){
var j=Math.min(l-1,Math.max(0,i+(_19?1:-1)));
if(i!=j){
_1b=_1a[j].id;
}
break;
}
}
return _1b;
}});
return _1.getObject("dojox.dnd.Selector");
});
require(["dojox/dnd/Selector"]);
