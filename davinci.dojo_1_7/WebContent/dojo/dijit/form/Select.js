/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/Select.html"]="<table class=\"dijit dijitReset dijitInline dijitLeft\"\n\tdojoAttachPoint=\"_buttonNode,tableNode,focusNode\" cellspacing='0' cellpadding='0'\n\trole=\"combobox\" aria-haspopup=\"true\"\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonContents dijitButtonNode\" role=\"presentation\"\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"  dojoAttachPoint=\"containerNode,_popupStateNode\"></span\n\t\t\t><input type=\"hidden\" ${!nameAttrSetting} dojoAttachPoint=\"valueNode\" value=\"${value}\" aria-hidden=\"true\"\n\t\t/></td><td class=\"dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton\"\n\t\t\t\tdojoAttachPoint=\"titleNode\" role=\"presentation\"\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" role=\"presentation\">&#9660;</div\n\t\t></td\n\t></tr></tbody\n></table>\n";
define("dijit/form/Select",["dojo/_base/kernel","..","dojo/text!./templates/Select.html","./_FormSelectWidget","../_HasDropDown","../Menu","../MenuItem","../MenuSeparator","../Tooltip","dojo/i18n!./nls/validate","dojo/_base/array","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/i18n"],function(_1,_2,_3){
_1.declare("dijit.form._SelectMenu",_2.Menu,{buildRendering:function(){
this.inherited(arguments);
var o=(this.menuTableNode=this.domNode);
var n=(this.domNode=_1.create("div",{style:{overflowX:"hidden",overflowY:"scroll"}}));
if(o.parentNode){
o.parentNode.replaceChild(n,o);
}
_1.removeClass(o,"dijitMenuTable");
n.className=o.className+" dijitSelectMenu";
o.className="dijitReset dijitMenuTable";
o.setAttribute("role","listbox");
n.setAttribute("role","presentation");
n.appendChild(o);
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onmousemove",_1.stopEvent);
},resize:function(mb){
if(mb){
_1.marginBox(this.domNode,mb);
if("w" in mb){
this.menuTableNode.style.width="100%";
}
}
}});
_1.declare("dijit.form.Select",[_2.form._FormSelectWidget,_2._HasDropDown],{baseClass:"dijitSelect",templateString:_3,required:false,state:"",message:"",tooltipPosition:[],emptyLabel:"&nbsp;",_isLoaded:false,_childrenLoaded:false,_fillContent:function(){
this.inherited(arguments);
if(this.options.length&&!this.value&&this.srcNodeRef){
var si=this.srcNodeRef.selectedIndex||0;
this.value=this.options[si>=0?si:0].value;
}
this.dropDown=new _2.form._SelectMenu({id:this.id+"_menu"});
_1.addClass(this.dropDown.domNode,this.baseClass+"Menu");
},_getMenuItemForOption:function(_4){
if(!_4.value&&!_4.label){
return new _2.MenuSeparator();
}else{
var _5=_1.hitch(this,"_setValueAttr",_4);
var _6=new _2.MenuItem({option:_4,label:_4.label||this.emptyLabel,onClick:_5,disabled:_4.disabled||false});
_6.focusNode.setAttribute("role","listitem");
return _6;
}
},_addOptionItem:function(_7){
if(this.dropDown){
this.dropDown.addChild(this._getMenuItemForOption(_7));
}
},_getChildren:function(){
if(!this.dropDown){
return [];
}
return this.dropDown.getChildren();
},_loadChildren:function(_8){
if(_8===true){
if(this.dropDown){
delete this.dropDown.focusedChild;
}
if(this.options.length){
this.inherited(arguments);
}else{
_1.forEach(this._getChildren(),function(_9){
_9.destroyRecursive();
});
var _a=new _2.MenuItem({label:"&nbsp;"});
this.dropDown.addChild(_a);
}
}else{
this._updateSelection();
}
this._isLoaded=false;
this._childrenLoaded=true;
if(!this._loadingStore){
this._setValueAttr(this.value);
}
},_setValueAttr:function(_b){
this.inherited(arguments);
_1.attr(this.valueNode,"value",this.get("value"));
},_setDisplay:function(_c){
var _d=_c||this.emptyLabel;
this.containerNode.innerHTML="<span class=\"dijitReset dijitInline "+this.baseClass+"Label\">"+_d+"</span>";
this.focusNode.setAttribute("aria-valuetext",_d);
},validate:function(_e){
var _f=this.isValid(_e);
this._set("state",_f?"":"Error");
this.focusNode.setAttribute("aria-invalid",_f?"false":"true");
var _10=_f?"":this._missingMsg;
if(this.message!==_10){
this._set("message",_10);
_2.hideTooltip(this.domNode);
if(_10){
_2.showTooltip(_10,this.domNode,this.tooltipPosition,!this.isLeftToRight());
}
}
return _f;
},isValid:function(_11){
return (!this.required||this.value===0||!(/^\s*$/.test(this.value||"")));
},reset:function(){
this.inherited(arguments);
_2.hideTooltip(this.domNode);
this._set("state","");
this._set("message","");
},postMixInProperties:function(){
this.inherited(arguments);
this._missingMsg=_1.i18n.getLocalization("dijit.form","validate",this.lang).missingMessage;
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onmousemove",_1.stopEvent);
},_setStyleAttr:function(_12){
this.inherited(arguments);
_1.toggleClass(this.domNode,this.baseClass+"FixedWidth",!!this.domNode.style.width);
},isLoaded:function(){
return this._isLoaded;
},loadDropDown:function(_13){
this._loadChildren(true);
this._isLoaded=true;
_13();
},closeDropDown:function(){
this.inherited(arguments);
if(this.dropDown&&this.dropDown.menuTableNode){
this.dropDown.menuTableNode.style.width="";
}
},uninitialize:function(_14){
if(this.dropDown&&!this.dropDown._destroyed){
this.dropDown.destroyRecursive(_14);
delete this.dropDown;
}
this.inherited(arguments);
},_onBlur:function(){
_2.hideTooltip(this.domNode);
this.inherited(arguments);
}});
return _2.form.Select;
});
