/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojo/_base/json",["./kernel","../json"],function(_1,_2){
_1.fromJson=function(js){
return eval("("+js+")");
};
_1._escapeString=_2.stringify;
_1.toJsonIndentStr="\t";
_1.toJson=function(it,_3,_4){
return _2.stringify(it,function(_5,_6){
if(_6){
var tf=_6.__json__||_6.json;
if(typeof tf=="function"){
return tf.call(_6);
}
}
return _6;
},_3&&_1.toJsonIndentStr);
};
return _1;
});
