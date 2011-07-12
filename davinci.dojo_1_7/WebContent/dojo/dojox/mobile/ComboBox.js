/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/ComboBox",["./TextBox","./_ComboBoxMenu","dijit/form/_AutoCompleterMixin","./common","dijit/popup"],function(_1,_2,_3,_4,_5){
dojo.experimental("dojox.mobile.ComboBox");
return dojo.declare("dojox.mobile.ComboBox",[dojox.mobile.TextBox,dijit.form._AutoCompleterMixin],{dropDownClass:"dojox.mobile._ComboBoxMenu",selectOnClick:false,autoComplete:false,dropDown:null,maxHeight:-1,dropDownPosition:["below","above"],_throttleOpenClose:function(){
if(this._throttleHandler){
clearTimeout(this._throttleHandler);
}
this._throttleHandler=setTimeout(dojo.hitch(this,function(){
this._throttleHandler=null;
}),500);
},_onFocus:function(){
this.inherited(arguments);
if(!this._opened&&!this._throttleHandler){
this._startSearchAll();
}
},onInput:function(e){
this._onKey(e);
this.inherited(arguments);
},_setListAttr:function(v){
this._set("list",v);
},closeDropDown:function(){
this._throttleOpenClose();
if(this.startHandler){
this.disconnect(this.startHandler);
this.startHandler=null;
if(this.moveHandler){
this.disconnect(this.moveHandler);
}
if(this.endHandler){
this.disconnect(this.endHandler);
}
}
this.inherited(arguments);
_5.close(this.dropDown);
this._opened=false;
},openDropDown:function(){
var _6=!this._opened;
var _7=this.dropDown,_8=_7.domNode,_9=this.domNode,_a=this;
if(!this._preparedNode){
this._preparedNode=true;
if(_8.style.width){
this._explicitDDWidth=true;
}
if(_8.style.height){
this._explicitDDHeight=true;
}
}
var _b={display:"",overflow:"hidden",visibility:"hidden"};
if(!this._explicitDDWidth){
_b.width="";
}
if(!this._explicitDDHeight){
_b.height="";
}
dojo.style(_8,_b);
var _c=this.maxHeight;
if(_c==-1){
var _d=dojo.window.getBox(),_e=dojo.position(_9,false);
_c=Math.floor(Math.max(_e.y,_d.h-(_e.y+_e.h)));
}
_5.moveOffScreen(_7);
if(_7.startup&&!_7._started){
_7.startup();
}
var mb=dojo.position(this.dropDown.containerNode,false);
var _f=(_c&&mb.h>_c);
if(_f){
mb.h=_c;
}
mb.w=Math.max(mb.w,_9.offsetWidth);
dojo.marginBox(_8,mb);
var _10=_5.open({parent:this,popup:_7,around:_9,orient:this.dropDownPosition,onExecute:function(){
_a.closeDropDown();
},onCancel:function(){
_a.closeDropDown();
},onClose:function(){
_a._opened=false;
}});
this._opened=true;
if(_6){
if(_10.aroundCorner.charAt(0)=="B"){
this.domNode.scrollIntoView(true);
}
this.startHandler=this.connect(dojo.doc.documentElement,dojox.mobile.hasTouch?"ontouchstart":"onmousedown",dojo.hitch(this,function(){
var _11=false;
this.moveHandler=this.connect(dojo.doc.documentElement,dojox.mobile.hasTouch?"ontouchmove":"onmousemove",function(){
_11=true;
});
this.endHandler=this.connect(dojo.doc.documentElement,dojox.mobile.hasTouch?"ontouchend":"onmouseup",function(){
if(!_11){
this.closeDropDown();
}
});
}));
}
return _10;
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onclick","_onClick");
},_onClick:function(e){
if(!this._throttleHandler){
if(this.opened){
this.closeDropDown();
}else{
this._startSearchAll();
}
}
}});
});
