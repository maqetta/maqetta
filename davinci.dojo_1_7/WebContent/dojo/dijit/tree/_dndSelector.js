/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/tree/_dndSelector",["dojo/_base/kernel","..","dojo/touch","dojo/dnd/common","./_dndContainer","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/lang","dojo/_base/window","dojo/mouse"],function(_1,_2,_3){
_1.declare("dijit.tree._dndSelector",_2.tree._dndContainer,{constructor:function(_4,_5){
this.selection={};
this.anchor=null;
this.tree.domNode.setAttribute("aria-multiselect",!this.singular);
this.events.push(_1.connect(this.tree.domNode,_3.press,this,"onMouseDown"),_1.connect(this.tree.domNode,_3.release,this,"onMouseUp"),_1.connect(this.tree.domNode,_3.move,this,"onMouseMove"));
},singular:false,getSelectedTreeNodes:function(){
var _6=[],_7=this.selection;
for(var i in _7){
_6.push(_7[i]);
}
return _6;
},selectNone:function(){
this.setSelection([]);
return this;
},destroy:function(){
this.inherited(arguments);
this.selection=this.anchor=null;
},addTreeNode:function(_8,_9){
this.setSelection(this.getSelectedTreeNodes().concat([_8]));
if(_9){
this.anchor=_8;
}
return _8;
},removeTreeNode:function(_a){
this.setSelection(this._setDifference(this.getSelectedTreeNodes(),[_a]));
return _a;
},isTreeNodeSelected:function(_b){
return _b.id&&!!this.selection[_b.id];
},setSelection:function(_c){
var _d=this.getSelectedTreeNodes();
_1.forEach(this._setDifference(_d,_c),_1.hitch(this,function(_e){
_e.setSelected(false);
if(this.anchor==_e){
delete this.anchor;
}
delete this.selection[_e.id];
}));
_1.forEach(this._setDifference(_c,_d),_1.hitch(this,function(_f){
_f.setSelected(true);
this.selection[_f.id]=_f;
}));
this._updateSelectionProperties();
},_setDifference:function(xs,ys){
_1.forEach(ys,function(y){
y.__exclude__=true;
});
var ret=_1.filter(xs,function(x){
return !x.__exclude__;
});
_1.forEach(ys,function(y){
delete y["__exclude__"];
});
return ret;
},_updateSelectionProperties:function(){
var _10=this.getSelectedTreeNodes();
var _11=[],_12=[];
_1.forEach(_10,function(_13){
_12.push(_13);
_11.push(_13.getTreePath());
});
var _14=_1.map(_12,function(_15){
return _15.item;
});
this.tree._set("paths",_11);
this.tree._set("path",_11[0]||[]);
this.tree._set("selectedNodes",_12);
this.tree._set("selectedNode",_12[0]||null);
this.tree._set("selectedItems",_14);
this.tree._set("selectedItem",_14[0]||null);
},onMouseDown:function(e){
if(!this.current||this.tree.isExpandoNode(e.target,this.current)){
return;
}
if(!_1.mouseButtons.isLeft(e)){
return;
}
_1.stopEvent(e);
var _16=this.current,_17=_1.isCopyKey(e),id=_16.id;
if(!this.singular&&!e.shiftKey&&this.selection[id]){
this._doDeselect=true;
return;
}else{
this._doDeselect=false;
}
this.userSelect(_16,_17,e.shiftKey);
},onMouseUp:function(e){
if(!this._doDeselect){
return;
}
this._doDeselect=false;
this.userSelect(this.current,_1.isCopyKey(e),e.shiftKey);
},onMouseMove:function(e){
this._doDeselect=false;
},userSelect:function(_18,_19,_1a){
if(this.singular){
if(this.anchor==_18&&_19){
this.selectNone();
}else{
this.setSelection([_18]);
this.anchor=_18;
}
}else{
if(_1a&&this.anchor){
var cr=_2.tree._compareNodes(this.anchor.rowNode,_18.rowNode),_1b,end,_1c=this.anchor;
if(cr<0){
_1b=_1c;
end=_18;
}else{
_1b=_18;
end=_1c;
}
var _1d=[];
while(_1b!=end){
_1d.push(_1b);
_1b=this.tree._getNextNode(_1b);
}
_1d.push(end);
this.setSelection(_1d);
}else{
if(this.selection[_18.id]&&_19){
this.removeTreeNode(_18);
}else{
if(_19){
this.addTreeNode(_18,true);
}else{
this.setSelection([_18]);
this.anchor=_18;
}
}
}
}
},forInSelectedItems:function(f,o){
o=o||_1.global;
for(var id in this.selection){
f.call(o,this.getItem(id),id,this);
}
}});
return _2.tree._dndSelector;
});
