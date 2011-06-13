/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

require.cache["dijit/form/templates/DropDownBox.html"]="<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdojoAttachPoint=\"_buttonNode, _popupStateNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" role=\"textbox\" aria-haspopup=\"true\"\n\t/></div\n></div>\n";
define("dijit/form/ComboBoxMixin",["dojo/_base/kernel","..","dojo/text!./templates/DropDownBox.html","./_AutoCompleterMixin","./_ComboBoxMenu","../_HasDropDown","dojo/store/DataStore","dojo/_base/declare"],function(_1,_2,_3){
_1.declare("dijit.form.ComboBoxMixin",[_2._HasDropDown,_2.form._AutoCompleterMixin],{dropDownClass:"dijit.form._ComboBoxMenu",hasDownArrow:true,templateString:_3,baseClass:"dijitTextBox dijitComboBox",cssStateNodes:{"_buttonNode":"dijitDownArrowButton"},_setHasDownArrowAttr:function(_4){
this._set("hasDownArrow",_4);
this._buttonNode.style.display=_4?"":"none";
},_showResultList:function(){
this.displayMessage("");
this.inherited(arguments);
},postMixInProperties:function(){
var _5=(this.store&&this.store._labelAttr)||"label";
if(this.store&&!this.store.get){
this.store=new _1.store.DataStore({store:this.store});
}
this.inherited(arguments);
_1.mixin(this.store,{getValue:function(_6,_7){
return _6[_7];
},getLabel:function(_8){
return _8[_5];
}});
}});
return _2.form.ComboBoxMixin;
});
