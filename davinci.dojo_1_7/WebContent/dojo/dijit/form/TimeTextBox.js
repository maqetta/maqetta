/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/TimeTextBox",["dojo/_base/kernel","..","../_TimePicker","./_DateTimeTextBox","dojo/_base/connect","dojo/_base/declare","dojo/_base/lang"],function(_1,_2){
_1.declare("dijit.form.TimeTextBox",_2.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitComboBox dijitTimeTextBox",popupClass:"dijit._TimePicker",_selector:"time",value:new Date(""),_onKey:function(_3){
this.inherited(arguments);
switch(_3.keyCode){
case _1.keys.ENTER:
case _1.keys.TAB:
case _1.keys.ESCAPE:
case _1.keys.DOWN_ARROW:
case _1.keys.UP_ARROW:
break;
default:
setTimeout(_1.hitch(this,function(){
var _4=this.get("displayedValue");
this.filterString=(_4&&!this.parse(_4,this.constraints))?_4.toLowerCase():"";
if(this._opened){
this.closeDropDown();
}
this.openDropDown();
}),0);
}
}});
return _2.form.TimeTextBox;
});
