/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/TimeSpinner",["dojo","dijit","dojox","dijit/form/_Spinner","dojo/date","dojo/date/locale","dojo/date/stamp"],function(_1,_2,_3){
_1.getObject("dojox.form.TimeSpinner",1);
_1.declare("dojox.form.TimeSpinner",[_2.form._Spinner],{required:false,adjust:function(_4,_5){
return _1.date.add(_4,"minute",_5);
},isValid:function(){
return true;
},smallDelta:5,largeDelta:30,timeoutChangeRate:0.5,parse:function(_6,_7){
return _1.date.locale.parse(_6,{selector:"time",formatLength:"short"});
},format:function(_8,_9){
if(_1.isString(_8)){
return _8;
}
return _1.date.locale.format(_8,{selector:"time",formatLength:"short"});
},serialize:_1.date.stamp.toISOString,value:"12:00 AM",_onKeyPress:function(e){
if((e.charOrCode==_1.keys.HOME||e.charOrCode==_1.keys.END)&&!(e.ctrlKey||e.altKey||e.metaKey)&&typeof this.get("value")!="undefined"){
var _a=this.constraints[(e.charOrCode==_1.keys.HOME?"min":"max")];
if(_a){
this._setValueAttr(_a,true);
}
_1.stopEvent(e);
}
}});
return _1.getObject("dojox.form.TimeSpinner");
});
require(["dojox/form/TimeSpinner"]);
