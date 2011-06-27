/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/CheckedMultiSelect",["dojo","dijit","dojo/i18n","dijit/_Templated","dijit/_Widget","dijit/Menu","dijit/MenuItem","dijit/Tooltip","dijit/form/_FormSelectWidget","dijit/form/CheckBox","dijit/form/ComboButton","dojo/i18n!dojox/form/nls/CheckedMultiSelect"],function(_1,_2){
_1.declare("dojox.form._CheckedMultiSelectItem",[_2._Widget,_2._Templated],{widgetsInTemplate:true,templateString:_1.cache("dojox.form","resources/_CheckedMultiSelectItem.html"),baseClass:"dojoxMultiSelectItem",option:null,parent:null,disabled:false,readOnly:false,postMixInProperties:function(){
this._type=this.parent.multiple?{type:"checkbox",baseClass:"dijitCheckBox"}:{type:"radio",baseClass:"dijitRadio"};
this.disabled=this.option.disabled=this.option.disabled||false;
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
this.labelNode.innerHTML=this.option.label;
},_changeBox:function(){
if(this.get("disabled")||this.get("readOnly")){
return;
}
if(this.parent.multiple){
this.option.selected=this.checkBox.get("value")&&true;
}else{
this.parent.set("value",this.option.value);
}
this.parent._updateSelection();
this.parent.focus();
},_onClick:function(e){
if(this.get("disabled")||this.get("readOnly")){
_1.stopEvent(e);
}else{
this.checkBox._onClick(e);
}
},_updateBox:function(){
this.checkBox.set("value",this.option.selected);
},_setDisabledAttr:function(_3){
this.disabled=_3||this.option.disabled;
this.checkBox.set("disabled",this.disabled);
_1.toggleClass(this.domNode,"dojoxMultiSelectDisabled",this.disabled);
},_setReadOnlyAttr:function(_4){
this.checkBox.set("readOnly",_4);
this.readOnly=_4;
}});
_1.declare("dojox.form._CheckedMultiSelectMenu",_2.Menu,{multiple:false,buildRendering:function(){
this.inherited(arguments);
var o=(this.menuTableNode=this.domNode),n=(this.domNode=_1.create("div",{style:{overflowX:"hidden",overflowY:"scroll"}}));
if(o.parentNode){
o.parentNode.replaceChild(n,o);
}
_1.removeClass(o,"dijitMenuTable");
n.className=o.className+" dojoxCheckedMultiSelectMenu";
o.className="dijitReset dijitMenuTable";
o.setAttribute("role","listbox");
n.setAttribute("role","presentation");
n.appendChild(o);
},resize:function(mb){
if(mb){
_1.marginBox(this.domNode,mb);
if("w" in mb){
this.menuTableNode.style.width="100%";
}
}
},onClose:function(){
this.inherited(arguments);
if(this.menuTableNode){
this.menuTableNode.style.width="";
}
},onItemClick:function(_5,_6){
if(typeof this.isShowingNow=="undefined"){
this._markActive();
}
this.focusChild(_5);
if(_5.disabled||_5.readOnly){
return false;
}
if(!this.multiple){
this.onExecute();
}
_5.onClick(_6);
}});
_1.declare("dojox.form._CheckedMultiSelectMenuItem",_2.MenuItem,{templateString:_1.cache("dojox.form","resources/_CheckedMultiSelectMenuItem.html"),option:null,parent:null,_iconClass:"",postMixInProperties:function(){
if(this.parent.multiple){
this._iconClass="dojoxCheckedMultiSelectMenuCheckBoxItemIcon";
this._type={type:"checkbox"};
}else{
this._iconClass="";
this._type={type:"hidden"};
}
this.disabled=this.option.disabled;
this.checked=this.option.selected;
this.label=this.option.label;
this.readOnly=this.option.readOnly;
this.inherited(arguments);
},onChange:function(_7){
},_updateBox:function(){
_1.toggleClass(this.domNode,"dojoxCheckedMultiSelectMenuItemChecked",!!this.option.selected);
this.domNode.setAttribute("aria-checked",this.option.selected);
this.inputNode.checked=this.option.selected;
if(!this.parent.multiple){
_1.toggleClass(this.domNode,"dijitSelectSelectedOption",!!this.option.selected);
}
},_onClick:function(e){
if(!this.disabled&&!this.readOnly){
if(this.parent.multiple){
this.option.selected=!this.option.selected;
this.parent.onChange();
this.onChange(this.option.selected);
}else{
if(!this.option.selected){
_1.forEach(this.parent.getChildren(),function(_8){
_8.option.selected=false;
});
this.option.selected=true;
this.parent.onChange();
this.onChange(this.option.selected);
}
}
}
this.inherited(arguments);
}});
_1.declare("dojox.form.CheckedMultiSelect",_2.form._FormSelectWidget,{templateString:_1.cache("dojox.form","resources/CheckedMultiSelect.html"),baseClass:"dojoxCheckedMultiSelect",required:false,invalidMessage:"$_unset_$",_message:"",dropDown:false,labelText:"",tooltipPosition:[],setStore:function(_9,_a,_b){
this.inherited(arguments);
var _c=function(_d){
var _e=_1.map(_d,function(_f){
return _f.value[0];
});
if(_e.length){
this.set("value",_e);
}
};
this.store.fetch({query:{selected:true},onComplete:_c,scope:this});
},postMixInProperties:function(){
this.inherited(arguments);
this._nlsResources=_1.i18n.getLocalization("dojox.form","CheckedMultiSelect",this.lang);
if(this.invalidMessage=="$_unset_$"){
this.invalidMessage=this._nlsResources.invalidMessage;
}
},_fillContent:function(){
this.inherited(arguments);
if(this.options.length&&!this.value&&this.srcNodeRef){
var si=this.srcNodeRef.selectedIndex||0;
this.value=this.options[si>=0?si:0].value;
}
if(this.dropDown){
_1.toggleClass(this.selectNode,"dojoxCheckedMultiSelectHidden");
this.dropDownMenu=new dojox.form._CheckedMultiSelectMenu({id:this.id+"_menu",style:"display: none;",multiple:this.multiple,onChange:_1.hitch(this,"_updateSelection")});
}
},startup:function(){
this.inherited(arguments);
if(this.dropDown){
this.dropDownButton=new _2.form.ComboButton({label:this.labelText,dropDown:this.dropDownMenu,baseClass:"dojoxCheckedMultiSelectButton",maxHeight:this.maxHeight},this.comboButtonNode);
}
},_onMouseDown:function(e){
_1.stopEvent(e);
},validator:function(){
if(!this.required){
return true;
}
return _1.some(this.getOptions(),function(opt){
return opt.selected&&opt.value!=null&&opt.value.toString().length!=0;
});
},validate:function(_10){
_2.hideTooltip(this.domNode);
var _11=this.isValid(_10);
if(!_11){
this.displayMessage(this.invalidMessage);
}
return _11;
},isValid:function(_12){
return this.validator();
},getErrorMessage:function(_13){
return this.invalidMessage;
},displayMessage:function(_14){
_2.hideTooltip(this.domNode);
if(_14){
_2.showTooltip(_14,this.domNode,this.tooltipPosition);
}
},onAfterAddOptionItem:function(_15,_16){
},_addOptionItem:function(_17){
var _18;
if(this.dropDown){
_18=new dojox.form._CheckedMultiSelectMenuItem({option:_17,parent:this.dropDownMenu});
this.dropDownMenu.addChild(_18);
}else{
_18=new dojox.form._CheckedMultiSelectItem({option:_17,parent:this});
this.wrapperDiv.appendChild(_18.domNode);
}
this.onAfterAddOptionItem(_18,_17);
},_refreshState:function(){
this.validate(this.focused);
},onChange:function(_19){
this._refreshState();
},reset:function(){
this.inherited(arguments);
_2.hideTooltip(this.domNode);
},_updateSelection:function(){
this.inherited(arguments);
this._handleOnChange(this.value);
_1.forEach(this._getChildren(),function(_1a){
_1a._updateBox();
});
if(this.dropDown&&this.dropDownButton){
var i=0,_1b="";
_1.forEach(this.options,function(_1c){
if(_1c.selected){
i++;
_1b=_1c.label;
}
});
this.dropDownButton.set("label",this.multiple?_1.replace(this._nlsResources.multiSelectLabelText,{num:i}):_1b);
}
},_getChildren:function(){
if(this.dropDown){
return this.dropDownMenu.getChildren();
}else{
return _1.map(this.wrapperDiv.childNodes,function(n){
return _2.byNode(n);
});
}
},invertSelection:function(_1d){
if(this.multiple){
_1.forEach(this.options,function(i){
i.selected=!i.selected;
});
this._updateSelection();
}
},_setDisabledAttr:function(_1e){
this.inherited(arguments);
if(this.dropDown){
this.dropDownButton.set("disabled",_1e);
}
_1.forEach(this._getChildren(),function(_1f){
if(_1f&&_1f.set){
_1f.set("disabled",_1e);
}
});
},_setReadOnlyAttr:function(_20){
this.inherited(arguments);
if("readOnly" in this.attributeMap){
this._attrToDom("readOnly",_20);
}
this.readOnly=_20;
_1.forEach(this._getChildren(),function(_21){
if(_21&&_21.set){
_21.set("readOnly",_20);
}
});
},uninitialize:function(){
_2.hideTooltip(this.domNode);
_1.forEach(this._getChildren(),function(_22){
_22.destroyRecursive();
});
this.inherited(arguments);
}});
return dojox.form.CheckedMultiSelect;
});
