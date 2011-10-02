//>>built
define("dijit/layout/StackContainer",["dojo/_base/array","dojo/cookie","dojo/_base/declare","dojo/dom-class","dojo/_base/lang","dojo/topic","../registry","../_WidgetBase","./_LayoutWidget","dojo/i18n!../nls/common"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){
_5.extend(_8,{selected:false,closable:false,iconClass:"dijitNoIcon",showTitle:true});
return _3("dijit.layout.StackContainer",_9,{doLayout:true,persist:false,baseClass:"dijitStackContainer",buildRendering:function(){
this.inherited(arguments);
_4.add(this.domNode,"dijitLayoutContainer");
this.containerNode.setAttribute("role","tabpanel");
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onkeypress",this._onKeyPress);
},startup:function(){
if(this._started){
return;
}
var _a=this.getChildren();
_1.forEach(_a,this._setupChild,this);
if(this.persist){
this.selectedChildWidget=_7.byId(_2(this.id+"_selectedChild"));
}else{
_1.some(_a,function(_b){
if(_b.selected){
this.selectedChildWidget=_b;
}
return _b.selected;
},this);
}
var _c=this.selectedChildWidget;
if(!_c&&_a[0]){
_c=this.selectedChildWidget=_a[0];
_c.selected=true;
}
_6.publish(this.id+"-startup",{children:_a,selected:_c});
this.inherited(arguments);
},resize:function(){
if(!this._hasBeenShown){
this._hasBeenShown=true;
var _d=this.selectedChildWidget;
if(_d){
this._showChild(_d);
}
}
this.inherited(arguments);
},_setupChild:function(_e){
this.inherited(arguments);
_4.replace(_e.domNode,"dijitHidden","dijitVisible");
_e.domNode.title="";
},addChild:function(_f,_10){
this.inherited(arguments);
if(this._started){
_6.publish(this.id+"-addChild",_f,_10);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_f);
}
}
},removeChild:function(_11){
this.inherited(arguments);
if(this._started){
_6.publish(this.id+"-removeChild",_11);
}
if(this._descendantsBeingDestroyed){
return;
}
if(this.selectedChildWidget===_11){
this.selectedChildWidget=undefined;
if(this._started){
var _12=this.getChildren();
if(_12.length){
this.selectChild(_12[0]);
}
}
}
if(this._started){
this.layout();
}
},selectChild:function(_13,_14){
_13=_7.byId(_13);
if(this.selectedChildWidget!=_13){
var d=this._transition(_13,this.selectedChildWidget,_14);
this._set("selectedChildWidget",_13);
_6.publish(this.id+"-selectChild",_13);
if(this.persist){
_2(this.id+"_selectedChild",this.selectedChildWidget.id);
}
}
return d;
},_transition:function(_15,_16){
if(_16){
this._hideChild(_16);
}
var d=this._showChild(_15);
if(_15.resize){
if(this.doLayout){
_15.resize(this._containerContentBox||this._contentBox);
}else{
_15.resize();
}
}
return d;
},_adjacent:function(_17){
var _18=this.getChildren();
var _19=_1.indexOf(_18,this.selectedChildWidget);
_19+=_17?1:_18.length-1;
return _18[_19%_18.length];
},forward:function(){
return this.selectChild(this._adjacent(true),true);
},back:function(){
return this.selectChild(this._adjacent(false),true);
},_onKeyPress:function(e){
_6.publish(this.id+"-containerKeyPress",{e:e,page:this});
},layout:function(){
var _1a=this.selectedChildWidget;
if(_1a&&_1a.resize){
if(this.doLayout){
_1a.resize(this._containerContentBox||this._contentBox);
}else{
_1a.resize();
}
}
},_showChild:function(_1b){
var _1c=this.getChildren();
_1b.isFirstChild=(_1b==_1c[0]);
_1b.isLastChild=(_1b==_1c[_1c.length-1]);
_1b._set("selected",true);
_4.replace(_1b.domNode,"dijitVisible","dijitHidden");
return (_1b._onShow&&_1b._onShow())||true;
},_hideChild:function(_1d){
_1d._set("selected",false);
_4.replace(_1d.domNode,"dijitHidden","dijitVisible");
_1d.onHide&&_1d.onHide();
},closeChild:function(_1e){
var _1f=_1e.onClose(this,_1e);
if(_1f){
this.removeChild(_1e);
_1e.destroyRecursive();
}
},destroyDescendants:function(_20){
this._descendantsBeingDestroyed=true;
_1.forEach(this.getChildren(),function(_21){
if(!_20){
this.removeChild(_21);
}
_21.destroyRecursive(_20);
},this);
this._descendantsBeingDestroyed=false;
}});
});
