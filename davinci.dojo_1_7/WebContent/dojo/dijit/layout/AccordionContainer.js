/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/layout/templates/AccordionButton.html"]="<div dojoAttachEvent='onclick:_onTitleClick' class='dijitAccordionTitle'>\n\t<div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='onkeypress:_onTitleKeyPress'\n\t\t\tclass='dijitAccordionTitleFocus' role=\"tab\" aria-expanded=\"false\"\n\t\t><span class='dijitInline dijitAccordionArrow' role=\"presentation\"></span\n\t\t><span class='arrowTextUp' role=\"presentation\">+</span\n\t\t><span class='arrowTextDown' role=\"presentation\">-</span\n\t\t><img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon\" dojoAttachPoint='iconNode' style=\"vertical-align: middle\" role=\"presentation\"/>\n\t\t<span role=\"presentation\" dojoAttachPoint='titleTextNode' class='dijitAccordionText'></span>\n\t</div>\n</div>\n";
define("dijit/layout/AccordionContainer",["dojo/_base/kernel","..","dojo/text!./templates/AccordionButton.html","require","../_Container","../_TemplatedMixin","../_CssStateMixin","./StackContainer","./ContentPane","../focus","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/fx","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff"],function(_1,_2,_3,_4){
_1.declare("dijit.layout.AccordionContainer",_2.layout.StackContainer,{duration:_2.defaultDuration,buttonWidget:"dijit.layout._AccordionButton",baseClass:"dijitAccordionContainer",buildRendering:function(){
this.inherited(arguments);
this.domNode.style.overflow="hidden";
this.domNode.setAttribute("role","tablist");
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this.selectedChildWidget){
var _5=this.selectedChildWidget.containerNode.style;
_5.display="";
_5.overflow="auto";
this.selectedChildWidget._wrapperWidget.set("selected",true);
}
},layout:function(){
var _6=this.selectedChildWidget;
if(!_6){
return;
}
var _7=_6._wrapperWidget.domNode,_8=_1._getMarginExtents(_7),_9=_1._getPadBorderExtents(_7),_a=_6._wrapperWidget.containerNode,_b=_1._getMarginExtents(_a),_c=_1._getPadBorderExtents(_a),_d=this._contentBox;
var _e=0;
_1.forEach(this.getChildren(),function(_f){
if(_f!=_6){
_e+=_1._getMarginSize(_f._wrapperWidget.domNode).h;
}
});
this._verticalSpace=_d.h-_e-_8.h-_9.h-_b.h-_c.h-_6._buttonWidget.getTitleHeight();
this._containerContentBox={h:this._verticalSpace,w:this._contentBox.w-_8.w-_9.w-_b.w-_c.w};
if(_6){
_6.resize(this._containerContentBox);
}
},_setupChild:function(_10){
_10._wrapperWidget=new _2.layout._AccordionInnerContainer({contentWidget:_10,buttonWidget:this.buttonWidget,id:_10.id+"_wrapper",dir:_10.dir,lang:_10.lang,textDir:_10.textDir,parent:this});
this.inherited(arguments);
},addChild:function(_11,_12){
if(this._started){
_1.place(_11.domNode,this.containerNode,_12);
if(!_11._started){
_11.startup();
}
this._setupChild(_11);
_1.publish(this.id+"-addChild",[_11,_12]);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_11);
}
}else{
this.inherited(arguments);
}
},removeChild:function(_13){
if(_13._wrapperWidget){
_1.place(_13.domNode,_13._wrapperWidget.domNode,"after");
_13._wrapperWidget.destroy();
delete _13._wrapperWidget;
}
_1.removeClass(_13.domNode,"dijitHidden");
this.inherited(arguments);
},getChildren:function(){
return _1.map(this.inherited(arguments),function(_14){
return _14.declaredClass=="dijit.layout._AccordionInnerContainer"?_14.contentWidget:_14;
},this);
},destroy:function(){
if(this._animation){
this._animation.stop();
}
_1.forEach(this.getChildren(),function(_15){
if(_15._wrapperWidget){
_15._wrapperWidget.destroy();
}else{
_15.destroyRecursive();
}
});
this.inherited(arguments);
},_showChild:function(_16){
_16._wrapperWidget.containerNode.style.display="block";
return this.inherited(arguments);
},_hideChild:function(_17){
_17._wrapperWidget.containerNode.style.display="none";
this.inherited(arguments);
},_transition:function(_18,_19,_1a){
if(_1.isIE<8){
_1a=false;
}
if(this._animation){
this._animation.stop(true);
delete this._animation;
}
var _1b=this;
if(_18){
_18._wrapperWidget.set("selected",true);
var d=this._showChild(_18);
if(this.doLayout&&_18.resize){
_18.resize(this._containerContentBox);
}
}
if(_19){
_19._wrapperWidget.set("selected",false);
if(!_1a){
this._hideChild(_19);
}
}
if(_1a){
var _1c=_18._wrapperWidget.containerNode,_1d=_19._wrapperWidget.containerNode;
var _1e=_18._wrapperWidget.containerNode,_1f=_1._getMarginExtents(_1e),_20=_1._getPadBorderExtents(_1e),_21=_1f.h+_20.h;
_1d.style.height=(_1b._verticalSpace-_21)+"px";
this._animation=new _1.Animation({node:_1c,duration:this.duration,curve:[1,this._verticalSpace-_21-1],onAnimate:function(_22){
_22=Math.floor(_22);
_1c.style.height=_22+"px";
_1d.style.height=(_1b._verticalSpace-_21-_22)+"px";
},onEnd:function(){
delete _1b._animation;
_1c.style.height="auto";
_19._wrapperWidget.containerNode.style.display="none";
_1d.style.height="auto";
_1b._hideChild(_19);
}});
this._animation.onStop=this._animation.onEnd;
this._animation.play();
}
return d;
},_onKeyPress:function(e,_23){
if(this.disabled||e.altKey||!(_23||e.ctrlKey)){
return;
}
var k=_1.keys,c=e.charOrCode;
if((_23&&(c==k.LEFT_ARROW||c==k.UP_ARROW))||(e.ctrlKey&&c==k.PAGE_UP)){
this._adjacent(false)._buttonWidget._onTitleClick();
_1.stopEvent(e);
}else{
if((_23&&(c==k.RIGHT_ARROW||c==k.DOWN_ARROW))||(e.ctrlKey&&(c==k.PAGE_DOWN||c==k.TAB))){
this._adjacent(true)._buttonWidget._onTitleClick();
_1.stopEvent(e);
}
}
}});
_1.declare("dijit.layout._AccordionInnerContainer",[_2._Widget,_2._CssStateMixin],{baseClass:"dijitAccordionInnerContainer",isContainer:true,isLayoutContainer:true,buildRendering:function(){
this.domNode=_1.place("<div class='"+this.baseClass+"'>",this.contentWidget.domNode,"after");
var _24=this.contentWidget,cls=_1.getObject(this.buttonWidget);
this.button=_24._buttonWidget=(new cls({contentWidget:_24,label:_24.title,title:_24.tooltip,dir:_24.dir,lang:_24.lang,textDir:_24.textDir,iconClass:_24.iconClass,id:_24.id+"_button",parent:this.parent})).placeAt(this.domNode);
this.containerNode=_1.place("<div class='dijitAccordionChildWrapper' style='display:none'>",this.domNode);
_1.place(this.contentWidget.domNode,this.containerNode);
},postCreate:function(){
this.inherited(arguments);
var _25=this.button;
this._contentWidgetWatches=[this.contentWidget.watch("title",_1.hitch(this,function(_26,_27,_28){
_25.set("label",_28);
})),this.contentWidget.watch("tooltip",_1.hitch(this,function(_29,_2a,_2b){
_25.set("title",_2b);
})),this.contentWidget.watch("iconClass",_1.hitch(this,function(_2c,_2d,_2e){
_25.set("iconClass",_2e);
}))];
},_setSelectedAttr:function(_2f){
this._set("selected",_2f);
this.button.set("selected",_2f);
if(_2f){
var cw=this.contentWidget;
if(cw.onSelected){
cw.onSelected();
}
}
},startup:function(){
this.contentWidget.startup();
},destroy:function(){
this.button.destroyRecursive();
_1.forEach(this._contentWidgetWatches||[],function(w){
w.unwatch();
});
delete this.contentWidget._buttonWidget;
delete this.contentWidget._wrapperWidget;
this.inherited(arguments);
},destroyDescendants:function(){
this.contentWidget.destroyRecursive();
}});
_1.declare("dijit.layout._AccordionButton",[_2._Widget,_2._TemplatedMixin,_2._CssStateMixin],{templateString:_3,label:"",_setLabelAttr:{node:"titleTextNode",type:"innerHTML"},title:"",_setTitleAttr:{node:"titleTextNode",type:"attribute",attribute:"title"},iconClassAttr:"",_setIconClassAttr:{node:"iconNode",type:"class"},baseClass:"dijitAccordionTitle",getParent:function(){
return this.parent;
},buildRendering:function(){
this.inherited(arguments);
var _30=this.id.replace(" ","_");
_1.attr(this.titleTextNode,"id",_30+"_title");
this.focusNode.setAttribute("aria-labelledby",_1.attr(this.titleTextNode,"id"));
_1.setSelectable(this.domNode,false);
},getTitleHeight:function(){
return _1._getMarginSize(this.domNode).h;
},_onTitleClick:function(){
var _31=this.getParent();
_31.selectChild(this.contentWidget,true);
_2.focus(this.focusNode);
},_onTitleKeyPress:function(evt){
return this.getParent()._onKeyPress(evt,this.contentWidget);
},_setSelectedAttr:function(_32){
this._set("selected",_32);
this.focusNode.setAttribute("aria-expanded",_32);
this.focusNode.setAttribute("aria-selected",_32);
this.focusNode.setAttribute("tabIndex",_32?"0":"-1");
}});
if(!_1.isAsync){
_1.ready(0,function(){
var _33=["dijit/layout/AccordionPane"];
_4(_33);
});
}
return _2.layout.AccordionContainer;
});
