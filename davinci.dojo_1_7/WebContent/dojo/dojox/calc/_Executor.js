/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/calc/_Executor",["dojo","dijit/_Templated","dojox/math/_base"],function(_1){
_1.experimental("dojox.calc._Executor");
_1.getObject("calc",true,dojox);
var _2;
if(!("pow" in dojox.calc)){
dojox.calc.pow=function(_3,_4){
function _5(n){
return Math.floor(n)==n;
};
if(_3>=0||_5(_4)){
return Math.pow(_3,_4);
}else{
var _6=1/_4;
return (_5(_6)&&(_6&1))?-Math.pow(-_3,_4):NaN;
}
};
}
_1.declare("dojox.calc._Executor",[dijit._Widget,dijit._Templated],{templateString:"<iframe src=\""+_1.moduleUrl("dojox.calc","_ExecutorIframe.html")+"\" style=\"display:none;\" onload=\"if(arguments[0] && arguments[0].Function)"+dijit._scopeName+".byNode(this)._onLoad(arguments[0])\"></iframe>",_onLoad:function(_7){
_2=_7;
_7.outerPrompt=window.prompt;
_7.dojox={math:{}};
for(var f in dojox.math){
_7.dojox.math[f]=_1.hitch(dojox.math,f);
}
if("toFrac" in dojox.calc){
_7.toFracCall=_1.hitch(dojox.calc,"toFrac");
this.Function("toFrac","x","return toFracCall(x)");
}
_7.isJavaScriptLanguage=_1.number.format(1.5,{pattern:"#.#"})=="1.5";
_7.Ans=0;
_7.pi=Math.PI;
_7.eps=Math.E;
_7.powCall=_1.hitch(dojox.calc,"pow");
this.normalizedFunction("sqrt","x","return Math.sqrt(x)");
this.normalizedFunction("sin","x","return Math.sin(x)");
this.normalizedFunction("cos","x","return Math.cos(x)");
this.normalizedFunction("tan","x","return Math.tan(x)");
this.normalizedFunction("asin","x","return Math.asin(x)");
this.normalizedFunction("acos","x","return Math.acos(x)");
this.normalizedFunction("atan","x","return Math.atan(x)");
this.normalizedFunction("atan2","y, x","return Math.atan2(y, x)");
this.normalizedFunction("Round","x","return Math.round(x)");
this.normalizedFunction("Int","x","return Math.floor(x)");
this.normalizedFunction("Ceil","x","return Math.ceil(x)");
this.normalizedFunction("ln","x","return Math.log(x)");
this.normalizedFunction("log","x","return Math.log(x)/Math.log(10)");
this.normalizedFunction("pow","x, y","return powCall(x,y)");
this.normalizedFunction("permutations","n, r","return dojox.math.permutations(n, r);");
this.normalizedFunction("P","n, r","return dojox.math.permutations(n, r);");
this.normalizedFunction("combinations","n, r","return dojox.math.combinations(n, r);");
this.normalizedFunction("C","n, r","return dojox.math.combinations(n, r)");
this.normalizedFunction("toRadix","number, baseOut","if(!baseOut){ baseOut = 10; } if(typeof number == 'string'){ number = parseFloat(number); }return number.toString(baseOut);");
this.normalizedFunction("toBin","number","return toRadix(number, 2)");
this.normalizedFunction("toOct","number","return toRadix(number, 8)");
this.normalizedFunction("toHex","number","return toRadix(number, 16)");
this.onLoad();
},onLoad:function(){
},Function:function(_8,_9,_a){
return _1.hitch(_2,_2.Function.apply(_2,arguments));
},normalizedFunction:function(_b,_c,_d){
return _1.hitch(_2,_2.normalizedFunction.apply(_2,arguments));
},deleteFunction:function(_e){
_2[_e]=undefined;
delete _2[_e];
},eval:function(_f){
return _2.eval.apply(_2,arguments);
},destroy:function(){
this.inherited(arguments);
_2=null;
}});
var _10=(1<<30)-35;
_1.mixin(dojox.calc,{approx:function(r){
if(typeof r=="number"){
return Math.round(r*_10)/_10;
}
return r;
}});
return dojox.calc._Executor;
});
