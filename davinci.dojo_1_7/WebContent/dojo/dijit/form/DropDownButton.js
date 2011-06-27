/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/DropDownButton.html"]="<span class=\"dijit dijitReset dijitInline\"\n\t><span class='dijitReset dijitInline dijitButtonNode'\n\t\tdojoAttachEvent=\"ondijitclick:_onClick\" dojoAttachPoint=\"_buttonNode\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"focusNode,titleNode,_arrowWrapperNode\"\n\t\t\trole=\"button\" aria-haspopup=\"true\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\"\n\t\t\t\tdojoAttachPoint=\"iconNode\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tdojoAttachPoint=\"containerNode,_popupStateNode\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\"></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdojoAttachPoint=\"valueNode\"\n/></span>\n";
define("dijit/form/DropDownButton",["dojo/_base/kernel","..","dojo/text!./templates/DropDownButton.html","../popup","./Button","../_Container","../_HasDropDown","dojo/_base/connect","dojo/query"],function(_1,_2,_3,_4){
_1.declare("dijit.form.DropDownButton",[_2.form.Button,_2._Container,_2._HasDropDown],{baseClass:"dijitDropDownButton",templateString:_3,_fillContent:function(){
if(this.srcNodeRef){
var _5=_1.query("*",this.srcNodeRef);
_2.form.DropDownButton.superclass._fillContent.call(this,_5[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
if(!this.dropDown&&this.dropDownContainer){
var _6=_1.query("[widgetId]",this.dropDownContainer)[0];
this.dropDown=_2.byNode(_6);
delete this.dropDownContainer;
}
if(this.dropDown){
_4.hide(this.dropDown);
}
this.inherited(arguments);
},isLoaded:function(){
var _7=this.dropDown;
return (!!_7&&(!_7.href||_7.isLoaded));
},loadDropDown:function(){
var _8=this.dropDown;
if(!_8){
return;
}
if(!this.isLoaded()){
var _9=_1.connect(_8,"onLoad",this,function(){
_1.disconnect(_9);
this.openDropDown();
});
_8.refresh();
}else{
this.openDropDown();
}
},isFocusable:function(){
return this.inherited(arguments)&&!this._mouseDown;
}});
return _2.form.DropDownButton;
});
