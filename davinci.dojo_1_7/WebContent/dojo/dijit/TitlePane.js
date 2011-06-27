/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/TitlePane.html"]="<div>\n\t<div dojoAttachEvent=\"onclick:_onTitleClick, onkeypress:_onTitleKey\"\n\t\t\tclass=\"dijitTitlePaneTitle\" dojoAttachPoint=\"titleBarNode\">\n\t\t<div class=\"dijitTitlePaneTitleFocus\" dojoAttachPoint=\"focusNode\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"arrowNode\" class=\"dijitArrowNode\" role=\"presentation\"\n\t\t\t/><span dojoAttachPoint=\"arrowNodeInner\" class=\"dijitArrowNodeInner\"></span\n\t\t\t><span dojoAttachPoint=\"titleNode\" class=\"dijitTitlePaneTextNode\"></span>\n\t\t</div>\n\t</div>\n\t<div class=\"dijitTitlePaneContentOuter\" dojoAttachPoint=\"hideNode\" role=\"presentation\">\n\t\t<div class=\"dijitReset\" dojoAttachPoint=\"wipeNode\" role=\"presentation\">\n\t\t\t<div class=\"dijitTitlePaneContentInner\" dojoAttachPoint=\"containerNode\" role=\"region\" id=\"${id}_pane\">\n\t\t\t\t<!-- nested divs because wipeIn()/wipeOut() doesn't work right on node w/padding etc.  Put padding on inner div. -->\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n";
define("dijit/TitlePane",["dojo/_base/kernel",".","dojo/text!./templates/TitlePane.html","dojo/fx","./_TemplatedMixin","./layout/ContentPane","./_CssStateMixin","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html"],function(_1,_2,_3){
_1.declare("dijit.TitlePane",[_2.layout.ContentPane,_2._TemplatedMixin,_2._CssStateMixin],{title:"",_setTitleAttr:{node:"titleNode",type:"innerHTML"},open:true,toggleable:true,tabIndex:"0",duration:_2.defaultDuration,baseClass:"dijitTitlePane",templateString:_3,_setTooltipAttr:{node:"focusNode",type:"attribute",attribute:"title"},buildRendering:function(){
this.inherited(arguments);
_1.setSelectable(this.titleNode,false);
},postCreate:function(){
this.inherited(arguments);
if(this.toggleable){
this._trackMouseState(this.titleBarNode,"dijitTitlePaneTitle");
}
var _4=this.hideNode,_5=this.wipeNode;
this._wipeIn=_1.fx.wipeIn({node:this.wipeNode,duration:this.duration,beforeBegin:function(){
_4.style.display="";
}});
this._wipeOut=_1.fx.wipeOut({node:this.wipeNode,duration:this.duration,onEnd:function(){
_4.style.display="none";
}});
},_setOpenAttr:function(_6,_7){
_1.forEach([this._wipeIn,this._wipeOut],function(_8){
if(_8&&_8.status()=="playing"){
_8.stop();
}
});
if(_7){
var _9=this[_6?"_wipeIn":"_wipeOut"];
_9.play();
}else{
this.hideNode.style.display=this.wipeNode.style.display=_6?"":"none";
}
if(this._started){
if(_6){
this._onShow();
}else{
this.onHide();
}
}
this.arrowNodeInner.innerHTML=_6?"-":"+";
this.containerNode.setAttribute("aria-hidden",_6?"false":"true");
this.focusNode.setAttribute("aria-pressed",_6?"true":"false");
this._set("open",_6);
this._setCss();
},_setToggleableAttr:function(_a){
this.focusNode.setAttribute("role",_a?"button":"heading");
if(_a){
this.focusNode.setAttribute("aria-controls",this.id+"_pane");
_1.attr(this.focusNode,"tabIndex",this.tabIndex);
}else{
_1.removeAttr(this.focusNode,"tabIndex");
}
this._set("toggleable",_a);
this._setCss();
},_setContentAttr:function(_b){
if(!this.open||!this._wipeOut||this._wipeOut.status()=="playing"){
this.inherited(arguments);
}else{
if(this._wipeIn&&this._wipeIn.status()=="playing"){
this._wipeIn.stop();
}
_1.marginBox(this.wipeNode,{h:_1.marginBox(this.wipeNode).h});
this.inherited(arguments);
if(this._wipeIn){
this._wipeIn.play();
}else{
this.hideNode.style.display="";
}
}
},toggle:function(){
this._setOpenAttr(!this.open,true);
},_setCss:function(){
var _c=this.titleBarNode||this.focusNode;
var _d=this._titleBarClass;
this._titleBarClass="dijit"+(this.toggleable?"":"Fixed")+(this.open?"Open":"Closed");
_1.replaceClass(_c,this._titleBarClass,_d||"");
this.arrowNodeInner.innerHTML=this.open?"-":"+";
},_onTitleKey:function(e){
if(e.charOrCode==_1.keys.ENTER||e.charOrCode==" "){
if(this.toggleable){
this.toggle();
}
_1.stopEvent(e);
}else{
if(e.charOrCode==_1.keys.DOWN_ARROW&&this.open){
this.containerNode.focus();
e.preventDefault();
}
}
},_onTitleClick:function(){
if(this.toggleable){
this.toggle();
}
},setTitle:function(_e){
_1.deprecated("dijit.TitlePane.setTitle() is deprecated.  Use set('title', ...) instead.","","2.0");
this.set("title",_e);
}});
return _2.TitlePane;
});
