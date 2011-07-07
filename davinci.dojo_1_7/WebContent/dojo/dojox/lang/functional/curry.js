/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/lang/functional/lambda"],function(_1,_2,_3){
_1.getObject("dojox.lang.functional.curry",1);
(function(){
var df=_3.lang.functional,ap=Array.prototype;
var _4=function(_5){
return function(){
var _6=_5.args.concat(ap.slice.call(arguments,0));
if(arguments.length+_5.args.length<_5.arity){
return _4({func:_5.func,arity:_5.arity,args:_6});
}
return _5.func.apply(this,_6);
};
};
_1.mixin(df,{curry:function(f,_7){
f=df.lambda(f);
_7=typeof _7=="number"?_7:f.length;
return _4({func:f,arity:_7,args:[]});
},arg:{},partial:function(f){
var a=arguments,l=a.length,_8=new Array(l-1),p=[],i=1,t;
f=df.lambda(f);
for(;i<l;++i){
t=a[i];
_8[i-1]=t;
if(t===df.arg){
p.push(i-1);
}
}
return function(){
var t=ap.slice.call(_8,0),i=0,l=p.length;
for(;i<l;++i){
t[p[i]]=arguments[i];
}
return f.apply(this,t);
};
},mixer:function(f,_9){
f=df.lambda(f);
return function(){
var t=new Array(_9.length),i=0,l=_9.length;
for(;i<l;++i){
t[i]=arguments[_9[i]];
}
return f.apply(this,t);
};
},flip:function(f){
f=df.lambda(f);
return function(){
var a=arguments,l=a.length-1,t=new Array(l+1),i=0;
for(;i<=l;++i){
t[l-i]=a[i];
}
return f.apply(this,t);
};
}});
})();
return _1.getObject("dojox.lang.functional.curry");
});
require(["dojox/lang/functional/curry"]);
