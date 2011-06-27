/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/lang/functional/lambda",["../..","dojo/_base/kernel","dojo/_base/array"],function(_1,_2){
var df=_2.getObject("lang.functional",true,_1);
var _3={};
var _4="ab".split(/a*/).length>1?String.prototype.split:function(_5){
var r=this.split.call(this,_5),m=_5.exec(this);
if(m&&m.index==0){
r.unshift("");
}
return r;
};
var _6=function(s){
var _7=[],_8=_4.call(s,/\s*->\s*/m);
if(_8.length>1){
while(_8.length){
s=_8.pop();
_7=_8.pop().split(/\s*,\s*|\s+/m);
if(_8.length){
_8.push("(function("+_7+"){return ("+s+")})");
}
}
}else{
if(s.match(/\b_\b/)){
_7=["_"];
}else{
var l=s.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m),r=s.match(/[+\-*\/%&|\^\.=<>!]\s*$/m);
if(l||r){
if(l){
_7.push("$1");
s="$1"+s;
}
if(r){
_7.push("$2");
s=s+"$2";
}
}else{
var _9=s.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*:|this|true|false|null|undefined|typeof|instanceof|in|delete|new|void|arguments|decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|escape|eval|isFinite|isNaN|parseFloat|parseInt|unescape|dojo|dijit|dojox|window|document|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g,"").match(/([a-z_$][a-z_$\d]*)/gi)||[],t={};
_2.forEach(_9,function(v){
if(!(v in t)){
_7.push(v);
t[v]=1;
}
});
}
}
}
return {args:_7,body:s};
};
var _a=function(a){
return a.length?function(){
var i=a.length-1,x=df.lambda(a[i]).apply(this,arguments);
for(--i;i>=0;--i){
x=df.lambda(a[i]).call(this,x);
}
return x;
}:function(x){
return x;
};
};
_2.mixin(df,{rawLambda:function(s){
return _6(s);
},buildLambda:function(s){
s=_6(s);
return "function("+s.args.join(",")+"){return ("+s.body+");}";
},lambda:function(s){
if(typeof s=="function"){
return s;
}
if(s instanceof Array){
return _a(s);
}
if(s in _3){
return _3[s];
}
s=_6(s);
return _3[s]=new Function(s.args,"return ("+s.body+");");
},clearLambdaCache:function(){
_3={};
}});
return df;
});
