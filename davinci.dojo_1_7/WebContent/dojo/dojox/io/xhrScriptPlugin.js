/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/io/xhrScriptPlugin",["dojo/_base/window","dojo/io/script","dojox/io/xhrPlugins","dojox/io/scriptFrame"],function(_1,_2,_3,_4){
    try{
_1.getObject("io.xhrScriptPlugin",true,dojox);
    } catch(e){
        // this was added to catch a undefined method exception at load time, this seems to be fixed in later builds on 1.7
    }

dojox.io.xhrScriptPlugin=function(_5,_6,_7){
_3.register("script",function(_8,_9){
return _9.sync!==true&&(_8=="GET"||_7)&&(_9.url.substring(0,_5.length)==_5); 
},function(_a,_b,_c){
var _d=function(){
_b.callbackParamName=_6;
if(_1.body()){
_b.frameDoc="frame"+Math.random();
}
return _2.get(_b);
};
return (_7?_7(_d,true):_d)(_a,_b,_c);
});
};
return dojox.io.xhrScriptPlugin;
});
