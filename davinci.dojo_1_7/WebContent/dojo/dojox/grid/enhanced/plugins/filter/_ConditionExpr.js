/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/filter/_ConditionExpr",["dojo","dojox"],function(_1,_2){
var _3=_1.getObject("grid.enhanced.plugins.filter",true,_2);
_1.declare("dojox.grid.enhanced.plugins.filter._ConditionExpr",null,{_name:"expr",applyRow:function(_4,_5){
throw new Error("_ConditionExpr.applyRow: unimplemented interface");
},toObject:function(){
return {};
},getName:function(){
return this._name;
}});
_1.declare("dojox.grid.enhanced.plugins.filter._DataExpr",_3._ConditionExpr,{_name:"data",constructor:function(_6,_7,_8){
this._convertArgs=_8||{};
if(_1.isFunction(this._convertArgs.convert)){
this._convertData=_1.hitch(this._convertArgs.scope,this._convertArgs.convert);
}
if(_7){
this._colArg=_6;
}else{
this._value=this._convertData(_6,this._convertArgs);
}
},getValue:function(){
return this._value;
},applyRow:function(_9,_a){
return typeof this._colArg=="undefined"?this:new (_1.getObject(this.declaredClass))(this._convertData(_a(_9,this._colArg),this._convertArgs));
},_convertData:function(_b){
return _b;
},toObject:function(){
return {op:this.getName(),data:this._colArg===undefined?this._value:this._colArg,isCol:this._colArg!==undefined};
}});
_1.declare("dojox.grid.enhanced.plugins.filter._OperatorExpr",_3._ConditionExpr,{_name:"operator",constructor:function(){
if(_1.isArray(arguments[0])){
this._operands=arguments[0];
}else{
this._operands=[];
for(var i=0;i<arguments.length;++i){
this._operands.push(arguments[i]);
}
}
},toObject:function(){
return {op:this.getName(),data:_1.map(this._operands,function(_c){
return _c.toObject();
})};
}});
_1.declare("dojox.grid.enhanced.plugins.filter._UniOpExpr",_3._OperatorExpr,{_name:"uniOperator",applyRow:function(_d,_e){
if(!(this._operands[0] instanceof _3._ConditionExpr)){
throw new Error("_UniOpExpr: operand is not expression.");
}
return this._calculate(this._operands[0],_d,_e);
},_calculate:function(_f,_10,_11){
throw new Error("_UniOpExpr._calculate: unimplemented interface");
}});
_1.declare("dojox.grid.enhanced.plugins.filter._BiOpExpr",_3._OperatorExpr,{_name:"biOperator",applyRow:function(_12,_13){
if(!(this._operands[0] instanceof _3._ConditionExpr)){
throw new Error("_BiOpExpr: left operand is not expression.");
}else{
if(!(this._operands[1] instanceof _3._ConditionExpr)){
throw new Error("_BiOpExpr: right operand is not expression.");
}
}
return this._calculate(this._operands[0],this._operands[1],_12,_13);
},_calculate:function(_14,_15,_16,_17){
throw new Error("_BiOpExpr._calculate: unimplemented interface");
}});
return _2.grid.enhanced.plugins.filter._ConditionExpr;
});
