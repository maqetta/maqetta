/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/app/bind",["dojo","dijit"],function(_1,_2){
return function(_3,_4){
_1.forEach(_3,function(_5){
var _6=_1.query("div[dojoType^=\"dojox.mvc\"],div[data-dojo-type^=\"dojox.mvc\"]",_5.domNode);
_1.forEach(_6,function(_7){
var _8=_7.getAttribute("ref");
if(_8===null){
var _9=_7.getAttribute("data-dojo-props");
if(_9){
_8=_9.replace(/^\s*ref\s*:\s*/,"");
}
}
if(_8){
_8=_8.substring(1,_8.length-1);
var _a=_1.getObject(_8,false,_4);
if(_a){
_2.byNode(_7).set("ref",_a);
}
}
},this);
},this);
};
});
