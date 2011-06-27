/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/filter/_DataExprs",["dojo","dojox","dojo/date/locale","./_ConditionExpr"],function(_1,_2){
var _3=_1.getObject("grid.enhanced.plugins.filter",true,_2);
_1.declare("dojox.grid.enhanced.plugins.filter.BooleanExpr",_3._DataExpr,{_name:"bool",_convertData:function(_4){
return !!_4;
}});
_1.declare("dojox.grid.enhanced.plugins.filter.StringExpr",_3._DataExpr,{_name:"string",_convertData:function(_5){
return String(_5);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.NumberExpr",_3._DataExpr,{_name:"number",_convertDataToExpr:function(_6){
return parseFloat(_6);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.DateExpr",_3._DataExpr,{_name:"date",_convertData:function(_7){
if(_7 instanceof Date){
return _7;
}else{
if(typeof _7=="number"){
return new Date(_7);
}else{
var _8=_1.date.locale.parse(String(_7),_1.mixin({selector:this._name},this._convertArgs));
if(!_8){
throw new Error("Datetime parse failed: "+_7);
}
return _8;
}
}
},toObject:function(){
if(this._value instanceof Date){
var _9=this._value;
this._value=this._value.valueOf();
var _a=this.inherited(arguments);
this._value=_9;
return _a;
}else{
return this.inherited(arguments);
}
}});
_1.declare("dojox.grid.enhanced.plugins.filter.TimeExpr",_3.DateExpr,{_name:"time"});
return _2.grid.enhanced.plugins.filter._DataExprs;
});
