/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/DropDownBox.html"]="<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdojoAttachPoint=\"_buttonNode, _popupStateNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" role=\"textbox\" aria-haspopup=\"true\"\n\t/></div\n></div>\n";
define("dijit/form/ComboBoxMixin",["dojo/_base/kernel","..","dojo/text!./templates/DropDownBox.html","./_AutoCompleterMixin","./_ComboBoxMenu","../_HasDropDown","dojo/store/util/QueryResults","dojo/_base/declare"],function(_1,_2,_3){
_1.declare("dijit.form.ComboBoxMixin",[_2._HasDropDown,_2.form._AutoCompleterMixin],{dropDownClass:"dijit.form._ComboBoxMenu",hasDownArrow:true,templateString:_3,baseClass:"dijitTextBox dijitComboBox",cssStateNodes:{"_buttonNode":"dijitDownArrowButton"},_setHasDownArrowAttr:function(_4){
this._set("hasDownArrow",_4);
this._buttonNode.style.display=_4?"":"none";
},_showResultList:function(){
this.displayMessage("");
this.inherited(arguments);
},postMixInProperties:function(){
if(this.store&&!this.store.get){
_1.mixin(this.store,{_oldAPI:true,get:function(id,_5){
var _6=new _1.Deferred();
this.fetchItemByIdentity({identity:id,onItem:function(_7){
_6.resolve(_7);
},onError:function(_8){
_6.reject(_8);
}});
return _6.promise;
},query:function(_9,_a){
var _b=new _1.Deferred(function(){
_c.abort&&_c.abort();
});
var _c=this.fetch(_1.mixin({query:_9,onBegin:function(_d){
_b.total=_d;
},onComplete:function(_e){
_b.resolve(_e);
},onError:function(_f){
_b.reject(_f);
}},_a));
return _1.store.util.QueryResults(_b);
}});
}
this.inherited(arguments);
if(!this.params.store){
var _10=this.declaredClass;
_1.mixin(this.store,{getValue:function(_11,_12){
_1.deprecated(_10+".store.getValue(item, attr) is deprecated for builtin store.  Use item.attr directly","","2.0");
return _11[_12];
},getLabel:function(_13){
_1.deprecated(_10+".store.getLabel(item) is deprecated for builtin store.  Use item.label directly","","2.0");
return _13[labelAttr];
},fetch:function(_14){
_1.deprecated(_10+".store.fetch() is deprecated for builtin store.","Use store.query()","2.0");
var _15=["dojo/data/ObjectStore"];
require(_15,_1.hitch(this,function(_16){
new _16({objectStore:this}).fetch(_14);
}));
}});
}
}});
return _2.form.ComboBoxMixin;
});
