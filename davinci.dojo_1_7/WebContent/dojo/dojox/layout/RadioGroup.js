/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/RadioGroup",["dojo","dijit","dojox","dijit/_Widget","dijit/_Templated","dijit/_Contained","dijit/layout/StackContainer","dojo/fx/easing"],function(_1,_2,_3){
_1.getObject("dojox.layout.RadioGroup",1);
_1.experimental("dojox.layout.RadioGroup");
_1.declare("dojox.layout.RadioGroup",[_2.layout.StackContainer,_2._Templated],{duration:750,hasButtons:false,buttonClass:"dojox.layout._RadioButton",templateString:"<div class=\"dojoxRadioGroup\">"+" \t<div dojoAttachPoint=\"buttonHolder\" style=\"display:none;\">"+"\t\t<table class=\"dojoxRadioButtons\"><tbody><tr class=\"dojoxRadioButtonRow\" dojoAttachPoint=\"buttonNode\"></tr></tbody></table>"+"\t</div>"+"\t<div class=\"dojoxRadioView\" dojoAttachPoint=\"containerNode\"></div>"+"</div>",startup:function(){
this.inherited(arguments);
this._children=this.getChildren();
this._buttons=this._children.length;
this._size=_1.coords(this.containerNode);
if(this.hasButtons){
_1.style(this.buttonHolder,"display","block");
}
},_setupChild:function(_4){
_1.style(_4.domNode,"position","absolute");
if(this.hasButtons){
var _5=this.buttonNode.appendChild(_1.create("td"));
var n=_1.create("div",null,_5),_6=_1.getObject(this.buttonClass),_7=new _6({label:_4.title,page:_4},n);
_1.mixin(_4,{_radioButton:_7});
_7.startup();
}
_4.domNode.style.display="none";
},removeChild:function(_8){
if(this.hasButtons&&_8._radioButton){
_8._radioButton.destroy();
delete _8._radioButton;
}
this.inherited(arguments);
},_transition:function(_9,_a){
this._showChild(_9);
if(_a){
this._hideChild(_a);
}
if(this.doLayout&&_9.resize){
_9.resize(this._containerContentBox||this._contentBox);
}
},_showChild:function(_b){
var _c=this.getChildren();
_b.isFirstChild=(_b==_c[0]);
_b.isLastChild=(_b==_c[_c.length-1]);
_b.selected=true;
_b.domNode.style.display="";
if(_b._onShow){
_b._onShow();
}else{
if(_b.onShow){
_b.onShow();
}
}
},_hideChild:function(_d){
_d.selected=false;
_d.domNode.style.display="none";
if(_d.onHide){
_d.onHide();
}
}});
_1.declare("dojox.layout.RadioGroupFade",_3.layout.RadioGroup,{_hideChild:function(_e){
_1.fadeOut({node:_e.domNode,duration:this.duration,onEnd:_1.hitch(this,"inherited",arguments,arguments)}).play();
},_showChild:function(_f){
this.inherited(arguments);
_1.style(_f.domNode,"opacity",0);
_1.fadeIn({node:_f.domNode,duration:this.duration}).play();
}});
_1.declare("dojox.layout.RadioGroupSlide",_3.layout.RadioGroup,{easing:"dojo.fx.easing.backOut",zTop:99,constructor:function(){
if(_1.isString(this.easing)){
this.easing=_1.getObject(this.easing);
}
},_positionChild:function(_10){
if(!this._size){
return;
}
var rA=true,rB=true;
switch(_10.slideFrom){
case "bottom":
rB=!rB;
break;
case "right":
rA=!rA;
rB=!rB;
break;
case "top":
break;
case "left":
rA=!rA;
break;
default:
rA=Math.round(Math.random());
rB=Math.round(Math.random());
break;
}
var _11=rA?"top":"left",val=(rB?"-":"")+(this._size[rA?"h":"w"]+20)+"px";
_1.style(_10.domNode,_11,val);
},_showChild:function(_12){
var _13=this.getChildren();
_12.isFirstChild=(_12==_13[0]);
_12.isLastChild=(_12==_13[_13.length-1]);
_12.selected=true;
_1.style(_12.domNode,{zIndex:this.zTop,display:""});
if(this._anim&&this._anim.status()=="playing"){
this._anim.gotoPercent(100,true);
}
this._anim=_1.animateProperty({node:_12.domNode,properties:{left:0,top:0},duration:this.duration,easing:this.easing,onEnd:_1.hitch(_12,function(){
if(this.onShow){
this.onShow();
}
if(this._onShow){
this._onShow();
}
}),beforeBegin:_1.hitch(this,"_positionChild",_12)});
this._anim.play();
},_hideChild:function(_14){
_14.selected=false;
_14.domNode.style.zIndex=this.zTop-1;
if(_14.onHide){
_14.onHide();
}
}});
_1.declare("dojox.layout._RadioButton",[_2._Widget,_2._Templated,_2._Contained],{label:"",page:null,templateString:"<div dojoAttachPoint=\"focusNode\" class=\"dojoxRadioButton\"><span dojoAttachPoint=\"titleNode\" class=\"dojoxRadioButtonLabel\">${label}</span></div>",startup:function(){
this.connect(this.domNode,"onmouseenter","_onMouse");
},_onMouse:function(e){
this.getParent().selectChild(this.page);
this._clearSelected();
_1.addClass(this.domNode,"dojoxRadioButtonSelected");
},_clearSelected:function(){
_1.query(".dojoxRadioButtonSelected",this.domNode.parentNode.parentNode).removeClass("dojoxRadioButtonSelected");
}});
_1.extend(_2._Widget,{slideFrom:"random"});
return _1.getObject("dojox.layout.RadioGroup");
});
require(["dojox/layout/RadioGroup"]);
