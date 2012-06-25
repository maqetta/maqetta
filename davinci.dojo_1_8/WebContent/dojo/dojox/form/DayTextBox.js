//>>built
define("dojox/form/DayTextBox",["dojo/_base/kernel","dojo/_base/lang","dojox/widget/DailyCalendar","dijit/form/TextBox","dijit/form/_DateTimeTextBox","dojox/form/DateTextBox","dojo/_base/declare",],function(_1,_2,_3,_4,_5,_6,_7){
_1.experimental("dojox/form/DateTextBox");
return _7("dojox.form.DayTextBox",[_3,_4,_5,_6],{popupClass:"dojox/widget/DailyCalendar",parse:function(_8){
return _8;
},format:function(_9){
return _9.getDate?_9.getDate():_9;
},validator:function(_a){
var _b=Number(_a);
var _c=/(^-?\d\d*$)/.test(String(_a));
return _a==""||_a==null||(_c&&_b>=1&&_b<=31);
},_setValueAttr:function(_d,_e,_f){
if(_d){
if(_d.getDate){
_d=_d.getDate();
}
}
_4.prototype._setValueAttr.call(this,_d,_e,_f);
},openDropDown:function(){
this.inherited(arguments);
this.dropDown.onValueSelected=_2.hitch(this,function(_10){
this.focus();
setTimeout(_2.hitch(this,"closeDropDown"),1);
_4.prototype._setValueAttr.call(this,String(_10.getDate()),true,String(_10.getDate()));
});
}});
});
