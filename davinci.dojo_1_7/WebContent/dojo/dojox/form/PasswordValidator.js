/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/PasswordValidator",["dojo","dijit","dojox","dijit/form/_FormWidget","dijit/form/ValidationTextBox","dojo/i18n","dojox/form/nls/PasswordValidator"],function(_1,_2,_3){
_1.getObject("dojox.form.PasswordValidator",1);
_1.requireLocalization("dojox.form","PasswordValidator");
_1.declare("dojox.form._ChildTextBox",_2.form.ValidationTextBox,{containerWidget:null,type:"password",reset:function(){
_2.form.ValidationTextBox.prototype._setValueAttr.call(this,"",true);
this._hasBeenBlurred=false;
},postCreate:function(){
this.inherited(arguments);
if(!this.name){
_1.removeAttr(this.focusNode,"name");
}
this.connect(this.focusNode,"onkeypress","_onChildKeyPress");
},_onChildKeyPress:function(e){
if(e&&e.keyCode==_1.keys.ENTER){
this._setBlurValue();
}
}});
_1.declare("dojox.form._OldPWBox",_3.form._ChildTextBox,{_isPWValid:false,_setValueAttr:function(_4,_5){
if(_4===""){
_4=_3.form._OldPWBox.superclass.attr.call(this,"value");
}
if(_5!==null){
this._isPWValid=this.containerWidget.pwCheck(_4);
}
this.inherited(arguments);
this.containerWidget._childValueAttr(this.containerWidget._inputWidgets[1].get("value"));
},isValid:function(_6){
return this.inherited("isValid",arguments)&&this._isPWValid;
},_update:function(e){
if(this._hasBeenBlurred){
this.validate(true);
}
this._onMouse(e);
},_getValueAttr:function(){
if(this.containerWidget._started&&this.containerWidget.isValid()){
return this.inherited(arguments);
}
return "";
},_setBlurValue:function(){
var _7=_2.form.ValidationTextBox.prototype._getValueAttr.call(this);
this._setValueAttr(_7,(this.isValid?this.isValid():true));
}});
_1.declare("dojox.form._NewPWBox",_3.form._ChildTextBox,{required:true,onChange:function(){
this.containerWidget._inputWidgets[2].validate(false);
this.inherited(arguments);
}});
_1.declare("dojox.form._VerifyPWBox",_3.form._ChildTextBox,{isValid:function(_8){
return this.inherited("isValid",arguments)&&(this.get("value")==this.containerWidget._inputWidgets[1].get("value"));
}});
_1.declare("dojox.form.PasswordValidator",_2.form._FormValueWidget,{required:true,_inputWidgets:null,oldName:"",templateString:_1.cache("dojox.form","resources/PasswordValidator.html","<div dojoAttachPoint=\"containerNode\">\n\t<input type=\"hidden\" name=\"${name}\" value=\"\" dojoAttachPoint=\"focusNode\" />\n</div>"),_hasBeenBlurred:false,isValid:function(_9){
return _1.every(this._inputWidgets,function(i){
if(i&&i._setStateClass){
i._setStateClass();
}
return (!i||i.isValid());
});
},validate:function(_a){
return _1.every(_1.map(this._inputWidgets,function(i){
if(i&&i.validate){
i._hasBeenBlurred=(i._hasBeenBlurred||this._hasBeenBlurred);
return i.validate();
}
return true;
},this),"return item;");
},reset:function(){
this._hasBeenBlurred=false;
_1.forEach(this._inputWidgets,function(i){
if(i&&i.reset){
i.reset();
}
},this);
},_createSubWidgets:function(){
var _b=this._inputWidgets,_c=_1.i18n.getLocalization("dojox.form","PasswordValidator",this.lang);
_1.forEach(_b,function(i,_d){
if(i){
var p={containerWidget:this},c;
if(_d===0){
p.name=this.oldName;
p.invalidMessage=_c.badPasswordMessage;
c=_3.form._OldPWBox;
}else{
if(_d===1){
p.required=this.required;
c=_3.form._NewPWBox;
}else{
if(_d===2){
p.invalidMessage=_c.nomatchMessage;
c=_3.form._VerifyPWBox;
}
}
}
_b[_d]=new c(p,i);
}
},this);
},pwCheck:function(_e){
return false;
},postCreate:function(){
this.inherited(arguments);
var _f=this._inputWidgets=[];
_1.forEach(["old","new","verify"],function(i){
_f.push(_1.query("input[pwType="+i+"]",this.containerNode)[0]);
},this);
if(!_f[1]||!_f[2]){
throw new Error("Need at least pwType=\"new\" and pwType=\"verify\"");
}
if(this.oldName&&!_f[0]){
throw new Error("Need to specify pwType=\"old\" if using oldName");
}
this.containerNode=this.domNode;
this._createSubWidgets();
this.connect(this._inputWidgets[1],"_setValueAttr","_childValueAttr");
this.connect(this._inputWidgets[2],"_setValueAttr","_childValueAttr");
},_childValueAttr:function(v){
this.set("value",this.isValid()?v:"");
},_setDisabledAttr:function(_10){
this.inherited(arguments);
_1.forEach(this._inputWidgets,function(i){
if(i&&i.set){
i.set("disabled",_10);
}
});
},_setRequiredAttribute:function(_11){
this.required=_11;
_1.attr(this.focusNode,"required",_11);
this.focusNode.setAttribute("aria-required",_11);
this._refreshState();
_1.forEach(this._inputWidgets,function(i){
if(i&&i.set){
i.set("required",_11);
}
});
},_setValueAttr:function(v){
this.inherited(arguments);
_1.attr(this.focusNode,"value",v);
},_getValueAttr:function(){
return this.inherited(arguments)||"";
},focus:function(){
var f=false;
_1.forEach(this._inputWidgets,function(i){
if(i&&!i.isValid()&&!f){
i.focus();
f=true;
}
});
if(!f){
this._inputWidgets[1].focus();
}
}});
return _1.getObject("dojox.form.PasswordValidator");
});
require(["dojox/form/PasswordValidator"]);
