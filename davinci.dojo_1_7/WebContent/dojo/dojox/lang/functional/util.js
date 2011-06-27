/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/lang/functional/util",["dojo","dijit","dojox","dojox/lang/functional/lambda"],function(_1,_2,_3){
_1.getObject("dojox.lang.functional.util",1);
(function(){
var df=_3.lang.functional;
_1.mixin(df,{inlineLambda:function(_4,_5,_6){
var s=df.rawLambda(_4);
if(_6){
df.forEach(s.args,_6);
}
var ap=typeof _5=="string",n=ap?s.args.length:Math.min(s.args.length,_5.length),a=new Array(4*n+4),i,j=1;
for(i=0;i<n;++i){
a[j++]=s.args[i];
a[j++]="=";
a[j++]=ap?_5+"["+i+"]":_5[i];
a[j++]=",";
}
a[0]="(";
a[j++]="(";
a[j++]=s.body;
a[j]="))";
return a.join("");
}});
})();
return _1.getObject("dojox.lang.functional.util");
});
require(["dojox/lang/functional/util"]);
