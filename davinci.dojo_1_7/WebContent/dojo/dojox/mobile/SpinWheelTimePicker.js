/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/SpinWheelTimePicker",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojo/date","dojo/date/locale","./SpinWheel","./SpinWheelSlot"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.mobile.SpinWheelTimePicker",dojox.mobile.SpinWheel,{slotClasses:[_7,_7],slotProps:[{labelFrom:0,labelTo:23},{labels:["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59"]}],buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"mblSpinWheelTimePicker");
},reset:function(){
var _8=this.slots;
var _9=new Date();
_8[0].setValue(_9.getHours());
_8[0].setColor(_9.getHours());
_8[1].setValue(_9.getMinutes());
_8[1].setColor(_9.getMinutes());
}});
});
