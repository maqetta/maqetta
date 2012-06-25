//>>built
define("dojox/form/YearTextBox",["dojo/_base/kernel","dojo/_base/lang","dojox/widget/YearlyCalendar","dijit/form/TextBox","dijit/form/_DateTimeTextBox","dojox/form/DateTextBox","dojo/_base/declare"],function(_1,_2,_3,_4,_5,_6,_7){
_1.experimental("dojox/form/DateTextBox");
return _7("dojox.form.YearTextBox",[_3,_4,_5,_6],{popupClass:"dojox/widget/YearlyCalendar",format:function(_8){
if(typeof _8=="string"){
return _8;
}else{
if(_8.getFullYear){
return _8.getFullYear();
}
}
return _8;
},validator:function(_9){
return _9==""||_9==null||/(^-?\d\d*$)/.test(String(_9));
},_setValueAttr:function(_a,_b,_c){
if(_a){
if(_a.getFullYear){
_a=_a.getFullYear();
}
}
_4.prototype._setValueAttr.call(this,_a,_b,_c);
},openDropDown:function(){
this.inherited(arguments);
this.dropDown.onValueSelected=_2.hitch(this,function(_d){
this.focus();
setTimeout(_2.hitch(this,"closeDropDown"),1);
_4.prototype._setValueAttr.call(this,_d,true,_d);
});
},parse:function(_e,_f){
return _e||(this._isEmpty(_e)?null:undefined);
},filter:function(val){
if(val&&val.getFullYear){
return val.getFullYear().toString();
}
return this.inherited(arguments);
}});
});
