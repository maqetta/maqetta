/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/SpinWheelDatePicker",["dojo/date","dojo/date/locale","./SpinWheel","./SpinWheelSlot"],function(_1,_2,_3,_4){
var _5=dojo.declare(dojox.mobile.SpinWheelSlot,{buildRendering:function(){
this.labels=[];
if(this.labelFrom!==this.labelTo){
var _6=new Date(this.labelFrom,0,1);
var i,_7;
for(i=this.labelFrom,_7=0;i<=this.labelTo;i++,_7++){
_6.setFullYear(i);
this.labels.push(dojo.date.locale.format(_6,{datePattern:"yyyy",selector:"date"}));
}
}
this.inherited(arguments);
}});
var _8=dojo.declare(dojox.mobile.SpinWheelSlot,{buildRendering:function(){
this.labels=[];
var _9=new Date(2000,0,1);
var _a;
for(var i=0;i<12;i++){
_9.setMonth(i);
_a=dojo.date.locale.format(_9,{datePattern:"MMM",selector:"date"});
this.labels.push(_a);
}
this.inherited(arguments);
}});
var _b=dojo.declare(dojox.mobile.SpinWheelSlot,{});
return dojo.declare("dojox.mobile.SpinWheelDatePicker",dojox.mobile.SpinWheel,{slotClasses:[_5,_8,_b],slotProps:[{labelFrom:1970,labelTo:2038},{},{labelFrom:1,labelTo:31}],buildRendering:function(){
this.inherited(arguments);
dojo.addClass(this.domNode,"mblSpinWheelDatePicker");
this.connect(this.slots[1],"onFlickAnimationEnd","onMonthSet");
this.connect(this.slots[2],"onFlickAnimationEnd","onDaySet");
},reset:function(){
var _c=this.slots;
var _d=new Date();
var _e=dojo.date.locale.format(_d,{datePattern:"MMM",selector:"date"});
this.setValue([_d.getFullYear(),_e,_d.getDate()]);
},onMonthSet:function(){
var _f=this.onDaySet();
var _10={28:[29,30,31],29:[30,31],30:[31],31:[]};
this.slots[2].disableValues(_10[_f]);
},onDaySet:function(){
var y=this.slots[0].getValue();
var m=this.slots[1].getValue();
var _11=dojo.date.locale.parse(y+"/"+m,{datePattern:"yyyy/MMM",selector:"date"});
var _12=dojo.date.getDaysInMonth(_11);
var d=this.slots[2].getValue();
if(_12<d){
this.slots[2].setValue(_12);
}
return _12;
}});
});
