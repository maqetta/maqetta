/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/filter/_FilterExpr",["dojo","dojox","dojo/date","./_DataExprs"],function(_1,_2){
var _3=_1.getObject("grid.enhanced.plugins.filter",true,_2);
_1.declare("dojox.grid.enhanced.plugins.filter.LogicAND",_3._BiOpExpr,{_name:"and",_calculate:function(_4,_5,_6,_7){
var _8=_4.applyRow(_6,_7).getValue()&&_5.applyRow(_6,_7).getValue();
return new _3.BooleanExpr(_8);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LogicOR",_3._BiOpExpr,{_name:"or",_calculate:function(_9,_a,_b,_c){
var _d=_9.applyRow(_b,_c).getValue()||_a.applyRow(_b,_c).getValue();
return new _3.BooleanExpr(_d);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LogicXOR",_3._BiOpExpr,{_name:"xor",_calculate:function(_e,_f,_10,_11){
var _12=_e.applyRow(_10,_11).getValue();
var _13=_f.applyRow(_10,_11).getValue();
return new _3.BooleanExpr((!!_12)!=(!!_13));
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LogicNOT",_3._UniOpExpr,{_name:"not",_calculate:function(_14,_15,_16){
return new _3.BooleanExpr(!_14.applyRow(_15,_16).getValue());
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LogicALL",_3._OperatorExpr,{_name:"all",applyRow:function(_17,_18){
for(var i=0,res=true;res&&(this._operands[i] instanceof _3._ConditionExpr);++i){
res=this._operands[i].applyRow(_17,_18).getValue();
}
return new _3.BooleanExpr(res);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LogicANY",_3._OperatorExpr,{_name:"any",applyRow:function(_19,_1a){
for(var i=0,res=false;!res&&(this._operands[i] instanceof _3._ConditionExpr);++i){
res=this._operands[i].applyRow(_19,_1a).getValue();
}
return new _3.BooleanExpr(res);
}});
function _1b(_1c,_1d,row,_1e){
_1c=_1c.applyRow(row,_1e);
_1d=_1d.applyRow(row,_1e);
var _1f=_1c.getValue();
var _20=_1d.getValue();
if(_1c instanceof _3.TimeExpr){
return _1.date.compare(_1f,_20,"time");
}else{
if(_1c instanceof _3.DateExpr){
return _1.date.compare(_1f,_20,"date");
}else{
if(_1c instanceof _3.StringExpr){
_1f=_1f.toLowerCase();
_20=String(_20).toLowerCase();
}
return _1f==_20?0:(_1f<_20?-1:1);
}
}
};
_1.declare("dojox.grid.enhanced.plugins.filter.EqualTo",_3._BiOpExpr,{_name:"equal",_calculate:function(_21,_22,_23,_24){
var res=_1b(_21,_22,_23,_24);
return new _3.BooleanExpr(res===0);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LessThan",_3._BiOpExpr,{_name:"less",_calculate:function(_25,_26,_27,_28){
var res=_1b(_25,_26,_27,_28);
return new _3.BooleanExpr(res<0);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LessThanOrEqualTo",_3._BiOpExpr,{_name:"lessEqual",_calculate:function(_29,_2a,_2b,_2c){
var res=_1b(_29,_2a,_2b,_2c);
return new _3.BooleanExpr(res<=0);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LargerThan",_3._BiOpExpr,{_name:"larger",_calculate:function(_2d,_2e,_2f,_30){
var res=_1b(_2d,_2e,_2f,_30);
return new _3.BooleanExpr(res>0);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.LargerThanOrEqualTo",_3._BiOpExpr,{_name:"largerEqual",_calculate:function(_31,_32,_33,_34){
var res=_1b(_31,_32,_33,_34);
return new _3.BooleanExpr(res>=0);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.Contains",_3._BiOpExpr,{_name:"contains",_calculate:function(_35,_36,_37,_38){
var _39=String(_35.applyRow(_37,_38).getValue()).toLowerCase();
var _3a=String(_36.applyRow(_37,_38).getValue()).toLowerCase();
return new _3.BooleanExpr(_39.indexOf(_3a)>=0);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.StartsWith",_3._BiOpExpr,{_name:"startsWith",_calculate:function(_3b,_3c,_3d,_3e){
var _3f=String(_3b.applyRow(_3d,_3e).getValue()).toLowerCase();
var _40=String(_3c.applyRow(_3d,_3e).getValue()).toLowerCase();
return new _3.BooleanExpr(_3f.substring(0,_40.length)==_40);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.EndsWith",_3._BiOpExpr,{_name:"endsWith",_calculate:function(_41,_42,_43,_44){
var _45=String(_41.applyRow(_43,_44).getValue()).toLowerCase();
var _46=String(_42.applyRow(_43,_44).getValue()).toLowerCase();
return new _3.BooleanExpr(_45.substring(_45.length-_46.length)==_46);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.Matches",_3._BiOpExpr,{_name:"matches",_calculate:function(_47,_48,_49,_4a){
var _4b=String(_47.applyRow(_49,_4a).getValue());
var _4c=new RegExp(_48.applyRow(_49,_4a).getValue());
return new _3.BooleanExpr(_4b.search(_4c)>=0);
}});
_1.declare("dojox.grid.enhanced.plugins.filter.IsEmpty",_3._UniOpExpr,{_name:"isEmpty",_calculate:function(_4d,_4e,_4f){
var res=_4d.applyRow(_4e,_4f).getValue();
return new _3.BooleanExpr(res===""||res==null);
}});
return _2.grid.enhanced.plugins.filter._FilterExpr;
});
