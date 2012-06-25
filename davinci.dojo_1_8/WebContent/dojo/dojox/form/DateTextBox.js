//>>built
define("dojox/form/DateTextBox",["dojo/_base/kernel","dojo/_base/lang","dojo/dom-style","dojox/widget/Calendar","dojox/widget/CalendarViews","dijit/form/_DateTimeTextBox","dijit/form/TextBox","dojo/_base/declare"],function(_1,_2,_3,_4,_5,_6,_7,_8){
_1.experimental("dojox/form/DateTextBox");
return _8("dojox.form.DateTextBox",[_4,_6,_7],{popupClass:"dojox/widget/Calendar",_selector:"date",openDropDown:function(){
this.inherited(arguments);
_3.set(this.dropDown.domNode.parentNode,"position","absolute");
}});
});
