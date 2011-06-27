/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_ListMouseMixin",["dojo/_base/kernel","..","dojo/touch","./_ListBase","dojo/_base/event"],function(_1,_2,_3){
_1.declare("dijit.form._ListMouseMixin",_2.form._ListBase,{postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,_3.press,"_onMouseDown");
this.connect(this.domNode,_3.release,"_onMouseUp");
this.connect(this.domNode,"onmouseover","_onMouseOver");
this.connect(this.domNode,"onmouseout","_onMouseOut");
},_onMouseDown:function(_4){
_1.stopEvent(_4);
if(this._hoveredNode){
this.onUnhover(this._hoveredNode);
this._hoveredNode=null;
}
this._isDragging=true;
this._setSelectedAttr(this._getTarget(_4));
},_onMouseUp:function(_5){
_1.stopEvent(_5);
this._isDragging=false;
var _6=this._getSelectedAttr();
var _7=this._getTarget(_5);
var _8=this._hoveredNode;
if(_6&&_7==_6){
this.onClick(_6);
}else{
if(_8&&_7==_8){
this._setSelectedAttr(_8);
this.onClick(_8);
}
}
},_onMouseOut:function(_9){
if(this._hoveredNode){
this.onUnhover(this._hoveredNode);
if(this._getSelectedAttr()==this._hoveredNode){
this.onSelect(this._hoveredNode);
}
this._hoveredNode=null;
}
if(this._isDragging){
this._cancelDrag=(new Date()).getTime()+1000;
}
},_onMouseOver:function(_a){
if(this._cancelDrag){
var _b=(new Date()).getTime();
if(_b>this._cancelDrag){
this._isDragging=false;
}
this._cancelDrag=null;
}
var _c=this._getTarget(_a);
if(!_c){
return;
}
if(this._hoveredNode!=_c){
if(this._hoveredNode){
this._onMouseOut({target:this._hoveredNode});
}
if(_c&&_c.parentNode==this.containerNode){
if(this._isDragging){
this._setSelectedAttr(_c);
}else{
this._hoveredNode=_c;
this.onHover(_c);
}
}
}
}});
return _2.form._ListMouseMixin;
});
