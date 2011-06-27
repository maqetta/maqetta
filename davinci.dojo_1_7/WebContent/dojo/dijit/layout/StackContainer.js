/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/StackContainer",["dojo/_base/kernel","..","dojo/cookie","dojo/i18n!../nls/common","../_WidgetBase","./_LayoutWidget","./StackController","dojo/_base/array","dojo/_base/connect","dojo/_base/html"],function(_1,_2){
_1.declare("dijit.layout.StackContainer",_2.layout._LayoutWidget,{doLayout:true,persist:false,baseClass:"dijitStackContainer",buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"dijitLayoutContainer");
this.containerNode.setAttribute("role","tabpanel");
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onkeypress",this._onKeyPress);
},startup:function(){
if(this._started){
return;
}
var _3=this.getChildren();
_1.forEach(_3,this._setupChild,this);
if(this.persist){
this.selectedChildWidget=_2.byId(_1.cookie(this.id+"_selectedChild"));
}else{
_1.some(_3,function(_4){
if(_4.selected){
this.selectedChildWidget=_4;
}
return _4.selected;
},this);
}
var _5=this.selectedChildWidget;
if(!_5&&_3[0]){
_5=this.selectedChildWidget=_3[0];
_5.selected=true;
}
_1.publish(this.id+"-startup",[{children:_3,selected:_5}]);
this.inherited(arguments);
},resize:function(){
var _6=this.selectedChildWidget;
if(_6&&!this._hasBeenShown){
this._hasBeenShown=true;
this._showChild(_6);
}
this.inherited(arguments);
},_setupChild:function(_7){
this.inherited(arguments);
_1.replaceClass(_7.domNode,"dijitHidden","dijitVisible");
_7.domNode.title="";
},addChild:function(_8,_9){
this.inherited(arguments);
if(this._started){
_1.publish(this.id+"-addChild",[_8,_9]);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_8);
}
}
},removeChild:function(_a){
this.inherited(arguments);
if(this._started){
_1.publish(this.id+"-removeChild",[_a]);
}
if(this._beingDestroyed){
return;
}
if(this.selectedChildWidget===_a){
this.selectedChildWidget=undefined;
if(this._started){
var _b=this.getChildren();
if(_b.length){
this.selectChild(_b[0]);
}
}
}
if(this._started){
this.layout();
}
},selectChild:function(_c,_d){
_c=_2.byId(_c);
if(this.selectedChildWidget!=_c){
var d=this._transition(_c,this.selectedChildWidget,_d);
this._set("selectedChildWidget",_c);
_1.publish(this.id+"-selectChild",[_c]);
if(this.persist){
_1.cookie(this.id+"_selectedChild",this.selectedChildWidget.id);
}
}
return d;
},_transition:function(_e,_f,_10){
if(_f){
this._hideChild(_f);
}
var d=this._showChild(_e);
if(_e.resize){
if(this.doLayout){
_e.resize(this._containerContentBox||this._contentBox);
}else{
_e.resize();
}
}
return d;
},_adjacent:function(_11){
var _12=this.getChildren();
var _13=_1.indexOf(_12,this.selectedChildWidget);
_13+=_11?1:_12.length-1;
return _12[_13%_12.length];
},forward:function(){
return this.selectChild(this._adjacent(true),true);
},back:function(){
return this.selectChild(this._adjacent(false),true);
},_onKeyPress:function(e){
_1.publish(this.id+"-containerKeyPress",[{e:e,page:this}]);
},layout:function(){
var _14=this.selectedChildWidget;
if(_14&&_14.resize){
if(this.doLayout){
_14.resize(this._containerContentBox||this._contentBox);
}else{
_14.resize();
}
}
},_showChild:function(_15){
var _16=this.getChildren();
_15.isFirstChild=(_15==_16[0]);
_15.isLastChild=(_15==_16[_16.length-1]);
_15._set("selected",true);
_1.replaceClass(_15.domNode,"dijitVisible","dijitHidden");
return (_15._onShow&&_15._onShow())||true;
},_hideChild:function(_17){
_17._set("selected",false);
_1.replaceClass(_17.domNode,"dijitHidden","dijitVisible");
_17.onHide&&_17.onHide();
},closeChild:function(_18){
var _19=_18.onClose(this,_18);
if(_19){
this.removeChild(_18);
_18.destroyRecursive();
}
},destroyDescendants:function(_1a){
_1.forEach(this.getChildren(),function(_1b){
this.removeChild(_1b);
_1b.destroyRecursive(_1a);
},this);
}});
_1.extend(_2._WidgetBase,{selected:false,closable:false,iconClass:"dijitNoIcon",showTitle:true});
return _2.layout.StackContainer;
});
