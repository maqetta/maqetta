/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/string/sprintf",["dojo/_base/kernel","./tokenize"],function(_1,_2){
_1.getObject("string",true,dojox);
dojox.string.sprintf=function(_3,_4){
for(var _5=[],i=1;i<arguments.length;i++){
_5.push(arguments[i]);
}
var _6=new dojox.string.sprintf.Formatter(_3);
return _6.format.apply(_6,_5);
};
dojox.string.sprintf.Formatter=function(_7){
var _8=[];
this._mapped=false;
this._format=_7;
this._tokens=_2(_7,this._re,this._parseDelim,this);
};
_1.extend(dojox.string.sprintf.Formatter,{_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,_parseDelim:function(_9,_a,_b,_c,_d,_e,_f){
if(_9){
this._mapped=true;
}
return {mapping:_9,intmapping:_a,flags:_b,_minWidth:_c,period:_d,_precision:_e,specifier:_f};
},_specifiers:{b:{base:2,isInt:true},o:{base:8,isInt:true},x:{base:16,isInt:true},X:{extend:["x"],toUpper:true},d:{base:10,isInt:true},i:{extend:["d"]},u:{extend:["d"],isUnsigned:true},c:{setArg:function(_10){
if(!isNaN(_10.arg)){
var num=parseInt(_10.arg);
if(num<0||num>127){
throw new Error("invalid character code passed to %c in sprintf");
}
_10.arg=isNaN(num)?""+num:String.fromCharCode(num);
}
}},s:{setMaxWidth:function(_11){
_11.maxWidth=(_11.period==".")?_11.precision:-1;
}},e:{isDouble:true,doubleNotation:"e"},E:{extend:["e"],toUpper:true},f:{isDouble:true,doubleNotation:"f"},F:{extend:["f"]},g:{isDouble:true,doubleNotation:"g"},G:{extend:["g"],toUpper:true}},format:function(_12){
if(this._mapped&&typeof _12!="object"){
throw new Error("format requires a mapping");
}
var str="";
var _13=0;
for(var i=0,_14;i<this._tokens.length;i++){
_14=this._tokens[i];
if(typeof _14=="string"){
str+=_14;
}else{
if(this._mapped){
if(typeof _12[_14.mapping]=="undefined"){
throw new Error("missing key "+_14.mapping);
}
_14.arg=_12[_14.mapping];
}else{
if(_14.intmapping){
var _13=parseInt(_14.intmapping)-1;
}
if(_13>=arguments.length){
throw new Error("got "+arguments.length+" printf arguments, insufficient for '"+this._format+"'");
}
_14.arg=arguments[_13++];
}
if(!_14.compiled){
_14.compiled=true;
_14.sign="";
_14.zeroPad=false;
_14.rightJustify=false;
_14.alternative=false;
var _15={};
for(var fi=_14.flags.length;fi--;){
var _16=_14.flags.charAt(fi);
_15[_16]=true;
switch(_16){
case " ":
_14.sign=" ";
break;
case "+":
_14.sign="+";
break;
case "0":
_14.zeroPad=(_15["-"])?false:true;
break;
case "-":
_14.rightJustify=true;
_14.zeroPad=false;
break;
case "#":
_14.alternative=true;
break;
default:
throw Error("bad formatting flag '"+_14.flags.charAt(fi)+"'");
}
}
_14.minWidth=(_14._minWidth)?parseInt(_14._minWidth):0;
_14.maxWidth=-1;
_14.toUpper=false;
_14.isUnsigned=false;
_14.isInt=false;
_14.isDouble=false;
_14.precision=1;
if(_14.period=="."){
if(_14._precision){
_14.precision=parseInt(_14._precision);
}else{
_14.precision=0;
}
}
var _17=this._specifiers[_14.specifier];
if(typeof _17=="undefined"){
throw new Error("unexpected specifier '"+_14.specifier+"'");
}
if(_17.extend){
_1.mixin(_17,this._specifiers[_17.extend]);
delete _17.extend;
}
_1.mixin(_14,_17);
}
if(typeof _14.setArg=="function"){
_14.setArg(_14);
}
if(typeof _14.setMaxWidth=="function"){
_14.setMaxWidth(_14);
}
if(_14._minWidth=="*"){
if(this._mapped){
throw new Error("* width not supported in mapped formats");
}
_14.minWidth=parseInt(arguments[_13++]);
if(isNaN(_14.minWidth)){
throw new Error("the argument for * width at position "+_13+" is not a number in "+this._format);
}
if(_14.minWidth<0){
_14.rightJustify=true;
_14.minWidth=-_14.minWidth;
}
}
if(_14._precision=="*"&&_14.period=="."){
if(this._mapped){
throw new Error("* precision not supported in mapped formats");
}
_14.precision=parseInt(arguments[_13++]);
if(isNaN(_14.precision)){
throw Error("the argument for * precision at position "+_13+" is not a number in "+this._format);
}
if(_14.precision<0){
_14.precision=1;
_14.period="";
}
}
if(_14.isInt){
if(_14.period=="."){
_14.zeroPad=false;
}
this.formatInt(_14);
}else{
if(_14.isDouble){
if(_14.period!="."){
_14.precision=6;
}
this.formatDouble(_14);
}
}
this.fitField(_14);
str+=""+_14.arg;
}
}
return str;
},_zeros10:"0000000000",_spaces10:"          ",formatInt:function(_18){
var i=parseInt(_18.arg);
if(!isFinite(i)){
if(typeof _18.arg!="number"){
throw new Error("format argument '"+_18.arg+"' not an integer; parseInt returned "+i);
}
i=0;
}
if(i<0&&(_18.isUnsigned||_18.base!=10)){
i=4294967295+i+1;
}
if(i<0){
_18.arg=(-i).toString(_18.base);
this.zeroPad(_18);
_18.arg="-"+_18.arg;
}else{
_18.arg=i.toString(_18.base);
if(!i&&!_18.precision){
_18.arg="";
}else{
this.zeroPad(_18);
}
if(_18.sign){
_18.arg=_18.sign+_18.arg;
}
}
if(_18.base==16){
if(_18.alternative){
_18.arg="0x"+_18.arg;
}
_18.arg=_18.toUpper?_18.arg.toUpperCase():_18.arg.toLowerCase();
}
if(_18.base==8){
if(_18.alternative&&_18.arg.charAt(0)!="0"){
_18.arg="0"+_18.arg;
}
}
},formatDouble:function(_19){
var f=parseFloat(_19.arg);
if(!isFinite(f)){
if(typeof _19.arg!="number"){
throw new Error("format argument '"+_19.arg+"' not a float; parseFloat returned "+f);
}
f=0;
}
switch(_19.doubleNotation){
case "e":
_19.arg=f.toExponential(_19.precision);
break;
case "f":
_19.arg=f.toFixed(_19.precision);
break;
case "g":
if(Math.abs(f)<0.0001){
_19.arg=f.toExponential(_19.precision>0?_19.precision-1:_19.precision);
}else{
_19.arg=f.toPrecision(_19.precision);
}
if(!_19.alternative){
_19.arg=_19.arg.replace(/(\..*[^0])0*/,"$1");
_19.arg=_19.arg.replace(/\.0*e/,"e").replace(/\.0$/,"");
}
break;
default:
throw new Error("unexpected double notation '"+_19.doubleNotation+"'");
}
_19.arg=_19.arg.replace(/e\+(\d)$/,"e+0$1").replace(/e\-(\d)$/,"e-0$1");
if(_1.isOpera){
_19.arg=_19.arg.replace(/^\./,"0.");
}
if(_19.alternative){
_19.arg=_19.arg.replace(/^(\d+)$/,"$1.");
_19.arg=_19.arg.replace(/^(\d+)e/,"$1.e");
}
if(f>=0&&_19.sign){
_19.arg=_19.sign+_19.arg;
}
_19.arg=_19.toUpper?_19.arg.toUpperCase():_19.arg.toLowerCase();
},zeroPad:function(_1a,_1b){
_1b=(arguments.length==2)?_1b:_1a.precision;
if(typeof _1a.arg!="string"){
_1a.arg=""+_1a.arg;
}
var _1c=_1b-10;
while(_1a.arg.length<_1c){
_1a.arg=(_1a.rightJustify)?_1a.arg+this._zeros10:this._zeros10+_1a.arg;
}
var pad=_1b-_1a.arg.length;
_1a.arg=(_1a.rightJustify)?_1a.arg+this._zeros10.substring(0,pad):this._zeros10.substring(0,pad)+_1a.arg;
},fitField:function(_1d){
if(_1d.maxWidth>=0&&_1d.arg.length>_1d.maxWidth){
return _1d.arg.substring(0,_1d.maxWidth);
}
if(_1d.zeroPad){
this.zeroPad(_1d,_1d.minWidth);
return;
}
this.spacePad(_1d);
},spacePad:function(_1e,_1f){
_1f=(arguments.length==2)?_1f:_1e.minWidth;
if(typeof _1e.arg!="string"){
_1e.arg=""+_1e.arg;
}
var _20=_1f-10;
while(_1e.arg.length<_20){
_1e.arg=(_1e.rightJustify)?_1e.arg+this._spaces10:this._spaces10+_1e.arg;
}
var pad=_1f-_1e.arg.length;
_1e.arg=(_1e.rightJustify)?_1e.arg+this._spaces10.substring(0,pad):this._spaces10.substring(0,pad)+_1e.arg;
}});
return dojox.string.sprintf;
});
