/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_CssStateMixin",["dojo/_base/kernel",".","dojo/touch","dojo/_base/array","dojo/_base/html","dojo/_base/lang","dojo/_base/window"],function(_1,_2,_3){
_1.declare("dijit._CssStateMixin",[],{cssStateNodes:{},hovering:false,active:false,_applyAttributes:function(){
this.inherited(arguments);
_1.forEach(["onmouseenter","onmouseleave",_3.press],function(e){
this.connect(this.domNode,e,"_cssMouseEvent");
},this);
_1.forEach(["disabled","readOnly","checked","selected","focused","state","hovering","active"],function(_4){
this.watch(_4,_1.hitch(this,"_setStateClass"));
},this);
for(var ap in this.cssStateNodes){
this._trackMouseState(this[ap],this.cssStateNodes[ap]);
}
this._setStateClass();
},_cssMouseEvent:function(_5){
if(!this.disabled){
switch(_5.type){
case "mouseenter":
case "mouseover":
this._set("hovering",true);
this._set("active",this._mouseDown);
break;
case "mouseleave":
case "mouseout":
this._set("hovering",false);
this._set("active",false);
break;
case "mousedown":
case "touchpress":
this._set("active",true);
this._mouseDown=true;
var _6=this.connect(_1.body(),_3.release,function(){
this._mouseDown=false;
this._set("active",false);
this.disconnect(_6);
});
break;
}
}
},_setStateClass:function(){
var _7=this.baseClass.split(" ");
function _8(_9){
_7=_7.concat(_1.map(_7,function(c){
return c+_9;
}),"dijit"+_9);
};
if(!this.isLeftToRight()){
_8("Rtl");
}
var _a=this.checked=="mixed"?"Mixed":(this.checked?"Checked":"");
if(this.checked){
_8(_a);
}
if(this.state){
_8(this.state);
}
if(this.selected){
_8("Selected");
}
if(this.disabled){
_8("Disabled");
}else{
if(this.readOnly){
_8("ReadOnly");
}else{
if(this.active){
_8("Active");
}else{
if(this.hovering){
_8("Hover");
}
}
}
}
if(this.focused){
_8("Focused");
}
var tn=this.stateNode||this.domNode,_b={};
_1.forEach(tn.className.split(" "),function(c){
_b[c]=true;
});
if("_stateClasses" in this){
_1.forEach(this._stateClasses,function(c){
delete _b[c];
});
}
_1.forEach(_7,function(c){
_b[c]=true;
});
var _c=[];
for(var c in _b){
_c.push(c);
}
tn.className=_c.join(" ");
this._stateClasses=_7;
},_trackMouseState:function(_d,_e){
var _f=false,_10=false,_11=false;
var _12=this,cn=_1.hitch(this,"connect",_d);
function _13(){
var _14=("disabled" in _12&&_12.disabled)||("readonly" in _12&&_12.readonly);
_1.toggleClass(_d,_e+"Hover",_f&&!_10&&!_14);
_1.toggleClass(_d,_e+"Active",_10&&!_14);
_1.toggleClass(_d,_e+"Focused",_11&&!_14);
};
cn("onmouseenter",function(){
_f=true;
_13();
});
cn("onmouseleave",function(){
_f=false;
_10=false;
_13();
});
cn(_3.press,function(){
_10=true;
_13();
});
cn(_3.release,function(){
_10=false;
_13();
});
cn("onfocus",function(){
_11=true;
_13();
});
cn("onblur",function(){
_11=false;
_13();
});
this.watch("disabled",_13);
this.watch("readOnly",_13);
}});
return _2._CssStateMixin;
});
