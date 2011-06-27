/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/math/random/Simple",["dojo"],function(_1){
_1.declare("dojox.math.random.Simple",null,{destroy:function(){
},nextBytes:function(_2){
for(var i=0,l=_2.length;i<l;++i){
_2[i]=Math.floor(256*Math.random());
}
}});
return dojox.math.random.Simple;
});
