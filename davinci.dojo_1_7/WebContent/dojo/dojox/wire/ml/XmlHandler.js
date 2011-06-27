/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/wire/ml/XmlHandler",["dojo","dijit","dojox","dojox/wire/ml/RestHandler","dojox/xml/parser","dojox/wire/_base","dojox/wire/ml/util"],function(_1,_2,_3){
_1.getObject("dojox.wire.ml.XmlHandler",1);
_1.declare("dojox.wire.ml.XmlHandler",_3.wire.ml.RestHandler,{contentType:"text/xml",handleAs:"xml",_getContent:function(_4,_5){
var _6=null;
if(_4=="POST"||_4=="PUT"){
var p=_5[0];
if(p){
if(_1.isString(p)){
_6=p;
}else{
var _7=p;
if(_7 instanceof _3.wire.ml.XmlElement){
_7=_7.element;
}else{
if(_7.nodeType===9){
_7=_7.documentElement;
}
}
var _8="<?xml version=\"1.0\"?>";
_6=_8+_3.xml.parser.innerXML(_7);
}
}
}
return _6;
},_getResult:function(_9){
if(_9){
_9=new _3.wire.ml.XmlElement(_9);
}
return _9;
}});
return _1.getObject("dojox.wire.ml.XmlHandler");
});
require(["dojox/wire/ml/XmlHandler"]);
