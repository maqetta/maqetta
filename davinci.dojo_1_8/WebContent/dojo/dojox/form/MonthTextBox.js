//>>built
define("dojox/form/MonthTextBox",["dojo/_base/kernel","dojo/_base/lang","dojox/widget/MonthlyCalendar","dijit/form/TextBox","dijit/form/_DateTimeTextBox","dojox/form/DateTextBox","dojo/_base/declare"],function(_1,_2,_3,_4,_5,_6,_7){
_1.experimental("dojox/form/DateTextBox");
return _7("dojox.form.MonthTextBox",[_3,_4,_5,_6],{popupClass:"dojox/widget/MonthlyCalendar",selector:"date",postMixInProperties:function(){
this.inherited(arguments);
this.constraints.datePattern="MM";
},format:function(_8){
if(!_8&&_8!==0){
return 1;
}
if(_8.getMonth){
return _8.getMonth()+1;
}
return Number(_8)+1;
},parse:function(_9,_a){
return Number(_9)-1;
},serialize:function(_b,_c){
return String(_b);
},validator:function(_d){
var _e=Number(_d);
var _f=/(^-?\d\d*$)/.test(String(_d));
return _d==""||_d==null||(_f&&_e>=1&&_e<=12);
},_setValueAttr:function(_10,_11,_12){
if(_10){
if(_10.getMonth){
_10=_10.getMonth();
}
}
_4.prototype._setValueAttr.call(this,_10,_11,_12);
},openDropDown:function(){
this.inherited(arguments);
this.dropDown.onValueSelected=_2.hitch(this,function(_13){
this.focus();
setTimeout(_2.hitch(this,"closeDropDown"),1);
_4.prototype._setValueAttr.call(this,_13,true,_13);
});
}});
});
