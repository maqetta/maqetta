/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/_Plugin",["dojo/_base/kernel","..","../_Widget","../form/Button","dojo/_base/array","dojo/_base/connect","dojo/_base/lang"],function(_1,_2){
_1.declare("dijit._editor._Plugin",null,{constructor:function(_3,_4){
this.params=_3||{};
_1.mixin(this,this.params);
this._connects=[];
this._attrPairNames={};
},editor:null,iconClassPrefix:"dijitEditorIcon",button:null,command:"",useDefaultCommand:true,buttonClass:_2.form.Button,disabled:false,getLabel:function(_5){
return this.editor.commands[_5];
},_initButton:function(){
if(this.command.length){
var _6=this.getLabel(this.command),_7=this.editor,_8=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
var _9=_1.mixin({label:_6,dir:_7.dir,lang:_7.lang,showLabel:false,iconClass:_8,dropDown:this.dropDown,tabIndex:"-1"},this.params||{});
this.button=new this.buttonClass(_9);
}
}
if(this.get("disabled")&&this.button){
this.button.set("disabled",this.get("disabled"));
}
},destroy:function(){
_1.forEach(this._connects,_1.disconnect);
if(this.dropDown){
this.dropDown.destroyRecursive();
}
},connect:function(o,f,tf){
this._connects.push(_1.connect(o,f,this,tf));
},updateState:function(){
var e=this.editor,c=this.command,_a,_b;
if(!e||!e.isLoaded||!c.length){
return;
}
var _c=this.get("disabled");
if(this.button){
try{
_b=!_c&&e.queryCommandEnabled(c);
if(this.enabled!==_b){
this.enabled=_b;
this.button.set("disabled",!_b);
}
if(typeof this.button.checked=="boolean"){
_a=e.queryCommandState(c);
if(this.checked!==_a){
this.checked=_a;
this.button.set("checked",e.queryCommandState(c));
}
}
}
catch(e){
}
}
},setEditor:function(_d){
this.editor=_d;
this._initButton();
if(this.button&&this.useDefaultCommand){
if(this.editor.queryCommandAvailable(this.command)){
this.connect(this.button,"onClick",_1.hitch(this.editor,"execCommand",this.command,this.commandArg));
}else{
this.button.domNode.style.display="none";
}
}
this.connect(this.editor,"onNormalizedDisplayChanged","updateState");
},setToolbar:function(_e){
if(this.button){
_e.addChild(this.button);
}
},set:function(_f,_10){
if(typeof _f==="object"){
for(var x in _f){
this.set(x,_f[x]);
}
return this;
}
var _11=this._getAttrNames(_f);
if(this[_11.s]){
var _12=this[_11.s].apply(this,Array.prototype.slice.call(arguments,1));
}else{
this._set(_f,_10);
}
return _12||this;
},get:function(_13){
var _14=this._getAttrNames(_13);
return this[_14.g]?this[_14.g]():this[_13];
},_setDisabledAttr:function(_15){
this.disabled=_15;
this.updateState();
},_getAttrNames:function(_16){
var apn=this._attrPairNames;
if(apn[_16]){
return apn[_16];
}
var uc=_16.charAt(0).toUpperCase()+_16.substr(1);
return (apn[_16]={s:"_set"+uc+"Attr",g:"_get"+uc+"Attr"});
},_set:function(_17,_18){
var _19=this[_17];
this[_17]=_18;
}});
return _2._editor._Plugin;
});
