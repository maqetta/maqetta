/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/RangeSlider",["dojo","dijit","dojox","dijit/form/HorizontalSlider","dijit/form/VerticalSlider","dijit/focus","dojox/fx"],function(_1,_2,_3){
_1.getObject("dojox.form.RangeSlider",1);
(function(){
var _4=function(a,b){
return b-a;
},_5=function(a,b){
return a-b;
};
_1.declare("dojox.form._RangeSliderMixin",null,{value:[0,100],postMixInProperties:function(){
this.inherited(arguments);
this.value=_1.map(this.value,function(i){
return parseInt(i,10);
});
},postCreate:function(){
this.inherited(arguments);
this.value.sort(this._isReversed()?_4:_5);
var _6=this;
var _7=_1.declare(_2.form._SliderMoverMax,{constructor:function(){
this.widget=_6;
}});
this._movableMax=new _1.dnd.Moveable(this.sliderHandleMax,{mover:_7});
this.focusNodeMax.setAttribute("aria-valuemin",this.minimum);
this.focusNodeMax.setAttribute("aria-valuemax",this.maximum);
var _8=_1.declare(_2.form._SliderBarMover,{constructor:function(){
this.widget=_6;
}});
this._movableBar=new _1.dnd.Moveable(this.progressBar,{mover:_8});
},destroy:function(){
this.inherited(arguments);
this._movableMax.destroy();
this._movableBar.destroy();
},_onKeyPress:function(e){
if(this.disabled||this.readOnly||e.altKey||e.ctrlKey){
return;
}
var _9=e.currentTarget,_a=false,_b=false,k=_1.keys;
if(_9==this.sliderHandle){
_a=true;
}else{
if(_9==this.progressBar){
_b=_a=true;
}else{
if(_9==this.sliderHandleMax){
_b=true;
}
}
}
switch(e.keyCode){
case k.HOME:
this._setValueAttr(this.minimum,true,_b);
break;
case k.END:
this._setValueAttr(this.maximum,true,_b);
break;
case ((this._descending||this.isLeftToRight())?k.RIGHT_ARROW:k.LEFT_ARROW):
case (this._descending===false?k.DOWN_ARROW:k.UP_ARROW):
case (this._descending===false?k.PAGE_DOWN:k.PAGE_UP):
if(_a&&_b){
this._bumpValue([{"change":e.keyCode==k.PAGE_UP?this.pageIncrement:1,"useMaxValue":true},{"change":e.keyCode==k.PAGE_UP?this.pageIncrement:1,"useMaxValue":false}]);
}else{
if(_a){
this._bumpValue(e.keyCode==k.PAGE_UP?this.pageIncrement:1,true);
}else{
if(_b){
this._bumpValue(e.keyCode==k.PAGE_UP?this.pageIncrement:1);
}
}
}
break;
case ((this._descending||this.isLeftToRight())?k.LEFT_ARROW:k.RIGHT_ARROW):
case (this._descending===false?k.UP_ARROW:k.DOWN_ARROW):
case (this._descending===false?k.PAGE_UP:k.PAGE_DOWN):
if(_a&&_b){
this._bumpValue([{change:e.keyCode==k.PAGE_DOWN?-this.pageIncrement:-1,useMaxValue:false},{change:e.keyCode==k.PAGE_DOWN?-this.pageIncrement:-1,useMaxValue:true}]);
}else{
if(_a){
this._bumpValue(e.keyCode==k.PAGE_DOWN?-this.pageIncrement:-1);
}else{
if(_b){
this._bumpValue(e.keyCode==k.PAGE_DOWN?-this.pageIncrement:-1,true);
}
}
}
break;
default:
_2.form._FormValueWidget.prototype._onKeyPress.apply(this,arguments);
this.inherited(arguments);
return;
}
_1.stopEvent(e);
},_onHandleClickMax:function(e){
if(this.disabled||this.readOnly){
return;
}
if(!_1.isIE){
_2.focus(this.sliderHandleMax);
}
_1.stopEvent(e);
},_onClkIncBumper:function(){
this._setValueAttr(this._descending===false?this.minimum:this.maximum,true,true);
},_bumpValue:function(_c,_d){
var _e=_1.isArray(_c)?[this._getBumpValue(_c[0].change,_c[0].useMaxValue),this._getBumpValue(_c[1].change,_c[1].useMaxValue)]:this._getBumpValue(_c,_d);
this._setValueAttr(_e,true,!_1.isArray(_c)&&((_c>0&&!_d)||(_d&&_c<0)));
},_getBumpValue:function(_f,_10){
var s=_1.getComputedStyle(this.sliderBarContainer),c=_1._getContentBox(this.sliderBarContainer,s),_11=this.discreteValues,_12=!_10?this.value[0]:this.value[1];
if(_11<=1||_11==Infinity){
_11=c[this._pixelCount];
}
_11--;
if((this._isReversed()&&_f<0)||(_f>0&&!this._isReversed())){
_12=!_10?this.value[1]:this.value[0];
}
var _13=(_12-this.minimum)*_11/(this.maximum-this.minimum)+_f;
if(_13<0){
_13=0;
}
if(_13>_11){
_13=_11;
}
return _13*(this.maximum-this.minimum)/_11+this.minimum;
},_onBarClick:function(e){
if(this.disabled||this.readOnly){
return;
}
if(!_1.isIE){
_2.focus(this.progressBar);
}
_1.stopEvent(e);
},_onRemainingBarClick:function(e){
if(this.disabled||this.readOnly){
return;
}
if(!_1.isIE){
_2.focus(this.progressBar);
}
var _14=_1.coords(this.sliderBarContainer,true),bar=_1.coords(this.progressBar,true),_15=e[this._mousePixelCoord]-_14[this._startingPixelCoord],_16=bar[this._startingPixelCount],_17=_16+bar[this._pixelCount],_18=this._isReversed()?_15<=_16:_15>=_17,p=this._isReversed()?_14[this._pixelCount]-_15:_15;
this._setPixelValue(p,_14[this._pixelCount],true,_18);
_1.stopEvent(e);
},_setPixelValue:function(_19,_1a,_1b,_1c){
if(this.disabled||this.readOnly){
return;
}
var _1d=this._getValueByPixelValue(_19,_1a);
this._setValueAttr(_1d,_1b,_1c);
},_getValueByPixelValue:function(_1e,_1f){
_1e=_1e<0?0:_1f<_1e?_1f:_1e;
var _20=this.discreteValues;
if(_20<=1||_20==Infinity){
_20=_1f;
}
_20--;
var _21=_1f/_20;
var _22=Math.round(_1e/_21);
return (this.maximum-this.minimum)*_22/_20+this.minimum;
},_setValueAttr:function(_23,_24,_25){
var _26=this.value;
if(!_1.isArray(_23)){
if(_25){
if(this._isReversed()){
_26[0]=_23;
}else{
_26[1]=_23;
}
}else{
if(this._isReversed()){
_26[1]=_23;
}else{
_26[0]=_23;
}
}
}else{
_26=_23;
}
this._lastValueReported="";
this.valueNode.value=this.value=_23=_26;
this.focusNode.setAttribute("aria-valuenow",_26[0]);
this.focusNodeMax.setAttribute("aria-valuenow",_26[1]);
this.value.sort(this._isReversed()?_4:_5);
_2.form._FormValueWidget.prototype._setValueAttr.apply(this,arguments);
this._printSliderBar(_24,_25);
},_printSliderBar:function(_27,_28){
var _29=(this.value[0]-this.minimum)/(this.maximum-this.minimum);
var _2a=(this.value[1]-this.minimum)/(this.maximum-this.minimum);
var _2b=_29;
if(_29>_2a){
_29=_2a;
_2a=_2b;
}
var _2c=this._isReversed()?((1-_29)*100):(_29*100);
var _2d=this._isReversed()?((1-_2a)*100):(_2a*100);
var _2e=this._isReversed()?((1-_2a)*100):(_29*100);
if(_27&&this.slideDuration>0&&this.progressBar.style[this._progressPixelSize]){
var _2f=_28?_2a:_29;
var _30=this;
var _31={};
var _32=parseFloat(this.progressBar.style[this._handleOffsetCoord]);
var _33=this.slideDuration/10;
if(_33===0){
return;
}
if(_33<0){
_33=0-_33;
}
var _34={};
var _35={};
var _36={};
_34[this._handleOffsetCoord]={start:this.sliderHandle.style[this._handleOffsetCoord],end:_2c,units:"%"};
_35[this._handleOffsetCoord]={start:this.sliderHandleMax.style[this._handleOffsetCoord],end:_2d,units:"%"};
_36[this._handleOffsetCoord]={start:this.progressBar.style[this._handleOffsetCoord],end:_2e,units:"%"};
_36[this._progressPixelSize]={start:this.progressBar.style[this._progressPixelSize],end:(_2a-_29)*100,units:"%"};
var _37=_1.animateProperty({node:this.sliderHandle,duration:_33,properties:_34});
var _38=_1.animateProperty({node:this.sliderHandleMax,duration:_33,properties:_35});
var _39=_1.animateProperty({node:this.progressBar,duration:_33,properties:_36});
var _3a=_1.fx.combine([_37,_38,_39]);
_3a.play();
}else{
this.sliderHandle.style[this._handleOffsetCoord]=_2c+"%";
this.sliderHandleMax.style[this._handleOffsetCoord]=_2d+"%";
this.progressBar.style[this._handleOffsetCoord]=_2e+"%";
this.progressBar.style[this._progressPixelSize]=((_2a-_29)*100)+"%";
}
}});
_1.declare("dijit.form._SliderMoverMax",_2.form._SliderMover,{onMouseMove:function(e){
var _3b=this.widget;
var _3c=_3b._abspos;
if(!_3c){
_3c=_3b._abspos=_1.coords(_3b.sliderBarContainer,true);
_3b._setPixelValue_=_1.hitch(_3b,"_setPixelValue");
_3b._isReversed_=_3b._isReversed();
}
var _3d=e.touches?e.touches[0]:e;
var _3e=_3d[_3b._mousePixelCoord]-_3c[_3b._startingPixelCoord];
_3b._setPixelValue_(_3b._isReversed_?(_3c[_3b._pixelCount]-_3e):_3e,_3c[_3b._pixelCount],false,true);
},destroy:function(e){
_1.dnd.Mover.prototype.destroy.apply(this,arguments);
var _3f=this.widget;
_3f._abspos=null;
_3f._setValueAttr(_3f.value,true);
}});
_1.declare("dijit.form._SliderBarMover",_1.dnd.Mover,{onMouseMove:function(e){
var _40=this.widget;
if(_40.disabled||_40.readOnly){
return;
}
var _41=_40._abspos;
var bar=_40._bar;
var _42=_40._mouseOffset;
if(!_41){
_41=_40._abspos=_1.coords(_40.sliderBarContainer,true);
_40._setPixelValue_=_1.hitch(_40,"_setPixelValue");
_40._getValueByPixelValue_=_1.hitch(_40,"_getValueByPixelValue");
_40._isReversed_=_40._isReversed();
}
if(!bar){
bar=_40._bar=_1.coords(_40.progressBar,true);
}
var _43=e.touches?e.touches[0]:e;
if(!_42){
_42=_40._mouseOffset=_43[_40._mousePixelCoord]-_41[_40._startingPixelCoord]-bar[_40._startingPixelCount];
}
var _44=_43[_40._mousePixelCoord]-_41[_40._startingPixelCoord]-_42,_45=_44+bar[_40._pixelCount];
pixelValues=[_44,_45];
pixelValues.sort(_5);
if(pixelValues[0]<=0){
pixelValues[0]=0;
pixelValues[1]=bar[_40._pixelCount];
}
if(pixelValues[1]>=_41[_40._pixelCount]){
pixelValues[1]=_41[_40._pixelCount];
pixelValues[0]=_41[_40._pixelCount]-bar[_40._pixelCount];
}
var _46=[_40._getValueByPixelValue(_40._isReversed_?(_41[_40._pixelCount]-pixelValues[0]):pixelValues[0],_41[_40._pixelCount]),_40._getValueByPixelValue(_40._isReversed_?(_41[_40._pixelCount]-pixelValues[1]):pixelValues[1],_41[_40._pixelCount])];
_40._setValueAttr(_46,false,false);
},destroy:function(){
_1.dnd.Mover.prototype.destroy.apply(this,arguments);
var _47=this.widget;
_47._abspos=null;
_47._bar=null;
_47._mouseOffset=null;
_47._setValueAttr(_47.value,true);
}});
_1.declare("dojox.form.HorizontalRangeSlider",[_2.form.HorizontalSlider,_3.form._RangeSliderMixin],{templateString:_1.cache("dojox.form","resources/HorizontalRangeSlider.html","<table class=\"dijit dijitReset dijitSlider dijitSliderH dojoxRangeSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" dojoAttachEvent=\"onkeypress:_onKeyPress,onkeyup:_onKeyUp\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td dojoAttachPoint=\"topDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationT dijitSliderDecorationH\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderDecrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper\" dojoAttachEvent=\"onmousedown:_onClkDecBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" ${!nameAttrSetting}\n\t\t\t/><div role=\"presentation\" class=\"dojoxRangeSliderBarContainer\" dojoAttachPoint=\"sliderBarContainer\"\n\t\t\t\t><div dojoAttachPoint=\"sliderHandle\" tabIndex=\"${tabIndex}\" class=\"dijitSliderMoveable dijitSliderMoveableH\" dojoAttachEvent=\"onmousedown:_onHandleClick\" role=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleH\"></div\n\t\t\t\t></div\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"progressBar,focusNode\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" dojoAttachEvent=\"onmousedown:_onBarClick\"></div\n\t\t\t\t><div dojoAttachPoint=\"sliderHandleMax,focusNodeMax\" tabIndex=\"${tabIndex}\" class=\"dijitSliderMoveable dijitSliderMoveableH\" dojoAttachEvent=\"onmousedown:_onHandleClickMax\" role=\"sliderMax\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleH\"></div\n\t\t\t\t></div\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" dojoAttachEvent=\"onmousedown:_onRemainingBarClick\"></div\n\t\t\t></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper\" dojoAttachEvent=\"onmousedown:_onClkIncBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderIncrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\n\t\t></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td dojoAttachPoint=\"containerNode,bottomDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationB dijitSliderDecorationH\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n></table>\n")});
_1.declare("dojox.form.VerticalRangeSlider",[_2.form.VerticalSlider,_3.form._RangeSliderMixin],{templateString:_1.cache("dojox.form","resources/VerticalRangeSlider.html","<table class=\"dijitReset dijitSlider dijitSliderV dojoxRangeSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerV\"\n\t\t\t><div class=\"dijitSliderIncrementIconV\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\" dojoAttachEvent=\"onclick: increment\"><span class=\"dijitSliderButtonInner\">+</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperV dijitSliderTopBumper\" dojoAttachEvent=\"onclick:_onClkIncBumper\"></div></center\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td dojoAttachPoint=\"leftDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationL dijitSliderDecorationV\" style=\"text-align:center;height:100%;\"></td\n\t\t><td class=\"dijitReset\" style=\"height:100%;\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" ${!nameAttrSetting}\n\t\t\t/><center role=\"presentation\" style=\"position:relative;height:100%;\" dojoAttachPoint=\"sliderBarContainer\"\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarV dijitSliderRemainingBar dijitSliderRemainingBarV\" dojoAttachEvent=\"onmousedown:_onRemainingBarClick\"\n\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle\" tabIndex=\"${tabIndex}\" class=\"dijitSliderMoveable dijitSliderMoveableV\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onHandleClick\" style=\"vertical-align:top;\" role=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleV\"></div\n\t\t\t\t\t></div\n\t\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"progressBar,focusNode\" tabIndex=\"${tabIndex}\" class=\"dijitSliderBar dijitSliderBarV dijitSliderProgressBar dijitSliderProgressBarV\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onBarClick\"\n\t\t\t\t\t></div\n\t\t\t\t\t><div dojoAttachPoint=\"sliderHandleMax,focusNodeMax\" tabIndex=\"${tabIndex}\" class=\"dijitSliderMoveable dijitSliderMoveableV\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onHandleClickMax\" style=\"vertical-align:top;\" role=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleV\"></div\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t></center\n\t\t></td\n\t\t><td dojoAttachPoint=\"containerNode,rightDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationR dijitSliderDecorationV\" style=\"text-align:center;height:100%;\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperV dijitSliderBottomBumper\" dojoAttachEvent=\"onclick:_onClkDecBumper\"></div></center\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerV\"\n\t\t\t><div class=\"dijitSliderDecrementIconV\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\" dojoAttachEvent=\"onclick: decrement\"><span class=\"dijitSliderButtonInner\">-</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n></table>\n")});
})();
return _1.getObject("dojox.form.RangeSlider");
});
require(["dojox/form/RangeSlider"]);
