/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/HorizontalSlider.html"]="<table class=\"dijit dijitReset dijitSlider dijitSliderH\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" dojoAttachEvent=\"onkeypress:_onKeyPress,onkeyup:_onKeyUp\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td dojoAttachPoint=\"topDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationT dijitSliderDecorationH\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderDecrementIconH\" style=\"display:none\" dojoAttachPoint=\"decrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper\" dojoAttachEvent=\"press:_onClkDecBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" ${!nameAttrSetting}\n\t\t\t/><div class=\"dijitReset dijitSliderBarContainerH\" role=\"presentation\" dojoAttachPoint=\"sliderBarContainer\"\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" dojoAttachEvent=\"press:_onBarClick\"\n\t\t\t\t\t><div class=\"dijitSliderMoveable dijitSliderMoveableH\"\n\t\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle,focusNode\" class=\"dijitSliderImageHandle dijitSliderImageHandleH\" dojoAttachEvent=\"press:_onHandleClick\" role=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"></div\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" dojoAttachEvent=\"press:_onBarClick\"></div\n\t\t\t></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper\" dojoAttachEvent=\"press:_onClkIncBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderIncrementIconH\" style=\"display:none\" dojoAttachPoint=\"incrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\n\t\t></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td dojoAttachPoint=\"containerNode,bottomDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationB dijitSliderDecorationH\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n></table>\n";
define("dijit/form/HorizontalSlider",["dojo/_base/kernel","..","dojo/text!./templates/HorizontalSlider.html","./_FormWidget","../_Container","dojo/dnd/move","./Button","../focus","dojo/number","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/fx","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/dnd/Moveable","dojo/dnd/Mover","dojo/query","dijit/typematic"],function(_1,_2,_3){
_1.declare("dijit.form.HorizontalSlider",[_2.form._FormValueWidget,_2._Container],{templateString:_3,value:0,showButtons:true,minimum:0,maximum:100,discreteValues:Infinity,pageIncrement:2,clickSelect:true,slideDuration:_2.defaultDuration,_setIdAttr:"",baseClass:"dijitSlider",cssStateNodes:{incrementButton:"dijitSliderIncrementButton",decrementButton:"dijitSliderDecrementButton",focusNode:"dijitSliderThumb"},_mousePixelCoord:"pageX",_pixelCount:"w",_startingPixelCoord:"x",_startingPixelCount:"l",_handleOffsetCoord:"left",_progressPixelSize:"width",_onKeyUp:function(e){
if(this.disabled||this.readOnly||e.altKey||e.ctrlKey||e.metaKey){
return;
}
this._setValueAttr(this.value,true);
},_onKeyPress:function(e){
if(this.disabled||this.readOnly||e.altKey||e.ctrlKey||e.metaKey){
return;
}
switch(e.charOrCode){
case _1.keys.HOME:
this._setValueAttr(this.minimum,false);
break;
case _1.keys.END:
this._setValueAttr(this.maximum,false);
break;
case ((this._descending||this.isLeftToRight())?_1.keys.RIGHT_ARROW:_1.keys.LEFT_ARROW):
case (this._descending===false?_1.keys.DOWN_ARROW:_1.keys.UP_ARROW):
case (this._descending===false?_1.keys.PAGE_DOWN:_1.keys.PAGE_UP):
this.increment(e);
break;
case ((this._descending||this.isLeftToRight())?_1.keys.LEFT_ARROW:_1.keys.RIGHT_ARROW):
case (this._descending===false?_1.keys.UP_ARROW:_1.keys.DOWN_ARROW):
case (this._descending===false?_1.keys.PAGE_UP:_1.keys.PAGE_DOWN):
this.decrement(e);
break;
default:
return;
}
_1.stopEvent(e);
},_onHandleClick:function(e){
if(this.disabled||this.readOnly){
return;
}
if(!_1.isIE){
_2.focus(this.sliderHandle);
}
_1.stopEvent(e);
},_isReversed:function(){
return !this.isLeftToRight();
},_onBarClick:function(e){
if(this.disabled||this.readOnly||!this.clickSelect){
return;
}
_2.focus(this.sliderHandle);
_1.stopEvent(e);
var _4=_1.position(this.sliderBarContainer,true);
var _5=e[this._mousePixelCoord]-_4[this._startingPixelCoord];
this._setPixelValue(this._isReversed()?(_4[this._pixelCount]-_5):_5,_4[this._pixelCount],true);
this._movable.onMouseDown(e);
},_setPixelValue:function(_6,_7,_8){
if(this.disabled||this.readOnly){
return;
}
_6=_6<0?0:_7<_6?_7:_6;
var _9=this.discreteValues;
if(_9<=1||_9==Infinity){
_9=_7;
}
_9--;
var _a=_7/_9;
var _b=Math.round(_6/_a);
this._setValueAttr((this.maximum-this.minimum)*_b/_9+this.minimum,_8);
},_setValueAttr:function(_c,_d){
this._set("value",_c);
this.valueNode.value=_c;
this.focusNode.setAttribute("aria-valuenow",_c);
this.inherited(arguments);
var _e=(_c-this.minimum)/(this.maximum-this.minimum);
var _f=(this._descending===false)?this.remainingBar:this.progressBar;
var _10=(this._descending===false)?this.progressBar:this.remainingBar;
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
if(_d&&this.slideDuration>0&&_f.style[this._progressPixelSize]){
var _11=this;
var _12={};
var _13=parseFloat(_f.style[this._progressPixelSize]);
var _14=this.slideDuration*(_e-_13/100);
if(_14==0){
return;
}
if(_14<0){
_14=0-_14;
}
_12[this._progressPixelSize]={start:_13,end:_e*100,units:"%"};
this._inProgressAnim=_1.animateProperty({node:_f,duration:_14,onAnimate:function(v){
_10.style[_11._progressPixelSize]=(100-parseFloat(v[_11._progressPixelSize]))+"%";
},onEnd:function(){
delete _11._inProgressAnim;
},properties:_12});
this._inProgressAnim.play();
}else{
_f.style[this._progressPixelSize]=(_e*100)+"%";
_10.style[this._progressPixelSize]=((1-_e)*100)+"%";
}
},_bumpValue:function(_15,_16){
if(this.disabled||this.readOnly){
return;
}
var s=_1.getComputedStyle(this.sliderBarContainer);
var c=_1._getContentBox(this.sliderBarContainer,s);
var _17=this.discreteValues;
if(_17<=1||_17==Infinity){
_17=c[this._pixelCount];
}
_17--;
var _18=(this.value-this.minimum)*_17/(this.maximum-this.minimum)+_15;
if(_18<0){
_18=0;
}
if(_18>_17){
_18=_17;
}
_18=_18*(this.maximum-this.minimum)/_17+this.minimum;
this._setValueAttr(_18,_16);
},_onClkBumper:function(val){
if(this.disabled||this.readOnly||!this.clickSelect){
return;
}
this._setValueAttr(val,true);
},_onClkIncBumper:function(){
this._onClkBumper(this._descending===false?this.minimum:this.maximum);
},_onClkDecBumper:function(){
this._onClkBumper(this._descending===false?this.maximum:this.minimum);
},decrement:function(e){
this._bumpValue(e.charOrCode==_1.keys.PAGE_DOWN?-this.pageIncrement:-1);
},increment:function(e){
this._bumpValue(e.charOrCode==_1.keys.PAGE_UP?this.pageIncrement:1);
},_mouseWheeled:function(evt){
_1.stopEvent(evt);
var _19=!_1.isMozilla;
var _1a=evt[(_19?"wheelDelta":"detail")]*(_19?1:-1);
this._bumpValue(_1a<0?-1:1,true);
},startup:function(){
if(this._started){
return;
}
_1.forEach(this.getChildren(),function(_1b){
if(this[_1b.container]!=this.containerNode){
this[_1b.container].appendChild(_1b.domNode);
}
},this);
this.inherited(arguments);
},_typematicCallback:function(_1c,_1d,e){
if(_1c==-1){
this._setValueAttr(this.value,true);
}else{
this[(_1d==(this._descending?this.incrementButton:this.decrementButton))?"decrement":"increment"](e);
}
},buildRendering:function(){
this.inherited(arguments);
if(this.showButtons){
this.incrementButton.style.display="";
this.decrementButton.style.display="";
}
var _1e=_1.query("label[for=\""+this.id+"\"]");
if(_1e.length){
_1e[0].id=(this.id+"_label");
this.focusNode.setAttribute("aria-labelledby",_1e[0].id);
}
this.focusNode.setAttribute("aria-valuemin",this.minimum);
this.focusNode.setAttribute("aria-valuemax",this.maximum);
},postCreate:function(){
this.inherited(arguments);
if(this.showButtons){
this._connects.push(_2.typematic.addMouseListener(this.decrementButton,this,"_typematicCallback",25,500));
this._connects.push(_2.typematic.addMouseListener(this.incrementButton,this,"_typematicCallback",25,500));
}
this.connect(this.domNode,!_1.isMozilla?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
var _1f=_1.declare(_2.form._SliderMover,{widget:this});
this._movable=new _1.dnd.Moveable(this.sliderHandle,{mover:_1f});
this._layoutHackIE7();
},destroy:function(){
this._movable.destroy();
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
this._supportingWidgets=_2.findWidgets(this.domNode);
this.inherited(arguments);
}});
_1.declare("dijit.form._SliderMover",_1.dnd.Mover,{onMouseMove:function(e){
var _20=this.widget;
var _21=_20._abspos;
if(!_21){
_21=_20._abspos=_1.position(_20.sliderBarContainer,true);
_20._setPixelValue_=_1.hitch(_20,"_setPixelValue");
_20._isReversed_=_20._isReversed();
}
var _22=e[_20._mousePixelCoord]-_21[_20._startingPixelCoord];
_20._setPixelValue_(_20._isReversed_?(_21[_20._pixelCount]-_22):_22,_21[_20._pixelCount],false);
},destroy:function(e){
_1.dnd.Mover.prototype.destroy.apply(this,arguments);
var _23=this.widget;
_23._abspos=null;
_23._setValueAttr(_23.value,true);
}});
return _2.form.HorizontalSlider;
});
