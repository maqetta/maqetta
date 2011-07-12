/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/DateTextBox",["dojo","dijit","dojox","dojox/widget/Calendar","dojox/widget/CalendarViews","dijit/form/_DateTimeTextBox"],function(_1,_2,_3){
_1.getObject("dojox.form.DateTextBox",1);
_1.experimental("dojox.form.DateTextBox");
_1.declare("dojox.form.DateTextBox",_2.form._DateTimeTextBox,{popupClass:"dojox.widget.Calendar",_selector:"date",openDropDown:function(){
this.inherited(arguments);
_1.style(this.dropDown.domNode.parentNode,"position","absolute");
}});
_1.declare("dojox.form.DayTextBox",_3.form.DateTextBox,{popupClass:"dojox.widget.DailyCalendar",parse:function(_4){
return _4;
},format:function(_5){
return _5.getDate?_5.getDate():_5;
},validator:function(_6){
var _7=Number(_6);
var _8=/(^-?\d\d*$)/.test(String(_6));
return _6==""||_6==null||(_8&&_7>=1&&_7<=31);
},_setValueAttr:function(_9,_a,_b){
if(_9){
if(_9.getDate){
_9=_9.getDate();
}
}
_2.form.TextBox.prototype._setValueAttr.call(this,_9,_a,_b);
},openDropDown:function(){
this.inherited(arguments);
this.dropDown.onValueSelected=_1.hitch(this,function(_c){
this.focus();
setTimeout(_1.hitch(this,"closeDropDown"),1);
_2.form.TextBox.prototype._setValueAttr.call(this,String(_c.getDate()),true,String(_c.getDate()));
});
}});
_1.declare("dojox.form.MonthTextBox",_3.form.DateTextBox,{popupClass:"dojox.widget.MonthlyCalendar",selector:"date",postMixInProperties:function(){
this.inherited(arguments);
this.constraints.datePattern="MM";
},format:function(_d){
if(!_d&&_d!==0){
return 1;
}
if(_d.getMonth){
return _d.getMonth()+1;
}
return Number(_d)+1;
},parse:function(_e,_f){
return Number(_e)-1;
},serialize:function(_10,_11){
return String(_10);
},validator:function(_12){
var num=Number(_12);
var _13=/(^-?\d\d*$)/.test(String(_12));
return _12==""||_12==null||(_13&&num>=1&&num<=12);
},_setValueAttr:function(_14,_15,_16){
if(_14){
if(_14.getMonth){
_14=_14.getMonth();
}
}
_2.form.TextBox.prototype._setValueAttr.call(this,_14,_15,_16);
},openDropDown:function(){
this.inherited(arguments);
this.dropDown.onValueSelected=_1.hitch(this,function(_17){
this.focus();
setTimeout(_1.hitch(this,"closeDropDown"),1);
_2.form.TextBox.prototype._setValueAttr.call(this,_17,true,_17);
});
}});
_1.declare("dojox.form.YearTextBox",_3.form.DateTextBox,{popupClass:"dojox.widget.YearlyCalendar",format:function(_18){
if(typeof _18=="string"){
return _18;
}else{
if(_18.getFullYear){
return _18.getFullYear();
}
}
return _18;
},validator:function(_19){
return _19==""||_19==null||/(^-?\d\d*$)/.test(String(_19));
},_setValueAttr:function(_1a,_1b,_1c){
if(_1a){
if(_1a.getFullYear){
_1a=_1a.getFullYear();
}
}
_2.form.TextBox.prototype._setValueAttr.call(this,_1a,_1b,_1c);
},openDropDown:function(){
this.inherited(arguments);
this.dropDown.onValueSelected=_1.hitch(this,function(_1d){
this.focus();
setTimeout(_1.hitch(this,"closeDropDown"),1);
_2.form.TextBox.prototype._setValueAttr.call(this,_1d,true,_1d);
});
},parse:function(_1e,_1f){
return _1e||(this._isEmpty(_1e)?null:undefined);
},filter:function(val){
if(val&&val.getFullYear){
return val.getFullYear().toString();
}
return this.inherited(arguments);
}});
return _1.getObject("dojox.form.DateTextBox");
});
require(["dojox/form/DateTextBox"]);
