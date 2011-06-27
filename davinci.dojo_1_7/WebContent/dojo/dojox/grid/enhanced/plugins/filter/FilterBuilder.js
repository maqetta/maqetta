/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/filter/FilterBuilder",["dojo","dojox","./_FilterExpr"],function(_1,_2){
var _3=_2.grid.enhanced.plugins.filter,_4=function(_5){
return _1.partial(function(_6,_7){
return new _3[_6](_7);
},_5);
},_8=function(_9){
return _1.partial(function(_a,_b){
return new _3.LogicNOT(new _3[_a](_b));
},_9);
};
_1.declare("dojox.grid.enhanced.plugins.filter.FilterBuilder",null,{buildExpression:function(_c){
if("op" in _c){
return this.supportedOps[_c.op.toLowerCase()](_1.map(_c.data,this.buildExpression,this));
}else{
var _d=_1.mixin(this.defaultArgs[_c.datatype],_c.args||{});
return new this.supportedTypes[_c.datatype](_c.data,_c.isColumn,_d);
}
},supportedOps:{"equalto":_4("EqualTo"),"lessthan":_4("LessThan"),"lessthanorequalto":_4("LessThanOrEqualTo"),"largerthan":_4("LargerThan"),"largerthanorequalto":_4("LargerThanOrEqualTo"),"contains":_4("Contains"),"startswith":_4("StartsWith"),"endswith":_4("EndsWith"),"notequalto":_8("EqualTo"),"notcontains":_8("Contains"),"notstartswith":_8("StartsWith"),"notendswith":_8("EndsWith"),"isempty":_4("IsEmpty"),"range":function(_e){
return new _3.LogicALL(new _3.LargerThanOrEqualTo(_e.slice(0,2)),new _3.LessThanOrEqualTo(_e[0],_e[2]));
},"logicany":_4("LogicANY"),"logicall":_4("LogicALL")},supportedTypes:{"number":_3.NumberExpr,"string":_3.StringExpr,"boolean":_3.BooleanExpr,"date":_3.DateExpr,"time":_3.TimeExpr},defaultArgs:{"boolean":{"falseValue":"false","convert":function(_f,_10){
var _11=_10.falseValue;
var _12=_10.trueValue;
if(_1.isString(_f)){
if(_12&&_f.toLowerCase()==_12){
return true;
}
if(_11&&_f.toLowerCase()==_11){
return false;
}
}
return !!_f;
}}}});
return _2.grid.enhanced.plugins.filter.FilterBuilder;
});
