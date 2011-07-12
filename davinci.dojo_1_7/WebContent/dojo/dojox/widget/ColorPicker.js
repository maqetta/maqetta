/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dojox/widget/ColorPicker/ColorPicker.html"]="<table class=\"dojoxColorPicker\" dojoAttachEvent=\"onkeypress: _handleKey\" cellpadding=\"0\" cellspacing=\"0\">\n\t<tr>\n\t\t<td valign=\"top\" class=\"dojoxColorPickerRightPad\">\n\t\t\t<div class=\"dojoxColorPickerBox\">\n\t\t\t\t<!-- Forcing ABS in style attr due to dojo DND issue with not picking it up form the class. -->\n\t\t\t\t<img role=\"status\" title=\"${saturationPickerTitle}\" alt=\"${saturationPickerTitle}\" class=\"dojoxColorPickerPoint\" src=\"${_pickerPointer}\" tabIndex=\"0\" dojoAttachPoint=\"cursorNode\" style=\"position: absolute; top: 0px; left: 0px;\">\n\t\t\t\t<img role=\"presentation\" alt=\"\" dojoAttachPoint=\"colorUnderlay\" dojoAttachEvent=\"onclick: _setPoint, onmousedown: _stopDrag\" class=\"dojoxColorPickerUnderlay\" src=\"${_underlay}\" ondragstart=\"return false\">\n\t\t\t</div>\n\t\t</td>\n\t\t<td valign=\"top\" class=\"dojoxColorPickerRightPad\">\n\t\t\t<div class=\"dojoxHuePicker\">\n\t\t\t\t<!-- Forcing ABS in style attr due to dojo DND issue with not picking it up form the class. -->\n\t\t\t\t<img role=\"status\" dojoAttachPoint=\"hueCursorNode\" tabIndex=\"0\" class=\"dojoxHuePickerPoint\" title=\"${huePickerTitle}\" alt=\"${huePickerTitle}\" src=\"${_huePickerPointer}\" style=\"position: absolute; top: 0px; left: 0px;\">\n\t\t\t\t<div class=\"dojoxHuePickerUnderlay\" dojoAttachPoint=\"hueNode\">\n\t\t\t\t    <img role=\"presentation\" alt=\"\" dojoAttachEvent=\"onclick: _setHuePoint, onmousedown: _stopDrag\" src=\"${_hueUnderlay}\">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</td>\n\t\t<td valign=\"top\">\n\t\t\t<table cellpadding=\"0\" cellspacing=\"0\">\n\t\t\t\t<tr>\n\t\t\t\t\t<td valign=\"top\" class=\"dojoxColorPickerPreviewContainer\">\n\t\t\t\t\t\t<table cellpadding=\"0\" cellspacing=\"0\">\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td valign=\"top\" class=\"dojoxColorPickerRightPad\">\n\t\t\t\t\t\t\t\t\t<div dojoAttachPoint=\"previewNode\" class=\"dojoxColorPickerPreview\"></div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td valign=\"top\">\n\t\t\t\t\t\t\t\t\t<div dojoAttachPoint=\"safePreviewNode\" class=\"dojoxColorPickerWebSafePreview\"></div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t</td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td valign=\"bottom\">\n\t\t\t\t\t\t<table class=\"dojoxColorPickerOptional\" cellpadding=\"0\" cellspacing=\"0\">\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t<div class=\"dijitInline dojoxColorPickerRgb\" dojoAttachPoint=\"rgbNode\">\n\t\t\t\t\t\t\t\t\t\t<table cellpadding=\"1\" cellspacing=\"1\">\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_r\">${redLabel}</label></td><td><input id=\"${_uId}_r\" dojoAttachPoint=\"Rval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"></td></tr>\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_g\">${greenLabel}</label></td><td><input id=\"${_uId}_g\" dojoAttachPoint=\"Gval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"></td></tr>\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_b\">${blueLabel}</label></td><td><input id=\"${_uId}_b\" dojoAttachPoint=\"Bval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"></td></tr>\n\t\t\t\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t<div class=\"dijitInline dojoxColorPickerHsv\" dojoAttachPoint=\"hsvNode\">\n\t\t\t\t\t\t\t\t\t\t<table cellpadding=\"1\" cellspacing=\"1\">\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_h\">${hueLabel}</label></td><td><input id=\"${_uId}_h\" dojoAttachPoint=\"Hval\"size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"> ${degLabel}</td></tr>\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_s\">${saturationLabel}</label></td><td><input id=\"${_uId}_s\" dojoAttachPoint=\"Sval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"> ${percentSign}</td></tr>\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_v\">${valueLabel}</label></td><td><input id=\"${_uId}_v\" dojoAttachPoint=\"Vval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"> ${percentSign}</td></tr>\n\t\t\t\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td colspan=\"2\">\n\t\t\t\t\t\t\t\t\t<div class=\"dojoxColorPickerHex\" dojoAttachPoint=\"hexNode\" aria-live=\"polite\">\t\n\t\t\t\t\t\t\t\t\t\t<label for=\"${_uId}_hex\">&nbsp;${hexLabel}&nbsp;</label><input id=\"${_uId}_hex\" dojoAttachPoint=\"hexCode, focusNode, valueNode\" size=\"6\" class=\"dojoxColorPickerHexCode\" dojoAttachEvent=\"onchange: _colorInputChange\">\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t</td>\n\t\t\t\t</tr>\n\t\t\t</table>\n\t\t</td>\n\t</tr>\n</table>\n\n";
define("dojox/widget/ColorPicker",["dojo/_base/html","dojo/_base/connect","dojo/fx","dojo/dnd/move","dijit/form/_FormWidget","dijit/focus","dijit/typematic","dojox/color","dojo/i18n","dojo/i18n!./nls/ColorPicker","dojo/i18n!dojo/cldr/nls/number","dojo/text!./ColorPicker/ColorPicker.html"],function(_1,_2,fx,_3,_4,_5,_6,_7,_8,_9,_a,_b){
_1.experimental("dojox.widget.ColorPicker");
var _c=function(_d){
return _d;
};
return _1.declare("dojox.widget.ColorPicker",dijit.form._FormWidget,{showRgb:true,showHsv:true,showHex:true,webSafe:true,animatePoint:true,slideDuration:250,liveUpdate:false,PICKER_HUE_H:150,PICKER_SAT_VAL_H:150,PICKER_SAT_VAL_W:150,PICKER_HUE_SELECTOR_H:8,PICKER_SAT_SELECTOR_H:10,PICKER_SAT_SELECTOR_W:10,value:"#ffffff",_underlay:_1.moduleUrl("dojox.widget","ColorPicker/images/underlay.png"),_hueUnderlay:_1.moduleUrl("dojox.widget","ColorPicker/images/hue.png"),_pickerPointer:_1.moduleUrl("dojox.widget","ColorPicker/images/pickerPointer.png"),_huePickerPointer:_1.moduleUrl("dojox.widget","ColorPicker/images/hueHandle.png"),_huePickerPointerAlly:_1.moduleUrl("dojox.widget","ColorPicker/images/hueHandleA11y.png"),templateString:_b,postMixInProperties:function(){
if(_1.hasClass(_1.body(),"dijit_a11y")){
this._huePickerPointer=this._huePickerPointerAlly;
}
this._uId=dijit.getUniqueId(this.id);
_1.mixin(this,_8.getLocalization("dojox.widget","ColorPicker"));
_1.mixin(this,_8.getLocalization("dojo.cldr","number"));
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
if(_1.isIE<7){
this.colorUnderlay.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+this._underlay+"', sizingMethod='scale')";
this.colorUnderlay.src=this._blankGif.toString();
}
if(!this.showRgb){
this.rgbNode.style.visibility="hidden";
}
if(!this.showHsv){
this.hsvNode.style.visibility="hidden";
}
if(!this.showHex){
this.hexNode.style.visibility="hidden";
}
if(!this.webSafe){
this.safePreviewNode.style.visibility="hidden";
}
},startup:function(){
if(this._started){
return;
}
this._started=true;
this.set("value",this.value);
this._mover=new _1.dnd.move.boxConstrainedMoveable(this.cursorNode,{box:{t:-(this.PICKER_SAT_SELECTOR_H/2),l:-(this.PICKER_SAT_SELECTOR_W/2),w:this.PICKER_SAT_VAL_W,h:this.PICKER_SAT_VAL_H}});
this._hueMover=new _1.dnd.move.boxConstrainedMoveable(this.hueCursorNode,{box:{t:-(this.PICKER_HUE_SELECTOR_H/2),l:0,w:0,h:this.PICKER_HUE_H}});
this._subs=[];
this._subs.push(_1.subscribe("/dnd/move/stop",_1.hitch(this,"_clearTimer")));
this._subs.push(_1.subscribe("/dnd/move/start",_1.hitch(this,"_setTimer")));
this._keyListeners=[];
this._connects.push(dijit.typematic.addKeyListener(this.hueCursorNode,{charOrCode:_1.keys.UP_ARROW,shiftKey:false,metaKey:false,ctrlKey:false,altKey:false},this,_1.hitch(this,this._updateHueCursorNode),25,25));
this._connects.push(dijit.typematic.addKeyListener(this.hueCursorNode,{charOrCode:_1.keys.DOWN_ARROW,shiftKey:false,metaKey:false,ctrlKey:false,altKey:false},this,_1.hitch(this,this._updateHueCursorNode),25,25));
this._connects.push(dijit.typematic.addKeyListener(this.cursorNode,{charOrCode:_1.keys.UP_ARROW,shiftKey:false,metaKey:false,ctrlKey:false,altKey:false},this,_1.hitch(this,this._updateCursorNode),25,25));
this._connects.push(dijit.typematic.addKeyListener(this.cursorNode,{charOrCode:_1.keys.DOWN_ARROW,shiftKey:false,metaKey:false,ctrlKey:false,altKey:false},this,_1.hitch(this,this._updateCursorNode),25,25));
this._connects.push(dijit.typematic.addKeyListener(this.cursorNode,{charOrCode:_1.keys.LEFT_ARROW,shiftKey:false,metaKey:false,ctrlKey:false,altKey:false},this,_1.hitch(this,this._updateCursorNode),25,25));
this._connects.push(dijit.typematic.addKeyListener(this.cursorNode,{charOrCode:_1.keys.RIGHT_ARROW,shiftKey:false,metaKey:false,ctrlKey:false,altKey:false},this,_1.hitch(this,this._updateCursorNode),25,25));
},_setValueAttr:function(_e){
if(!this._started){
return;
}
this.setColor(_e,true);
},setColor:function(_f,_10){
var col=dojox.color.fromString(_f);
this._updatePickerLocations(col);
this._updateColorInputs(col);
this._updateValue(col,_10);
},_setTimer:function(_11){
dijit.focus(_11.node);
_1.setSelectable(this.domNode,false);
this._timer=setInterval(_1.hitch(this,"_updateColor"),45);
},_clearTimer:function(_12){
clearInterval(this._timer);
this._timer=null;
this.onChange(this.value);
_1.setSelectable(this.domNode,true);
},_setHue:function(h){
_1.style(this.colorUnderlay,"backgroundColor",dojox.color.fromHsv(h,100,100).toHex());
},_updateHueCursorNode:function(_13,_14,e){
if(_13!==-1){
var y=_1.style(this.hueCursorNode,"top");
var _15=(this.PICKER_HUE_SELECTOR_H/2);
y+=_15;
var _16=false;
if(e.charOrCode==_1.keys.UP_ARROW){
if(y>0){
y-=1;
_16=true;
}
}else{
if(e.charOrCode==_1.keys.DOWN_ARROW){
if(y<this.PICKER_HUE_H){
y+=1;
_16=true;
}
}
}
y-=_15;
if(_16){
_1.style(this.hueCursorNode,"top",y+"px");
}
}else{
this._updateColor(true);
}
},_updateCursorNode:function(_17,_18,e){
var _19=this.PICKER_SAT_SELECTOR_H/2;
var _1a=this.PICKER_SAT_SELECTOR_W/2;
if(_17!==-1){
var y=_1.style(this.cursorNode,"top");
var x=_1.style(this.cursorNode,"left");
y+=_19;
x+=_1a;
var _1b=false;
if(e.charOrCode==_1.keys.UP_ARROW){
if(y>0){
y-=1;
_1b=true;
}
}else{
if(e.charOrCode==_1.keys.DOWN_ARROW){
if(y<this.PICKER_SAT_VAL_H){
y+=1;
_1b=true;
}
}else{
if(e.charOrCode==_1.keys.LEFT_ARROW){
if(x>0){
x-=1;
_1b=true;
}
}else{
if(e.charOrCode==_1.keys.RIGHT_ARROW){
if(x<this.PICKER_SAT_VAL_W){
x+=1;
_1b=true;
}
}
}
}
}
if(_1b){
y-=_19;
x-=_1a;
_1.style(this.cursorNode,"top",y+"px");
_1.style(this.cursorNode,"left",x+"px");
}
}else{
this._updateColor(true);
}
},_updateColor:function(){
var _1c=this.PICKER_HUE_SELECTOR_H/2,_1d=this.PICKER_SAT_SELECTOR_H/2,_1e=this.PICKER_SAT_SELECTOR_W/2;
var _1f=_1.style(this.hueCursorNode,"top")+_1c,_20=_1.style(this.cursorNode,"top")+_1d,_21=_1.style(this.cursorNode,"left")+_1e,h=Math.round(360-(_1f/this.PICKER_HUE_H*360)),col=dojox.color.fromHsv(h,_21/this.PICKER_SAT_VAL_W*100,100-(_20/this.PICKER_SAT_VAL_H*100));
this._updateColorInputs(col);
this._updateValue(col,true);
if(h!=this._hue){
this._setHue(h);
}
},_colorInputChange:function(e){
var col,_22=false;
switch(e.target){
case this.hexCode:
col=dojox.color.fromString(e.target.value);
_22=true;
break;
case this.Rval:
case this.Gval:
case this.Bval:
col=dojox.color.fromArray([this.Rval.value,this.Gval.value,this.Bval.value]);
_22=true;
break;
case this.Hval:
case this.Sval:
case this.Vval:
col=dojox.color.fromHsv(this.Hval.value,this.Sval.value,this.Vval.value);
_22=true;
break;
}
if(_22){
this._updatePickerLocations(col);
this._updateColorInputs(col);
this._updateValue(col,true);
}
},_updateValue:function(col,_23){
var hex=col.toHex();
this.value=this.valueNode.value=hex;
if(_23&&(!this._timer||this.liveUpdate)){
this.onChange(hex);
}
},_updatePickerLocations:function(col){
var _24=this.PICKER_HUE_SELECTOR_H/2,_25=this.PICKER_SAT_SELECTOR_H/2,_26=this.PICKER_SAT_SELECTOR_W/2;
var hsv=col.toHsv(),_27=Math.round(this.PICKER_HUE_H-hsv.h/360*this.PICKER_HUE_H)-_24,_28=Math.round(hsv.s/100*this.PICKER_SAT_VAL_W)-_26,_29=Math.round(this.PICKER_SAT_VAL_H-hsv.v/100*this.PICKER_SAT_VAL_H)-_25;
if(this.animatePoint){
_1.fx.slideTo({node:this.hueCursorNode,duration:this.slideDuration,top:_27,left:0}).play();
_1.fx.slideTo({node:this.cursorNode,duration:this.slideDuration,top:_29,left:_28}).play();
}else{
_1.style(this.hueCursorNode,"top",_27+"px");
_1.style(this.cursorNode,{left:_28+"px",top:_29+"px"});
}
if(hsv.h!=this._hue){
this._setHue(hsv.h);
}
},_updateColorInputs:function(col){
var hex=col.toHex();
if(this.showRgb){
this.Rval.value=col.r;
this.Gval.value=col.g;
this.Bval.value=col.b;
}
if(this.showHsv){
var hsv=col.toHsv();
this.Hval.value=Math.round((hsv.h));
this.Sval.value=Math.round(hsv.s);
this.Vval.value=Math.round(hsv.v);
}
if(this.showHex){
this.hexCode.value=hex;
}
this.previewNode.style.backgroundColor=hex;
if(this.webSafe){
this.safePreviewNode.style.backgroundColor=_c(hex);
}
},_setHuePoint:function(evt){
var _2a=(this.PICKER_HUE_SELECTOR_H/2);
var _2b=evt.layerY-_2a;
if(this.animatePoint){
_1.fx.slideTo({node:this.hueCursorNode,duration:this.slideDuration,top:_2b,left:0,onEnd:_1.hitch(this,function(){
this._updateColor(true);
dijit.focus(this.hueCursorNode);
})}).play();
}else{
_1.style(this.hueCursorNode,"top",_2b+"px");
this._updateColor(false);
}
},_setPoint:function(evt){
var _2c=this.PICKER_SAT_SELECTOR_H/2;
var _2d=this.PICKER_SAT_SELECTOR_W/2;
var _2e=evt.layerY-_2c;
var _2f=evt.layerX-_2d;
if(evt){
dijit.focus(evt.target);
}
if(this.animatePoint){
_1.fx.slideTo({node:this.cursorNode,duration:this.slideDuration,top:_2e,left:_2f,onEnd:_1.hitch(this,function(){
this._updateColor(true);
dijit.focus(this.cursorNode);
})}).play();
}else{
_1.style(this.cursorNode,{left:_2f+"px",top:_2e+"px"});
this._updateColor(false);
}
},_handleKey:function(e){
},focus:function(){
if(!this.focused){
dijit.focus(this.focusNode);
}
},_stopDrag:function(e){
_1.stopEvent(e);
},destroy:function(){
this.inherited(arguments);
_1.forEach(this._subs,function(sub){
_1.unsubscribe(sub);
});
delete this._subs;
}});
});
