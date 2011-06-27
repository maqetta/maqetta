/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/Spinner.html"]="<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitButtonNode dijitSpinnerButtonContainer\"\n\t\t><input class=\"dijitReset dijitInputField dijitSpinnerButtonInner\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t/><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\n\t\t\tdojoAttachPoint=\"upArrowNode\"\n\t\t\t><div class=\"dijitArrowButtonInner\"\n\t\t\t\t><input class=\"dijitReset dijitInputField\" value=\"&#9650;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t\t\t${_buttonInputDisabled}\n\t\t\t/></div\n\t\t></div\n\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\n\t\t\tdojoAttachPoint=\"downArrowNode\"\n\t\t\t><div class=\"dijitArrowButtonInner\"\n\t\t\t\t><input class=\"dijitReset dijitInputField\" value=\"&#9660;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t\t\t${_buttonInputDisabled}\n\t\t\t/></div\n\t\t></div\n\t></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\n\t\t\trole=\"spinbutton\" autocomplete=\"off\" ${!nameAttrSetting}\n\t/></div\n></div>\n";
define("dijit/form/_Spinner",["dojo/_base/kernel","..","dojo/text!./templates/Spinner.html","./RangeBoundTextBox","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/lang","dojo/_base/sniff","dijit/typematic"],function(_1,_2,_3){
_1.declare("dijit.form._Spinner",_2.form.RangeBoundTextBox,{defaultTimeout:500,minimumTimeout:10,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:_3,baseClass:"dijitTextBox dijitSpinner",cssStateNodes:{"upArrowNode":"dijitUpArrowButton","downArrowNode":"dijitDownArrowButton"},adjust:function(_4,_5){
return _4;
},_arrowPressed:function(_6,_7,_8){
if(this.disabled||this.readOnly){
return;
}
this._setValueAttr(this.adjust(this.get("value"),_7*_8),false);
_2.selectInputText(this.textbox,this.textbox.value.length);
},_arrowReleased:function(_9){
this._wheelTimer=null;
},_typematicCallback:function(_a,_b,_c){
var _d=this.smallDelta;
if(_b==this.textbox){
var k=_1.keys;
var _e=_c.charOrCode;
_d=(_e==k.PAGE_UP||_e==k.PAGE_DOWN)?this.largeDelta:this.smallDelta;
_b=(_e==k.UP_ARROW||_e==k.PAGE_UP)?this.upArrowNode:this.downArrowNode;
}
if(_a==-1){
this._arrowReleased(_b);
}else{
this._arrowPressed(_b,(_b==this.upArrowNode)?1:-1,_d);
}
},_wheelTimer:null,_mouseWheeled:function(_f){
_1.stopEvent(_f);
var _10=_f.detail?(_f.detail*-1):(_f.wheelDelta/120);
if(_10!==0){
var _11=this[(_10>0?"upArrowNode":"downArrowNode")];
this._arrowPressed(_11,_10,this.smallDelta);
if(!this._wheelTimer){
clearTimeout(this._wheelTimer);
}
this._wheelTimer=setTimeout(_1.hitch(this,"_arrowReleased",_11),50);
}
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,!_1.isMozilla?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
this._connects.push(_2.typematic.addListener(this.upArrowNode,this.textbox,{charOrCode:_1.keys.UP_ARROW,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout,this.minimumTimeout));
this._connects.push(_2.typematic.addListener(this.downArrowNode,this.textbox,{charOrCode:_1.keys.DOWN_ARROW,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout,this.minimumTimeout));
this._connects.push(_2.typematic.addListener(this.upArrowNode,this.textbox,{charOrCode:_1.keys.PAGE_UP,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout,this.minimumTimeout));
this._connects.push(_2.typematic.addListener(this.downArrowNode,this.textbox,{charOrCode:_1.keys.PAGE_DOWN,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout,this.minimumTimeout));
}});
return _2.form._Spinner;
});
